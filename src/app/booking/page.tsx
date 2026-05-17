import type { Metadata } from 'next'
import Script from 'next/script'
import { fetchSquareServices } from '@/lib/square'
import { BookingPageClient } from './booking-client'

export const metadata: Metadata = {
  title: 'Book an Appointment | BeautyByAmy',
  description:
    'Select your services, choose a date and time, and book your luxury beauty appointment with Amy.',
}

// Preload the Square Web Payments SDK as soon as the booking page is visited.
// This means it's ready by the time the user reaches the card step, instead of
// starting to load only after they open the confirm modal.
const SQUARE_SDK_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://web.squarecdn.com/v1/square.js'
    : 'https://sandbox.web.squarecdn.com/v1/square.js'

export default async function BookingPage() {
  const services = await fetchSquareServices()
  return (
    <>
      <Script src={SQUARE_SDK_URL} strategy="afterInteractive" />
      <BookingPageClient services={services} />
    </>
  )
}
