// apps/web/src/lib/sms.ts
import twilio from 'twilio'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
)

export async function sendOtpSms(to: string, otp: string): Promise<void> {
  await client.messages.create({
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
  await client.messages.create({
    from: process.env.TWILIO_FROM_NUMBER!,
    to,
    body: `Hi ${name}, your BeautyByAmy appointment on ${appointmentDate} requires a signed consent form. Please sign before your visit: ${waiverUrl}`,
  })
}
