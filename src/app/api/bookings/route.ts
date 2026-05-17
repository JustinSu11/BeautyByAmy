import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { bookings, customers, waivers, waiverTokens } from '@/db/schema'
import { CURRENT_WAIVER_VERSION } from '@/lib/waiver-config'
import { upsertSquareCustomer, saveCardOnFile, createSquareAppointment, getPrimaryTeamMemberId } from '@/lib/square'
import { sendWaiverEmail } from '@/lib/email'
import { inferMetadata } from '@/lib/services-data'
import { eq, and, gt } from 'drizzle-orm'
import { z } from 'zod'

/** Normalize any US phone number to E.164 (+1XXXXXXXXXX) required by Square. */
function toE164(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  return `+${digits}` // best-effort for already-international numbers
}

const Schema = z.object({
  sourceId: z.string(),
  name: z.string().min(2),
  phone: z.string().min(7),
  email: z.string().email(),
  serviceVariationId: z.string(),
  serviceVariationVersion: z.string(), // BigInt serialized as string
  serviceName: z.string(),
  startsAt: z.string(),
  durationMinutes: z.number().int().positive(),
  serviceId: z.string(),
  requiresWaiver: z.boolean(),
})

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const parsed = Schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const {
    sourceId,
    name,
    phone,
    email,
    serviceVariationId,
    serviceVariationVersion,
    serviceName,
    startsAt,
    durationMinutes,
    serviceId,
    requiresWaiver,
  } = parsed.data

  const serviceMeta = inferMetadata(serviceName)

  // Upsert Square customer and local customer record
  let squareCustomerId: string
  let customerId: string
  try {
    const result = await upsertSquareCustomer(toE164(phone), email, name)
    squareCustomerId = result.squareCustomerId

    const [customer] = await db
      .insert(customers)
      .values({ squareCustomerId, email, name, phone })
      .onConflictDoUpdate({
        target: customers.squareCustomerId,
        set: { email, name, phone },
      })
      .returning()
    customerId = customer.id
  } catch (err) {
    console.error('[bookings] Customer upsert failed', { phone, err })
    return NextResponse.json({ error: 'Unable to create customer profile. Please try again.' }, { status: 500 })
  }

  // Save card on file to Square — Amy can charge this for no-shows
  try {
    await saveCardOnFile(squareCustomerId, sourceId)
  } catch (err) {
    console.error('[bookings] saveCardOnFile failed', { squareCustomerId, err })
    return NextResponse.json(
      { error: 'Unable to save your card. Please check your card details and try again.' },
      { status: 402 }
    )
  }

  // Create appointment in Square (shows on Amy's calendar)
  let squareBookingId: string
  try {
    const teamMemberId = await getPrimaryTeamMemberId()
    squareBookingId = await createSquareAppointment({
      squareCustomerId,
      serviceVariationId,
      serviceVariationVersion: BigInt(serviceVariationVersion),
      teamMemberId,
      startsAt,
      durationMinutes,
    })
  } catch (err) {
    console.error('[bookings] createSquareAppointment failed', { squareCustomerId, err })
    return NextResponse.json(
      { error: 'Unable to create your appointment. Please try again or contact us directly.' },
      { status: 502 }
    )
  }

  // Check if this customer already has a valid unexpired waiver for the current version
  let needsWaiver = false
  let hasPriorWaiver = false
  if (requiresWaiver) {
    const [existingWaiver] = await db
      .select()
      .from(waivers)
      .where(
        and(
          eq(waivers.customerId, customerId),
          eq(waivers.waiverVersion, CURRENT_WAIVER_VERSION),
          gt(waivers.expiresAt, new Date())
        )
      )
      .limit(1)
    needsWaiver = !existingWaiver
    hasPriorWaiver = !!existingWaiver
  }

  // Create local booking record and waiver token if needed
  let booking: typeof bookings.$inferSelect
  try {
    const [inserted] = await db
      .insert(bookings)
      .values({
        squareBookingId,
        customerId,
        serviceId,
        startsAt: new Date(startsAt),
        requiresWaiver: needsWaiver,
        waiverSentAt: null,
      })
      .returning()

    if (!inserted) {
      return NextResponse.json({ error: 'Booking insert failed' }, { status: 500 })
    }
    booking = inserted

    if (needsWaiver) {
      const expiresAt = new Date(startsAt)
      await db.insert(waiverTokens).values({
        customerId,
        bookingId: booking.id,
        expiresAt,
      })
    }
  } catch (err) {
    console.error('[bookings] DB insert failed', { squareBookingId, err })
    return NextResponse.json({ error: 'Booking created but could not be saved. Please contact us.' }, { status: 500 })
  }

  // Send waiver PDF email if this booking requires one
  if (needsWaiver) {
    try {
      const appointmentDate = new Date(startsAt).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })

      // PMU services: send re-consent if client has a prior waiver, otherwise full consent
      const waiverKey =
        serviceMeta.category === 'permanent-makeup'
          ? hasPriorWaiver ? 'reconsent' : 'pmu'
          : 'lash'

      await sendWaiverEmail({ to: email, clientName: name, serviceName, appointmentDate, waiverKey })

      await db
        .update(bookings)
        .set({ waiverSentAt: new Date() })
        .where(eq(bookings.id, booking.id))
    } catch (err) {
      // Non-fatal: booking is confirmed; log and continue
      console.error('[bookings] Waiver email failed', { bookingId: booking.id, err })
    }
  }

  return NextResponse.json({ ok: true, bookingId: booking.id, needsWaiver })
}
