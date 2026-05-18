// apps/web/src/lib/square.ts
import { SquareClient, SquareEnvironment } from 'square'
import type { Service } from './services-data'
import { inferMetadata } from './services-data'

const environment =
  process.env.NODE_ENV === 'production'
    ? SquareEnvironment.Production
    : SquareEnvironment.Sandbox

// Lazy singleton — instantiated on first use rather than at module load time.
// This prevents a missing SQUARE_ACCESS_TOKEN from crashing the module import
// (which would cause an unrecoverable Server Component error before any
// .catch() handler can run).
let _client: SquareClient | null = null

function getClient(): SquareClient {
  if (!_client) {
    _client = new SquareClient({
      token: process.env.SQUARE_ACCESS_TOKEN ?? '',
      environment,
    })
  }
  return _client
}

// In-memory caches — server process lifetime, shared across all requests.
// Services TTL matches the /api/services ISR window so they stay in sync.
let _teamMemberId: string | null = null
let _servicesCache: { data: Service[]; fetchedAt: number } | null = null
const SERVICES_TTL_MS = 3_600_000 // 1 hour

export async function getPrimaryTeamMemberId(): Promise<string> {
  if (_teamMemberId) return _teamMemberId
  const result = await getClient().teamMembers.search({
    query: { filter: { locationIds: [process.env.SQUARE_LOCATION_ID!], status: 'ACTIVE' } },
  })
  const id = result.teamMembers?.[0]?.id
  if (!id) throw new Error('No active Square team members found for this location')
  _teamMemberId = id
  return id
}

export interface SquareCustomerResult {
  squareCustomerId: string
}

/**
 * Find an existing Square customer by phone or create a new one.
 * Phone is the primary identifier since it's what we verify via OTP.
 */
export async function upsertSquareCustomer(
  phone: string,
  email: string,
  name: string
): Promise<SquareCustomerResult> {
  const client = getClient()
  const searchResult = await client.customers.search({
    query: { filter: { phoneNumber: { exact: phone } } },
  })

  if (searchResult.customers && searchResult.customers.length > 0) {
    const id = searchResult.customers[0].id
    if (!id) throw new Error('Square returned a customer with no ID')
    return { squareCustomerId: id }
  }

  const parts = name.trim().split(' ')
  const createResult = await client.customers.create({
    phoneNumber: phone,
    emailAddress: email,
    givenName: parts[0],
    familyName: parts.slice(1).join(' ') || '',
    referenceId: 'bba-web',
  })

  const id = createResult.customer?.id
  if (!id) throw new Error('Square customer creation returned no customer ID')
  return { squareCustomerId: id }
}

/**
 * Save a tokenized card (from Square Web Payments SDK) to a Square customer profile.
 * Amy can charge this card for no-shows and late cancellations from her Square dashboard.
 */
export async function saveCardOnFile(
  squareCustomerId: string,
  sourceId: string
): Promise<string> {
  const result = await getClient().cards.create({
    idempotencyKey: crypto.randomUUID(),
    sourceId,
    card: { customerId: squareCustomerId },
  })
  const cardId = result.card?.id
  if (!cardId) throw new Error('Square card creation returned no card ID')
  return cardId
}

/**
 * Create an appointment in Square Appointments.
 * serviceVariationId and teamMemberId come from Amy's Square Appointments catalog.
 */
export async function createSquareAppointment(params: {
  squareCustomerId: string
  serviceVariationId: string
  serviceVariationVersion?: bigint
  teamMemberId: string
  startsAt: string
  durationMinutes: number
}): Promise<string> {
  const result = await getClient().bookings.create({
    idempotencyKey: crypto.randomUUID(),
    booking: {
      locationId: process.env.SQUARE_LOCATION_ID!,
      customerId: params.squareCustomerId,
      startAt: params.startsAt,
      appointmentSegments: [
        {
          serviceVariationId: params.serviceVariationId,
          serviceVariationVersion: params.serviceVariationVersion,
          teamMemberId: params.teamMemberId,
          durationMinutes: params.durationMinutes,
        },
      ],
    },
  })
  const bookingId = result.booking?.id
  if (!bookingId) throw new Error('Square appointment creation returned no booking ID')
  return bookingId
}

