// apps/web/src/lib/square.ts
import { SquareClient, SquareEnvironment } from 'square'
import type { Service } from './services-data'
import { inferMetadata } from './services-data'

/** IANA timezone for the business location (Mobile, AL = Central time). */
const BUSINESS_TZ = 'America/Chicago'

/** Convert a UTC ISO string to HH:mm (24h) in the business timezone. */
function toBusinessHHMM(utcIso: string): string {
  const formatted = new Intl.DateTimeFormat('en-US', {
    timeZone: BUSINESS_TZ,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(utcIso))
  // Guard: some runtimes return "24:xx" for midnight — normalise to "00:xx"
  return formatted.replace(/^24:/, '00:')
}

/** Return the day-of-month (1–31) for a UTC ISO string in the business timezone. */
function toBusinessDay(utcIso: string): number {
  return Number(
    new Intl.DateTimeFormat('en-US', { timeZone: BUSINESS_TZ, day: 'numeric' }).format(
      new Date(utcIso)
    )
  )
}

/** Return the month index (0 = January) for a UTC ISO string in the business timezone. */
function toBusinessMonth(utcIso: string): number {
  return (
    Number(
      new Intl.DateTimeFormat('en-US', { timeZone: BUSINESS_TZ, month: 'numeric' }).format(
        new Date(utcIso)
      )
    ) - 1
  )
}

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

// ─── Availability ─────────────────────────────────────────────────────────────

/**
 * A bookable time slot returned by Square's SearchAvailability API.
 * `time`    — HH:mm in the business timezone, used for display.
 * `startAt` — UTC ISO string from Square, used directly as the booking startAt.
 */
export interface SquareTimeSlot {
  time: string
  startAt: string
}

/**
 * Return the set of day-of-month numbers that have at least one bookable slot
 * for the given service in the requested month.
 *
 * Uses `Date.UTC` for unambiguous UTC boundaries, then filters each returned
 * availability by business-timezone day so edge cases around DST / TZ offset
 * are handled correctly regardless of the server's local timezone.
 */
export async function fetchAvailableDaysInMonth(
  serviceVariationId: string,
  year: number,
  month: number, // 0-indexed (0 = January)
): Promise<number[]> {
  const teamMemberId = await getPrimaryTeamMemberId()

  // Wide UTC window covering the full calendar month plus a day of buffer on
  // each side so we never miss a business-timezone slot near a month boundary.
  const startAt = new Date(Date.UTC(year, month, 1)).toISOString()
  const endAt = new Date(Date.UTC(year, month + 1, 2)).toISOString()

  const response = await getClient().bookings.searchAvailability({
    query: {
      filter: {
        startAtRange: { startAt, endAt },
        locationId: process.env.SQUARE_LOCATION_ID!,
        segmentFilters: [
          {
            serviceVariationId,
            teamMemberIdFilter: { any: [teamMemberId] },
          },
        ],
      },
    },
  })

  const days = new Set<number>()
  for (const avail of response.availabilities ?? []) {
    if (!avail.startAt) continue
    if (toBusinessMonth(avail.startAt) === month) {
      days.add(toBusinessDay(avail.startAt))
    }
  }

  return Array.from(days).sort((a, b) => a - b)
}

/**
 * Return all available time slots for a specific date.
 * Slots are sorted chronologically and filtered to the business timezone day.
 */
export async function fetchAvailableSlotsForDay(
  serviceVariationId: string,
  year: number,
  month: number, // 0-indexed
  day: number,
): Promise<SquareTimeSlot[]> {
  const teamMemberId = await getPrimaryTeamMemberId()

  // Central time is UTC-5 (CDT) to UTC-6 (CST). A salon day running 9 AM–8 PM
  // Central spans from 14:00 UTC to 02:00 UTC next day. Querying two full UTC
  // days and filtering by business-timezone day captures every possible slot.
  const startAt = new Date(Date.UTC(year, month, day)).toISOString()
  const endAt = new Date(Date.UTC(year, month, day + 2)).toISOString()

  const response = await getClient().bookings.searchAvailability({
    query: {
      filter: {
        startAtRange: { startAt, endAt },
        locationId: process.env.SQUARE_LOCATION_ID!,
        segmentFilters: [
          {
            serviceVariationId,
            teamMemberIdFilter: { any: [teamMemberId] },
          },
        ],
      },
    },
  })

  const slots: SquareTimeSlot[] = []
  for (const avail of response.availabilities ?? []) {
    if (!avail.startAt) continue
    if (toBusinessDay(avail.startAt) === day && toBusinessMonth(avail.startAt) === month) {
      slots.push({ time: toBusinessHHMM(avail.startAt), startAt: avail.startAt })
    }
  }

  return slots.sort((a, b) => a.time.localeCompare(b.time))
}
