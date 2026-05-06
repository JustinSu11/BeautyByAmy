// apps/web/src/lib/square.ts
import { SquareClient, SquareEnvironment } from 'square'

const environment =
  process.env.NODE_ENV === 'production'
    ? SquareEnvironment.Production
    : SquareEnvironment.Sandbox

export const squareClient = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN!,
  environment,
})

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
  const searchResult = await squareClient.customers.search({
    query: { filter: { phoneNumber: { exact: phone } } },
  })

  if (searchResult.customers && searchResult.customers.length > 0) {
    return { squareCustomerId: searchResult.customers[0].id! }
  }

  const parts = name.trim().split(' ')
  const createResult = await squareClient.customers.create({
    phoneNumber: phone,
    emailAddress: email,
    givenName: parts[0],
    familyName: parts.slice(1).join(' ') || '',
    referenceId: 'bba-web',
  })

  return { squareCustomerId: createResult.customer!.id! }
}

/**
 * Save a tokenized card (from Square Web Payments SDK) to a Square customer profile.
 * Amy can charge this card for no-shows and late cancellations from her Square dashboard.
 */
export async function saveCardOnFile(
  squareCustomerId: string,
  sourceId: string
): Promise<string> {
  const result = await squareClient.cards.create({
    idempotencyKey: crypto.randomUUID(),
    sourceId,
    card: {
      customerId: squareCustomerId,
    },
  })
  return result.card!.id!
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
  const result = await squareClient.bookings.create({
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
  return result.booking!.id!
}

/**
 * Append a note to a Square customer profile.
 * Used to record waiver signatures visible in Amy's Square dashboard.
 */
export async function appendCustomerNote(
  squareCustomerId: string,
  note: string
): Promise<void> {
  const getResult = await squareClient.customers.get({ customerId: squareCustomerId })
  const existing = getResult.customer?.note ?? ''
  const updated = existing ? `${existing}\n${note}` : note
  const version = getResult.customer?.version
  await squareClient.customers.update({
    customerId: squareCustomerId,
    note: updated,
    ...(version !== undefined && { version }),
  })
}
