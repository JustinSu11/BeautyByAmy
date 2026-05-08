import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { bookings, customers, waivers, waiverTokens } from '@/db/schema'
import { CURRENT_WAIVER_VERSION } from '@/lib/auth'
import { upsertSquareCustomer, saveCardOnFile, createSquareAppointment } from '@/lib/square'
import { eq, and, gt } from 'drizzle-orm'
import { z } from 'zod'

const Schema = z.object({
  sourceId: z.string(),
  name: z.string().min(2),
  phone: z.string().min(7),
  email: z.string().email(),
  serviceVariationId: z.string(),
  teamMemberId: z.string(),
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
    teamMemberId,
    startsAt,
    durationMinutes,
    serviceId,
    requiresWaiver,
  } = parsed.data

  // Upsert Square customer and local customer record
  let squareCustomerId: string
  let customerId: string
  try {
    const result = await upsertSquareCustomer(phone, email, name)
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
    squareBookingId = await createSquareAppointment({
      squareCustomerId,
      serviceVariationId,
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

  return NextResponse.json({ ok: true, bookingId: booking.id, needsWaiver })
}
