// apps/web/src/lib/email.ts
import { Resend } from 'resend'
import fs from 'fs'
import path from 'path'
import { BUSINESS_PHONE } from './config'

// Lazy singleton — `new Resend(undefined)` doesn't throw but every send call
// will fail with an auth error.  We defer construction and guard with a check
// so callers receive a clear error (and the module doesn't crash at import time
// when RESEND_API_KEY hasn't been added to the environment yet).
let _resend: Resend | null = null

function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY
    if (!key) {
      throw new Error('[email] Resend is not configured — RESEND_API_KEY missing')
    }
    _resend = new Resend(key)
  }
  return _resend
}

// In development Resend only allows sending from the shared onboarding address.
// Production uses the verified beautybyamy.com domain.
const FROM =
  process.env.NODE_ENV === 'production'
    ? 'BeautyByAmy <appointments@beautybyamy.com>'
    : 'BeautyByAmy <onboarding@resend.dev>'
const REPLY_TO = 'BeautyByAmyLe@gmail.com'

// ── Waiver PDF lookup ─────────────────────────────────────────────────────────

type WaiverFileKey = 'lash' | 'pmu' | 'reconsent'

const WAIVER_FILES: Record<WaiverFileKey, { filename: string; label: string }> = {
  lash:      { filename: 'lash-waiver.pdf',     label: 'Eyelash Extensions Waiver' },
  pmu:       { filename: 'pmu-consent.pdf',      label: 'Permanent Makeup Consent Form' },
  reconsent: { filename: 'pmu-reconsent.pdf',    label: 'PMU Touch-Up Re-Consent Form' },
}

function waiverBuffer(key: WaiverFileKey): Buffer {
  const file = path.join(process.cwd(), 'public', 'waivers', WAIVER_FILES[key].filename)
  return fs.readFileSync(file)
}

// ── Booking confirmation + waiver attachment ───────────────────────────────────

export interface WaiverEmailParams {
  to:              string
  clientName:      string
  serviceName:     string
  appointmentDate: string   // human-readable, e.g. "Tuesday, May 20, 2026"
  waiverKey:       WaiverFileKey
}

export async function sendWaiverEmail(params: WaiverEmailParams) {
  const { to, clientName, serviceName, appointmentDate, waiverKey } = params
  const waiver = WAIVER_FILES[waiverKey]
  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:Georgia,serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:#2c2c2c;padding:32px 40px;text-align:center;border-radius:12px 12px 0 0;">
            <p style="margin:0;font-family:Georgia,serif;font-size:22px;color:#ffffff;letter-spacing:1px;">
              BeautyByAmy
            </p>
            <p style="margin:6px 0 0;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#C9A96E;">
              Appointment Confirmation
            </p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#ffffff;padding:40px;border-radius:0 0 12px 12px;">

            <p style="margin:0 0 20px;font-size:15px;color:#3a3a3a;line-height:1.6;">
              Hi ${clientName},
            </p>
            <p style="margin:0 0 20px;font-size:15px;color:#3a3a3a;line-height:1.6;">
              Your appointment is confirmed. We can't wait to see you!
            </p>

            <!-- Appointment details box -->
            <table width="100%" cellpadding="0" cellspacing="0"
              style="background:#faf7f2;border:1px solid #e8dcc8;border-radius:8px;margin-bottom:28px;">
              <tr>
                <td style="padding:20px 24px;">
                  <p style="margin:0 0 6px;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#C9A96E;font-family:Arial,sans-serif;">
                    Service
                  </p>
                  <p style="margin:0 0 16px;font-size:16px;color:#2c2c2c;font-family:Georgia,serif;">
                    ${serviceName}
                  </p>
                  <p style="margin:0 0 6px;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#C9A96E;font-family:Arial,sans-serif;">
                    Date &amp; Time
                  </p>
                  <p style="margin:0;font-size:16px;color:#2c2c2c;font-family:Georgia,serif;">
                    ${appointmentDate}
                  </p>
                </td>
              </tr>
            </table>

            <!-- Waiver instructions -->
            <p style="margin:0 0 12px;font-size:15px;color:#3a3a3a;line-height:1.6;">
              <strong>Action required before your visit:</strong>
            </p>
            <p style="margin:0 0 20px;font-size:14px;color:#555;line-height:1.7;">
              Please open the attached <strong>${waiver.label}</strong>, fill it out completely,
              sign it, and email it back to us before your appointment:
            </p>

            <!-- CTA link -->
            <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              <tr>
                <td style="background:#C9A96E;border-radius:24px;padding:12px 28px;">
                  <a href="mailto:${REPLY_TO}?subject=Signed Waiver — ${clientName}"
                    style="color:#ffffff;font-family:Arial,sans-serif;font-size:13px;font-weight:bold;letter-spacing:1px;text-decoration:none;text-transform:uppercase;">
                    Reply with Signed Waiver
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:0 0 28px;font-size:13px;color:#888;line-height:1.6;">
              Or reply directly to this email with the completed form attached.
              If you have any questions, reply here or reach Amy at
              <a href="mailto:${REPLY_TO}" style="color:#C9A96E;">${REPLY_TO}</a>
              or call/text <a href="tel:${BUSINESS_PHONE}" style="color:#C9A96E;">${BUSINESS_PHONE}</a>.
            </p>

            <hr style="border:none;border-top:1px solid #eee;margin:0 0 24px;">

            <p style="margin:0;font-size:13px;color:#888;line-height:1.6;">
              See you soon! ✨<br>
              <strong style="color:#3a3a3a;">Amy Le</strong><br>
              BeautyByAmy · Mobile, AL<br>
              <a href="mailto:${REPLY_TO}" style="color:#C9A96E;">${REPLY_TO}</a><br>
              <a href="tel:${BUSINESS_PHONE}" style="color:#C9A96E;">${BUSINESS_PHONE}</a>
            </p>

          </td>
        </tr>

      </table>
    </td></tr>
  </table>

</body>
</html>
`

  const { error } = await getResend().emails.send({
    from:     FROM,
    replyTo:  REPLY_TO,
    to:       [to],
    subject:  `Your BeautyByAmy Appointment — Waiver Attached`,
    html,
    attachments: [
      {
        filename: waiver.filename,
        content:  waiverBuffer(waiverKey).toString('base64'),
      },
    ],
  })

  if (error) {
    console.error('[email] Failed to send waiver email', { to, error })
    throw new Error(error.message)
  }
}
