export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { Suspense } from 'react'
import Script from 'next/script'
import { fetchSquareServices } from '@/lib/square'
import { BookingPageClient } from './booking-client'
import { BookingShell } from './booking-shell'

export const metadata: Metadata = {
  title: 'Book an Appointment — Lash & Brow Services in Mobile, AL',
  description:
    'Book eyelash extensions, microblading, ombré brows, lip blush, or brow services online with BeautyByAmy in Mobile, AL. Same-day confirmation, card on file.',
}

const SQUARE_SDK_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://web.squarecdn.com/v1/square.js'
    : 'https://sandbox.web.squarecdn.com/v1/square.js'

interface BookingSearchParams {
  service?: string  // Square variation ID — pre-selects a service
  from?: string     // Return path for the back button (must be a relative path starting with /)
}

// Fetches services then renders the full booking UI.
// Lives inside <Suspense> so the page shell streams immediately.
async function BookingContent({
  searchParams,
}: {
  searchParams: Promise<BookingSearchParams>
}) {
  const [services, params] = await Promise.all([fetchSquareServices(), searchParams])

  // Only allow relative paths as the back destination to prevent open-redirect issues
  const from = params.from?.startsWith('/') ? params.from : undefined

  return (
    <BookingPageClient
      services={services}
      initialServiceId={params.service}
      from={from}
    />
  )
}

export default function BookingPage({
  searchParams,
}: {
  searchParams: Promise<BookingSearchParams>
}) {
  return (
    <>
      {/* Preload Square SDK immediately — ready before the user reaches the card step */}
      <Script src={SQUARE_SDK_URL} strategy="afterInteractive" />
      <Suspense fallback={<BookingShell />}>
        <BookingContent searchParams={searchParams} />
      </Suspense>
    </>
  )
}
