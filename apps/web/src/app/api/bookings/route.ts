// apps/web/src/app/api/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { bookings, waivers, waiverTokens } from '@/db/schema'
import { getSession, CURRENT_WAIVER_VERSION } from '@/lib/auth'
import { saveCardOnFile, createSquareAppointment } from '@/lib/square'
import { eq, and } from 'drizzle-orm'
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
  await saveCardOnFile(session.squareCustomerId, sourceId)

  // Create appointment in Square (shows on Amy's calendar)
  const squareBookingId = await createSquareAppointment({
    squareCustomerId: session.squareCustomerId,
    serviceVariationId,
    teamMemberId,
    startsAt,
    durationMinutes,
  })

  // Check if this customer already has a signed waiver for the current version
  let needsWaiver = false
  if (requiresWaiver) {
    const [existingWaiver] = await db
      .select()
      .from(waivers)
      .where(
        and(
          eq(waivers.customerId, session.customerId),
          eq(waivers.waiverVersion, CURRENT_WAIVER_VERSION)
        )
      )
      .limit(1)
    needsWaiver = !existingWaiver
  }

  // Create local booking record
  const [booking] = await db
    .insert(bookings)
    .values({
      squareBookingId,
      customerId: session.customerId,
      serviceId,
      startsAt: new Date(startsAt),
      requiresWaiver: needsWaiver,
      waiverSent: false,
    })
    .returning()

  if (!booking) {
    return NextResponse.json({ error: 'Booking insert failed' }, { status: 500 })
  }

  // If waiver needed, create a single-use token for the reminder SMS link
  if (needsWaiver) {
    const expiresAt = new Date(startsAt) // token valid until appointment time
    await db.insert(waiverTokens).values({
      customerId: session.customerId,
      bookingId: booking.id,
      expiresAt,
    })
  }

  return NextResponse.json({ ok: true, bookingId: booking.id, needsWaiver })
}
