// apps/web/src/app/api/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { bookings, waivers, waiverTokens } from '@/db/schema'
import { getSession, CURRENT_WAIVER_VERSION } from '@/lib/auth'
import { saveCardOnFile, createSquareAppointment } from '@/lib/square'
import { eq, and, gt } from 'drizzle-orm'
import { z } from 'zod'

const Schema = z.object({
  sourceId: z.string(),
  serviceVariationId: z.string(),
  teamMemberId: z.string(),
  startsAt: z.string(),
  durationMinutes: z.number().int().positive(),
  serviceId: z.string(),
  requiresWaiver: z.boolean(),
})

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session.customerId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const parsed = Schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const {
    sourceId,
    serviceVariationId,
    teamMemberId,
    startsAt,
    durationMinutes,
    serviceId,
    requiresWaiver,
  } = parsed.data

  // Save card on file to Square — Amy can charge this for no-shows
  try {
    await saveCardOnFile(session.squareCustomerId, sourceId)
  } catch (err) {
    console.error('[bookings] saveCardOnFile failed', { squareCustomerId: session.squareCustomerId, err })
    return NextResponse.json(
      { error: 'Unable to save your card. Please check your card details and try again.' },
      { status: 402 }
    )
  }

  // Create appointment in Square (shows on Amy's calendar)
  let squareBookingId: string
  try {
    squareBookingId = await createSquareAppointment({
      squareCustomerId: session.squareCustomerId,
      serviceVariationId,
      teamMemberId,
      startsAt,
      durationMinutes,
    })
  } catch (err) {
    console.error('[bookings] createSquareAppointment failed', { squareCustomerId: session.squareCustomerId, err })
    return NextResponse.json(
      { error: 'Unable to create your appointment. Please try again or contact us directly.' },
      { status: 502 }
    )
  }

  // Check if this customer already has a signed waiver for the current version
  let needsWaiver = false
  if (requiresWaiver) {
    const [existingWaiver] = await db
      .select()
      .from(waivers)
      .where(
        and(
          eq(waivers.customerId, session.customerId),
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
        customerId: session.customerId,
        serviceId,
        startsAt: new Date(startsAt),
        requiresWaiver: needsWaiver,
      })
      .returning()

    if (!inserted) {
      return NextResponse.json({ error: 'Booking insert failed' }, { status: 500 })
    }
    booking = inserted

    // If waiver needed, create a single-use token for the reminder SMS link
    if (needsWaiver) {
      const expiresAt = new Date(startsAt) // token valid until appointment time
      await db.insert(waiverTokens).values({
        customerId: session.customerId,
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
