// apps/web/src/app/api/auth/otp/send/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { otpTokens } from '@/db/schema'
import { generateOtp, OTP_TTL_MS } from '@/lib/auth'
import { sendOtpSms } from '@/lib/sms'
import { eq, and, gte } from 'drizzle-orm'
import { z } from 'zod'

const Schema = z.object({
  phone: z.string().min(7),
})

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const parsed = Schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { phone } = parsed.data

  // Rate limit: one OTP per phone per 60 seconds
  const recentOtp = await db
    .select()
    .from(otpTokens)
    .where(
      and(
        eq(otpTokens.phone, phone),
        gte(otpTokens.createdAt, new Date(Date.now() - 60_000))
      )
    )
    .limit(1)

  if (recentOtp.length > 0) {
    return NextResponse.json(
      { error: 'Please wait before requesting another code' },
      { status: 429 }
    )
  }

  const token = generateOtp()
  const expiresAt = new Date(Date.now() + OTP_TTL_MS)

  await db.insert(otpTokens).values({ phone, token, expiresAt })
  await sendOtpSms(phone, token)

  return NextResponse.json({ ok: true })
}
