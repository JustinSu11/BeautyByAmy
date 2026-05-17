'use client'

import { BookingProvider } from '@/lib/booking-context'
import { BookingHeader } from '@/components/booking/booking-header'
import { BookingSteps } from '@/components/booking/booking-steps'
import { MobileBookingBar } from '@/components/booking/mobile-booking-bar'
import type { Service } from '@/lib/services-data'

export function BookingPageClient({ services }: { services: Service[] }) {
  return (
    <BookingProvider services={services}>
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
