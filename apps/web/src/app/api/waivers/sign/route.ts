// apps/web/src/app/api/waivers/sign/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { waivers, waiverTokens, bookings, customers } from '@/db/schema'
import { CURRENT_WAIVER_VERSION } from '@/lib/auth'
import { appendCustomerNote } from '@/lib/square'
import { services } from '@/lib/services-data'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'

const Schema = z.object({
  token: z.string().uuid(),
  agreed: z.literal(true),
})

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const parsed = Schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const [tokenRow] = await db
    .select({
      id: waiverTokens.id,
      customerId: waiverTokens.customerId,
      bookingId: waiverTokens.bookingId,
      expiresAt: waiverTokens.expiresAt,
      used: waiverTokens.used,
      serviceId: bookings.serviceId,
    })
    .from(waiverTokens)
    .innerJoin(bookings, eq(bookings.id, waiverTokens.bookingId))
    .where(and(eq(waiverTokens.token, parsed.data.token), eq(waiverTokens.used, false)))
    .limit(1)

  if (!tokenRow || new Date() > tokenRow.expiresAt) {
    return NextResponse.json({ error: 'Invalid or expired link' }, { status: 400 })
  }

  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? null

  const service = services.find((s) => s.id === tokenRow.serviceId)
  const validityDays = service?.waiverValidityDays ?? 365
  const waiverExpiresAt = new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000)

  try {
    await db.insert(waivers).values({
      customerId: tokenRow.customerId,
      waiverVersion: CURRENT_WAIVER_VERSION,
      expiresAt: waiverExpiresAt,
      ipAddress: ip,
    })

    await db.update(waiverTokens).set({ used: true }).where(eq(waiverTokens.id, tokenRow.id))

    await db.update(bookings).set({ waiverReceivedAt: new Date() }).where(eq(bookings.id, tokenRow.bookingId))

    const signedAt = new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    })

    // Get customer's Square ID to update their profile note
    const [customerRow] = await db
      .select({ squareCustomerId: customers.squareCustomerId })
      .from(customers)
      .where(eq(customers.id, tokenRow.customerId))
      .limit(1)

    if (customerRow) {
      await appendCustomerNote(
        customerRow.squareCustomerId,
        `Waiver signed (v${CURRENT_WAIVER_VERSION}) on ${signedAt}`
      )
    } else {
      console.error('[waivers/sign] No customer row found', { customerId: tokenRow.customerId })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[waivers/sign] Failed to record waiver', { err })
    return NextResponse.json({ error: 'Failed to record waiver. Please try again.' }, { status: 500 })
  }
}
