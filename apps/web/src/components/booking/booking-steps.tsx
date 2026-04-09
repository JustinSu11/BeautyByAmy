'use client'

import { useBooking } from '@/lib/booking-context'
import { ServiceList } from './service-list'
import { BookingCalendar } from './booking-calendar'
import { TimeSlotGrid } from './time-slot-grid'
import { BookingSummary } from './booking-summary'
import { ArrowLeft, Calendar, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

export function BookingSteps() {
  const { step, setStep, selectedServices, selectedDate, selectedTime } = useBooking()

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 pb-32 lg:px-8 lg:pb-8">
      {/* Services Step */}
      {step === 'services' && (
        <div className="lg:grid lg:grid-cols-5 lg:gap-8">
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h2 className="font-serif text-2xl text-charcoal lg:text-3xl">
                Choose Your Services
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Select one or more treatments for your visit
              </p>
            </div>
            <ServiceList />
          </div>

          {/* Desktop sidebar summary */}
          <div className="hidden lg:col-span-2 lg:block">
            <div className="sticky top-36">
              <BookingSummary />
              {selectedServices.length > 0 && (
                <button
                  type="button"
                  onClick={() => setStep('datetime')}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-gold px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-gold-dark"
                >
                  <Calendar className="h-4 w-4" />
                  Choose Date & Time
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DateTime Step */}
      {step === 'datetime' && (
        <div className="lg:grid lg:grid-cols-5 lg:gap-8">
          <div className="lg:col-span-3">
            <button
              type="button"
              onClick={() => setStep('services')}
              className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to services
            </button>

            <div className="mb-6">
              <h2 className="font-serif text-2xl text-charcoal lg:text-3xl">
                Select Date & Time
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Pick a date and time that works for you
              </p>
            </div>

            <div className="flex flex-col gap-6">
              <BookingCalendar />
              <div>
                <h3 className="mb-4 font-serif text-lg text-charcoal">Available Times</h3>
                <TimeSlotGrid />
              </div>
            </div>
          </div>

          {/* Desktop sidebar summary */}
          <div className="hidden lg:col-span-2 lg:block">
            <div className="sticky top-36">
              <BookingSummary />
            </div>
          </div>
        </div>
      )}

      {/* Summary / Confirmation Step */}
      {step === 'summary' && (
        <div className="mx-auto max-w-xl">
          <button
            type="button"
            onClick={() => setStep('datetime')}
            className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to date & time
          </button>

          <div className="mb-6 text-center">
            <h2 className="font-serif text-2xl text-charcoal lg:text-3xl">
              Confirm Your Booking
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Review your selections before proceeding
            </p>
          </div>

          <BookingSummary />

          {/* Policies */}
          <div className="mt-6 rounded-xl border border-border bg-card p-5">
            <h4 className="mb-3 flex items-center gap-2 font-serif text-base text-charcoal">
              <Shield className="h-4 w-4 text-gold" />
              Booking Policies
            </h4>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gold" />
                A 24-hour cancellation notice is required for a full refund.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gold" />
                Please arrive 5 minutes early. Late arrivals may result in shortened service time.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gold" />
                A digital waiver must be signed before your first appointment.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gold" />
                A non-refundable deposit may be required to secure your booking.
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
