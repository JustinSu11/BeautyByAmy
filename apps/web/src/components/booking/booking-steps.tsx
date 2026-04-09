'use client'

import { useBooking } from '@/lib/booking-context'
import { ServiceDropdown } from './service-dropdown'
import { BookingCalendar } from './booking-calendar'
import { TimeSlotGrid } from './time-slot-grid'
import { BookingSummary } from './booking-summary'
import { ArrowLeft, ArrowRight, Shield } from 'lucide-react'

export function BookingSteps() {
  const {
    step,
    setStep,
    selectedService,
    selectedDate,
    selectedTime,
    customerInfo,
    setCustomerInfo,
    canProceed,
  } = useBooking()

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 pb-32 lg:px-8 lg:pb-8">

      {/* ── Step 1: Service + Date & Time ── */}
      {step === 'booking' && (
        <div className="lg:grid lg:grid-cols-5 lg:gap-8">
          <div className="lg:col-span-3">
            {/* Service selection */}
            <div className="mb-6">
              <h2 className="font-serif text-2xl text-charcoal lg:text-3xl">Book an Appointment</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Choose a service, then pick your date and time
              </p>
            </div>

            <div className="mb-2 text-sm font-medium text-foreground">Service</div>
            <ServiceDropdown />

            {/* Date & time — revealed once a service is selected */}
            {selectedService && (
              <div className="mt-8">
                <div className="mb-4">
                  <h3 className="font-serif text-xl text-charcoal">Select Date &amp; Time</h3>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Pick a date and time that works for you
                  </p>
                </div>
                <div className="flex flex-col gap-6">
                  <BookingCalendar />
                  <div>
                    <h4 className="mb-4 font-serif text-lg text-charcoal">Available Times</h4>
                    <TimeSlotGrid />
                  </div>
                </div>
              </div>
            )}

            {/* Continue button */}
            {selectedService && selectedDate && selectedTime && (
              <button
                type="button"
                onClick={() => setStep('info')}
                className="mt-8 flex items-center gap-2 rounded-lg bg-gold px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-gold-dark"
              >
                Continue to Your Info
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Desktop sidebar */}
          <div className="hidden lg:col-span-2 lg:block">
            <div className="sticky top-36">
              <BookingSummary />
            </div>
          </div>
        </div>
      )}

      {/* ── Step 2: Your Info + Policies ── */}
      {step === 'info' && (
        <div className="lg:grid lg:grid-cols-5 lg:gap-8">
          <div className="lg:col-span-3">
            <button
              type="button"
              onClick={() => setStep('booking')}
              className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to appointment
            </button>

            <div className="mb-6">
              <h2 className="font-serif text-2xl text-charcoal lg:text-3xl">Your Information</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                We&apos;ll use this to confirm your appointment
              </p>
            </div>

            {/* Contact fields */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex flex-col gap-5">
                <div>
                  <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-foreground">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Jane Smith"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="jane@example.com"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-foreground">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="(555) 000-0000"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
                  />
                </div>
              </div>
            </div>

            {/* Booking policies — shown before the continue button so users read them */}
            <div className="mt-6 rounded-xl border border-border bg-card p-5">
              <h4 className="mb-3 flex items-center gap-2 font-serif text-base text-charcoal">
                <Shield className="h-4 w-4 text-gold" />
                Booking Policies
              </h4>
              <ul className="flex flex-col gap-2.5 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gold" />
                  A 24-hour cancellation notice is required. Late cancellations or no-shows may be charged a fee.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gold" />
                  Please arrive 5 minutes early. Late arrivals may result in shortened service time or rescheduling.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gold" />
                  A digital consent waiver must be signed before your first appointment.
                </li>
                {selectedService?.requiresDeposit && (
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gold" />
                    A non-refundable deposit is required to secure your booking for this service.
                  </li>
                )}
              </ul>
            </div>

            <button
              type="button"
              onClick={() => setStep('summary')}
              disabled={!canProceed}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-gold px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-gold-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              Review Booking
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Desktop sidebar */}
          <div className="hidden lg:col-span-2 lg:block">
            <div className="sticky top-36">
              <BookingSummary />
            </div>
          </div>
        </div>
      )}

      {/* ── Step 3: Confirm ── */}
      {step === 'summary' && (
        <div className="mx-auto max-w-xl">
          <button
            type="button"
            onClick={() => setStep('info')}
            className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to your info
          </button>

          <div className="mb-6 text-center">
            <h2 className="font-serif text-2xl text-charcoal lg:text-3xl">Confirm Your Booking</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Review your selections before proceeding
            </p>
          </div>

          <BookingSummary />
        </div>
      )}
    </div>
  )
}
