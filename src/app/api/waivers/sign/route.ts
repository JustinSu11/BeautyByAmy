// apps/web/src/app/api/waivers/sign/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { waivers, waiverTokens, bookings, customers } from '@/db/schema'
import { CURRENT_WAIVER_VERSION } from '@/lib/waiver-config'
import { appendCustomerNote } from '@/lib/square'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'

/** Validity period in days, keyed by waiver type. */
const WAIVER_VALIDITY_DAYS: Record<'lash' | 'pmu' | 'reconsent', number> = {
  lash: 365,
  pmu: 730,
  reconsent: 730,
}

const Schema = z.object({
  token: z.string().uuid(),
  waiverType: z.enum(['lash', 'pmu', 'reconsent']),
  formData: z.record(z.string(), z.unknown()),
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

  const validityDays = WAIVER_VALIDITY_DAYS[parsed.data.waiverType]
  const waiverExpiresAt = new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000)

  try {
    await db.insert(waivers).values({
      customerId: tokenRow.customerId,
      waiverVersion: CURRENT_WAIVER_VERSION,
      waiverType: parsed.data.waiverType,
      formData: parsed.data.formData,
      expiresAt: waiverExpiresAt,
      ipAddress: ip,
    })

    await db.update(waiverTokens).set({ used: true }).where(eq(waiverTokens.id, tokenRow.id))

    await db.update(bookings).set({ waiverReceivedAt: new Date() }).where(eq(bookings.id, tokenRow.bookingId))

    const signedAt = new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    })

    const [customerRow] = await db
      .select({ squareCustomerId: customers.squareCustomerId })
      .from(customers)
      .where(eq(customers.id, tokenRow.customerId))
      .limit(1)

    if (customerRow) {
      await appendCustomerNote(
        customerRow.squareCustomerId,
        `Waiver signed (v${CURRENT_WAIVER_VERSION}, type: ${parsed.data.waiverType}) on ${signedAt}`
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
