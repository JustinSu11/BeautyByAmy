// apps/web/src/app/api/cron/waiver-reminders/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { bookings, customers, waiverTokens } from '@/db/schema'
import { sendWaiverReminderSms } from '@/lib/sms'
import { eq, and, lte, gte } from 'drizzle-orm'

// Secured with a secret header — Vercel sends this automatically
export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)

  // Find upcoming bookings that need a waiver and haven't been sent a reminder yet
  const pendingBookings = await db
    .select({
      bookingId: bookings.id,
      customerId: bookings.customerId,
      startsAt: bookings.startsAt,
      name: customers.name,
      phone: customers.phone,
    })
    .from(bookings)
    .innerJoin(customers, eq(bookings.customerId, customers.id))
    .where(
      and(
        eq(bookings.requiresWaiver, true),
        eq(bookings.waiverReceived, false),
        eq(bookings.waiverSent, false),
        gte(bookings.startsAt, now),
        lte(bookings.startsAt, threeDaysFromNow)
      )
    )

  let sent = 0

  for (const booking of pendingBookings) {
    const [tokenRow] = await db
      .select()
      .from(waiverTokens)
      .where(
        and(
          eq(waiverTokens.bookingId, booking.bookingId),
          eq(waiverTokens.used, false),
          gte(waiverTokens.expiresAt, now)
        )
      )
      .limit(1)

    if (!tokenRow) continue

    const appointmentDate = booking.startsAt.toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric',
    })

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://beautybyamy.com'
    const waiverUrl = `${baseUrl}/waiver?token=${tokenRow.token}`

    try {
      await sendWaiverReminderSms(booking.phone, booking.name, appointmentDate, waiverUrl)
      await db.update(bookings).set({ waiverSent: true }).where(eq(bookings.id, booking.bookingId))
      sent++
    } catch (err) {
      console.error(`Failed to send waiver reminder for booking ${booking.bookingId}:`, err)
    }
  }

  return NextResponse.json({ sent })
}
