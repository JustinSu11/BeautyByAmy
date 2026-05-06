// apps/web/src/app/api/auth/otp/send/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { otpTokens } from '@/db/schema'
import { generateOtp, OTP_TTL_MS } from '@/lib/auth'
import { sendOtpSms } from '@/lib/sms'
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
  const token = generateOtp()
  const expiresAt = new Date(Date.now() + OTP_TTL_MS)

  await db.insert(otpTokens).values({ phone, token, expiresAt })
  await sendOtpSms(phone, token)

  return NextResponse.json({ ok: true })
}
