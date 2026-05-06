// apps/web/src/app/api/auth/otp/verify/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { customers, otpTokens } from '@/db/schema'
import { isOtpExpired, getSession } from '@/lib/auth'
import { upsertSquareCustomer } from '@/lib/square'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'

const Schema = z.object({
  phone: z.string().min(7),
  email: z.string().email(),
  name: z.string().min(2),
  token: z.string().length(6),
})

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const parsed = Schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { phone, email, name, token } = parsed.data

  try {
    const [row] = await db
      .select()
      .from(otpTokens)
      .where(and(eq(otpTokens.phone, phone), eq(otpTokens.token, token), eq(otpTokens.used, false)))
      .limit(1)

    if (!row || isOtpExpired(row.expiresAt)) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 401 })
    }

    await db.update(otpTokens).set({ used: true }).where(eq(otpTokens.id, row.id))

    const { squareCustomerId } = await upsertSquareCustomer(phone, email, name)

    const [customer] = await db
      .insert(customers)
      .values({ squareCustomerId, email, name, phone })
      .onConflictDoUpdate({
        target: customers.squareCustomerId,
        set: { email, name, phone },
      })
      .returning()

    const session = await getSession()
    session.customerId = customer.id
    session.phone = customer.phone
    session.email = customer.email
    session.squareCustomerId = squareCustomerId
    await session.save()

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[otp/verify] Verification failed', { phone, err })
    return NextResponse.json({ error: 'Verification failed. Please try again.' }, { status: 500 })
  }
}
