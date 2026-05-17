import type { Metadata } from 'next'
import { fetchSquareServices } from '@/lib/square'
import { BookingPageClient } from './booking-client'

export const metadata: Metadata = {
  title: 'Book an Appointment | BeautyByAmy',
  description:
    'Select your services, choose a date and time, and book your luxury beauty appointment with Amy.',
}

export default async function BookingPage() {
  const services = await fetchSquareServices()
  return <BookingPageClient services={services} />
}
