// apps/web/src/lib/auth.ts
import { getIronSession } from 'iron-session'
import { randomInt } from 'crypto'

export const OTP_TTL_MS = 10 * 60 * 1000 // 10 minutes

export const CURRENT_WAIVER_VERSION = '2026-05-05'

export function generateOtp(): string {
  return (100000 + randomInt(0, 900000)).toString()
}

export function isOtpExpired(expiresAt: Date): boolean {
  return new Date() >= expiresAt
}

export interface SessionData {
  customerId: string
  phone: string
  email: string
  squareCustomerId: string
}

export async function getSession() {
  // Lazy-import next/headers so this module can be imported in test environments
  // without a Next.js server context
  const { cookies } = await import('next/headers')
  return getIronSession<SessionData>(await cookies(), {
    password: process.env.SESSION_SECRET!,
    cookieName: 'bba-session',
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax',
    },
  })
}
