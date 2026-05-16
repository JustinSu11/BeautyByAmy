import type { Metadata } from 'next'
import { BookingProvider } from '@/lib/booking-context'
import { BookingHeader } from '@/components/booking/booking-header'
import { BookingSteps } from '@/components/booking/booking-steps'
import { MobileBookingBar } from '@/components/booking/mobile-booking-bar'

export const metadata: Metadata = {
  title: 'Book an Appointment | BeautyByAmy',
  description:
    'Select your services, choose a date and time, and book your luxury beauty appointment with Amy.',
}

export default function BookingPage() {
  return (
    <BookingProvider>
      <div className="min-h-screen bg-background">
        <BookingHeader />
        <main>
          <BookingSteps />
        </main>
        <MobileBookingBar />
      </div>
    </BookingProvider>
  )
}