/**
 * Search Square customers by name (case-insensitive partial match).
 * Pages through up to 200 customers and filters locally — sufficient for a
 * small beauty salon; Square's search API doesn't natively filter by name.
 */
export async function searchSquareCustomersByName(
  query: string
): Promise<Array<{ id: string; name: string; email?: string; phone?: string }>> {
  if (query.trim().length < 2) return []

  const q = query.trim().toLowerCase()
  const results: Array<{ id: string; name: string; email?: string; phone?: string }> = []
  let cursor: string | undefined

  // Fetch up to 2 pages (200 customers) — more than enough for a beauty salon.
  // The SDK's Page type uses hasNextPage() / getNextPage() rather than a cursor field.
  let page = await getClient().customers.list({ limit: 100 })
  for (let i = 0; i < 2; i++) {
    for (const c of page.data ?? []) {
      if (!c.id) continue
      const full = [c.givenName, c.familyName].filter(Boolean).join(' ')
      if (full.toLowerCase().includes(q)) {
        results.push({
          id:    c.id,
          name:  full,
          email: c.emailAddress ?? undefined,
          phone: c.phoneNumber  ?? undefined,
        })
      }
    }
    if (!page.hasNextPage()) break
    page = await page.getNextPage()
  }

  return results
}

/**
 * Append a note to a Square customer profile.
 * Used to record waiver signatures visible in Amy's Square dashboard.
 */
export async function appendCustomerNote(
  squareCustomerId: string,
  note: string
): Promise<void> {
  const client = getClient()
  const getResult = await client.customers.get({ customerId: squareCustomerId })
  const existing = getResult.customer?.note ?? ''
  const updated = existing ? `${existing}\n${note}` : note
  const version = getResult.customer?.version
  await client.customers.update({
    customerId: squareCustomerId,
    note: updated,
    ...(version !== undefined && { version }),
  })
}

/**
 * Fetch bookable services from the Square catalog.
 * Results are cached in-process for 1 hour so repeat calls (e.g. homepage + booking page
 * in the same server process) are instant after the first fetch.
 *
 * Each returned Service's `id` is the Square variation ID and `variationVersion` is the
 * catalog object version required by the Square Bookings API for optimistic locking.
 */
export async function fetchSquareServices(): Promise<Service[]> {
  if (_servicesCache && Date.now() - _servicesCache.fetchedAt < SERVICES_TTL_MS) {
    return _servicesCache.data
  }

  const page = await getClient().catalog.list({ types: 'ITEM' })
  const objects = page.data
  if (!objects || objects.length === 0) return []

  const result: Service[] = []

  for (const item of objects) {
    if (item.type !== 'ITEM' || !item.itemData?.variations) continue
    for (const rawVariation of item.itemData.variations) {
      // Narrow to ITEM_VARIATION — catalog list with types='ITEM' includes nested variations
      if (rawVariation.type !== 'ITEM_VARIATION') continue
      const variation = rawVariation
      const dur = variation.itemVariationData?.serviceDuration
      if (!dur) continue // not a bookable service
      const id = variation.id
      if (!id) continue
      const name = item.itemData.name ?? variation.itemVariationData?.name ?? 'Service'
      const priceAmount = variation.itemVariationData?.priceMoney?.amount
      const price = priceAmount ? Number(priceAmount) / 100 : 0
      const duration = Number(dur) / 60000 // ms → minutes
      // Serialize BigInt as string — JSON.stringify throws on BigInt values
      const variationVersion = (variation.version ?? BigInt(0)).toString()
      result.push({ id, name, duration, price, variationVersion, ...inferMetadata(name) })
    }
  }

  const data = result.sort((a, b) => a.name.localeCompare(b.name))
  _servicesCache = { data, fetchedAt: Date.now() }
  return data
}
