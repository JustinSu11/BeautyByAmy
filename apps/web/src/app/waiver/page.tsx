// apps/web/src/app/waiver/page.tsx
import { redirect } from 'next/navigation'
import { db } from '@/db'
import { waiverTokens, bookings, customers, waivers } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'
import { services } from '@/lib/services-data'
import { WaiverWizard } from './waiver-form'

type WaiverType = 'lash' | 'pmu' | 'reconsent'

function deriveWaiverType(category: string, hasPriorWaiver: boolean): WaiverType {
  if (category === 'permanent-makeup') {
    return hasPriorWaiver ? 'reconsent' : 'pmu'
  }
  return 'lash'
}

export default async function WaiverPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const params = await searchParams
  if (!params.token) redirect('/')

  const tokenParsed = z.string().uuid().safeParse(params.token)
  if (!tokenParsed.success) return <InvalidLink />

  // Load token → booking → customer in one join
  const [row] = await db
    .select({
      tokenId:       waiverTokens.id,
      customerId:    waiverTokens.customerId,
      bookingId:     waiverTokens.bookingId,
      expiresAt:     waiverTokens.expiresAt,
      used:          waiverTokens.used,
      serviceId:     bookings.serviceId,
      startsAt:      bookings.startsAt,
      customerName:  customers.name,
      customerEmail: customers.email,
      customerPhone: customers.phone,
    })
    .from(waiverTokens)
    .innerJoin(bookings, eq(bookings.id, waiverTokens.bookingId))
    .innerJoin(customers, eq(customers.id, waiverTokens.customerId))
    .where(and(
      eq(waiverTokens.token, params.token as string),
      eq(waiverTokens.used, false),
    ))
    .limit(1)

  if (!row || new Date() > row.expiresAt) return <InvalidLink />

  // Resolve service name + category
  const service = services.find((s) => s.id === row.serviceId)
  const serviceName = service?.name ?? 'Beauty Service'
  const category = service?.category ?? 'eyelashes'

  // PMU returning clients get the shorter re-consent form
  let waiverType: WaiverType = 'lash'
  if (category === 'permanent-makeup') {
    const [priorWaiver] = await db
      .select({ id: waivers.id })
      .from(waivers)
      .where(eq(waivers.customerId, row.customerId))
      .limit(1)
    waiverType = priorWaiver ? 'reconsent' : 'pmu'
  }

  const appointmentDate = row.startsAt.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div className="linen-bg grain-overlay min-h-screen">
      {/* Slim top bar */}
      <div className="border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <p className="font-serif text-lg text-charcoal">BeautyByAmy</p>
          <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-gold">Consent & Waiver</p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-8 pb-20">
        <WaiverWizard
          token={params.token}
          waiverType={waiverType}
          prefill={{
            name:            row.customerName,
            email:           row.customerEmail,
            phone:           row.customerPhone,
            serviceName,
            appointmentDate,
          }}
        />
      </div>
    </div>
  )
}

function InvalidLink() {
  return (
    <div className="linen-bg grain-overlay flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <p className="mb-3 font-serif text-lg text-gold">BeautyByAmy</p>
        <h1 className="font-serif text-3xl text-charcoal">Link Expired</h1>
        <p className="mt-3 max-w-sm text-sm text-muted-foreground">
          This waiver link is no longer valid or has already been used. Please contact BeautyByAmy to receive a new one.
        </p>
      </div>
    </div>
  )
}
