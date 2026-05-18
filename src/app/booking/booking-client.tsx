'use client'

import { BookingProvider } from '@/lib/booking-context'
import { BookingHeader } from '@/components/booking/booking-header'
import { BookingSteps } from '@/components/booking/booking-steps'
import { MobileBookingBar } from '@/components/booking/mobile-booking-bar'
import type { Service } from '@/lib/services-data'

interface Props {
  services: Service[]
  initialServiceId?: string  // pre-selects a service by Square variation ID
  from?: string              // href for the back button
}

export function BookingPageClient({ services, initialServiceId, from }: Props) {
  return (
    <BookingProvider services={services} initialServiceId={initialServiceId}>
      <div className="min-h-screen bg-background">
        <BookingHeader from={from} />
        <main>
          <BookingSteps />
        </main>
        <MobileBookingBar />
      </div>
    </BookingProvider>
  )
}
