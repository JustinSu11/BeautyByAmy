// apps/web/src/app/waiver/page.tsx
import { redirect } from 'next/navigation'
import { WaiverForm } from './waiver-form'
import { db } from '@/db'
import { waiverTokens } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'

const WAIVER_TEXT = `By signing this consent form, I acknowledge and agree to the following:

1. I confirm that I have disclosed any allergies, medical conditions, or medications that may affect my treatment.

2. I understand that results may vary and that multiple sessions may be required for optimal results.

3. I consent to the procedures being performed by Amy Le and her team at BeautyByAmy.

4. I understand and accept the 24-hour cancellation policy. Late cancellations and no-shows may be subject to a cancellation fee charged to the card on file.

5. I release BeautyByAmy from liability for any adverse reactions that occur as a result of information I have not disclosed.

6. I confirm that I am 18 years of age or older, or have parental/guardian consent.`

export default async function WaiverPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const params = await searchParams
  if (!params.token) redirect('/')

  // Validate UUID format before hitting the DB
  const tokenParsed = z.string().uuid().safeParse(params.token)
  if (!tokenParsed.success) {
    return (
      <main className="mx-auto max-w-xl px-4 py-12 text-center">
        <h1 className="font-serif text-3xl text-charcoal">Link Expired</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This waiver link is no longer valid. Please contact BeautyByAmy to receive a new one.
        </p>
      </main>
    )
  }

  // Check if token is valid and not expired
  const [tokenRow] = await db
    .select()
    .from(waiverTokens)
    .where(and(eq(waiverTokens.token, params.token as string), eq(waiverTokens.used, false)))
    .limit(1)

  if (!tokenRow || new Date() > tokenRow.expiresAt) {
    return (
      <main className="mx-auto max-w-xl px-4 py-12 text-center">
        <h1 className="font-serif text-3xl text-charcoal">Link Expired</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This waiver link is no longer valid. Please contact BeautyByAmy to receive a new one.
        </p>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="font-serif text-3xl text-charcoal">Consent &amp; Waiver</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Please read and sign before your appointment
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="max-h-72 overflow-y-auto rounded-lg bg-secondary p-4 text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
          {WAIVER_TEXT}
        </div>

        <WaiverForm token={params.token} />
      </div>
    </main>
  )
}
