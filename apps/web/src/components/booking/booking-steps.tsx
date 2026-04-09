'use client'

import { useBooking } from '@/lib/booking-context'
import { ServiceDropdown } from './service-dropdown'
import { BookingCalendar } from './booking-calendar'
import { TimeSlotGrid } from './time-slot-grid'
import { BookingSummary } from './booking-summary'
import { ArrowLeft, Calendar, Shield, ArrowRight } from 'lucide-react'

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

      {/* ── Step 1: Services ── */}
      {step === 'services' && (
        <div className="lg:grid lg:grid-cols-5 lg:gap-8">
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h2 className="font-serif text-2xl text-charcoal lg:text-3xl">Choose Your Service</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Select the treatment you&apos;d like to book
              </p>
            </div>

            <ServiceDropdown />

            {selectedService && (
              <button
                type="button"
                onClick={() => setStep('datetime')}
                className="mt-6 flex items-center gap-2 rounded-lg bg-gold px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-gold-dark"
              >
                <Calendar className="h-4 w-4" />
                Choose Date &amp; Time
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

      {/* ── Step 2: Date & Time ── */}
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
              <h2 className="font-serif text-2xl text-charcoal lg:text-3xl">Select Date &amp; Time</h2>
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

            {selectedDate && selectedTime && (
              <button
                type="button"
                onClick={() => setStep('info')}
                className="mt-6 flex items-center gap-2 rounded-lg bg-gold px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-gold-dark"
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

      {/* ── Step 3: Customer Info ── */}
      {step === 'info' && (
        <div className="lg:grid lg:grid-cols-5 lg:gap-8">
          <div className="lg:col-span-3">
            <button
              type="button"
              onClick={() => setStep('datetime')}
              className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to date &amp; time
            </button>

            <div className="mb-6">
              <h2 className="font-serif text-2xl text-charcoal lg:text-3xl">Your Information</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                We&apos;ll use this to confirm your appointment
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex flex-col gap-5">
                {/* Name */}
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

                {/* Email */}
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

                {/* Phone */}
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
          </div>

          {/* Desktop sidebar */}
          <div className="hidden lg:col-span-2 lg:block">
            <div className="sticky top-36">
              <BookingSummary />
            </div>
          </div>
        </div>
      )}

      {/* ── Step 4: Summary / Confirm ── */}
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
