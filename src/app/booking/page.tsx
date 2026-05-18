export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { Suspense } from 'react'
import Script from 'next/script'
import { fetchSquareServices } from '@/lib/square'
import { BookingPageClient } from './booking-client'
import { BookingShell } from './booking-shell'

export const metadata: Metadata = {
  title: 'Book an Appointment | BeautyByAmy',
  description:
    'Select your services, choose a date and time, and book your luxury beauty appointment with Amy.',
}

const SQUARE_SDK_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://web.squarecdn.com/v1/square.js'
    : 'https://sandbox.web.squarecdn.com/v1/square.js'

// Fetches services then renders the full booking UI.
// Lives inside <Suspense> so the page shell streams immediately.
async function BookingContent() {
  const services = await fetchSquareServices()
  return <BookingPageClient services={services} />
}

export default function BookingPage() {
  return (
    <>
      {/* Preload Square SDK immediately — ready before the user reaches the card step */}
      <Script src={SQUARE_SDK_URL} strategy="afterInteractive" />
      <Suspense fallback={<BookingShell />}>
        <BookingContent />
      </Suspense>
    </>
  )
}
