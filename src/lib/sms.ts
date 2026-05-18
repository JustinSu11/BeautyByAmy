// apps/web/src/lib/sms.ts
import twilio from 'twilio'
import type { Twilio } from 'twilio'

// Lazy singleton — instantiated on first use so a missing TWILIO_ACCOUNT_SID
// doesn't crash the module at import time (which would take down any Server
// Component that imports this file before any .catch() can run).
let _client: Twilio | null = null

function getClient(): Twilio {
  if (!_client) {
    const sid   = process.env.TWILIO_ACCOUNT_SID
    const token = process.env.TWILIO_AUTH_TOKEN
    if (!sid || !token) {
      throw new Error('[sms] Twilio is not configured — TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN missing')
    }
    _client = twilio(sid, token)
  }
  return _client
}

export async function sendOtpSms(to: string, otp: string): Promise<void> {
  await getClient().messages.create({
    from: process.env.TWILIO_FROM_NUMBER!,
    to,
    body: `Your BeautyByAmy verification code is ${otp}. Valid for 10 minutes.`,
  })
}

export async function sendWaiverReminderSms(
  to: string,
  name: string,
  appointmentDate: string,
  waiverUrl: string
): Promise<void> {
  await getClient().messages.create({
    from: process.env.TWILIO_FROM_NUMBER!,
    to,
    body: `Hi ${name}, your BeautyByAmy appointment on ${appointmentDate} requires a signed consent form. Please sign before your visit: ${waiverUrl}`,
  })
}
