'use client'

import { useBooking } from '@/lib/booking-context'
import { formatDuration, formatPrice } from '@/lib/services-data'
import { Calendar, Clock, Shield, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function formatDate(date: Date): string {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return `${dayNames[date.getDay()]}, ${MONTHS[date.getMonth()]} ${date.getDate()}`
}

function formatTimeLabel(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`
}

export function BookingSummary({ className }: { className?: string }) {
  const {
    selectedServices,
    selectedDate,
    selectedTime,
    totalPrice,
    totalDuration,
    toggleService,
    step,
    setStep,
  } = useBooking()

  const isServicesStep = step === 'services'

  if (selectedServices.length === 0) {
    return (
      <div className={cn('rounded-xl border border-dashed border-border bg-card p-6 text-center', className)}>
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
          <Calendar className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="font-serif text-lg text-muted-foreground">Your Booking</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Select services to get started
        </p>
      </div>
    )
  }

  return (
    <div className={cn('rounded-xl border border-border bg-card', className)}>
      <div className="border-b border-border p-5">
        <h3 className="font-serif text-lg text-charcoal">Booking Summary</h3>
      </div>

      <ScrollArea className="max-h-60">
        <div className="flex flex-col gap-3 p-5">
          {selectedServices.map((service) => (
            <div key={service.id} className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{service.name}</p>
                <p className="text-xs text-muted-foreground">{formatDuration(service.duration)}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-charcoal">{formatPrice(service.price)}</span>
                {isServicesStep && (
                  <button
                    onClick={() => toggleService(service)}
                    className="flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    aria-label={`Remove ${service.name}`}
                    type="button"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Date & Time */}
      {selectedDate && (
        <div className="border-t border-border px-5 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-gold" />
            <span className="text-foreground">{formatDate(selectedDate)}</span>
          </div>
          {selectedTime && (
            <div className="mt-1 flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-gold" />
              <span className="text-foreground">{formatTimeLabel(selectedTime)}</span>
            </div>
          )}
        </div>
      )}

      {/* Totals */}
      <div className="border-t border-border p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Total</p>
            <p className="font-serif text-2xl text-charcoal">{formatPrice(totalPrice)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Duration</p>
            <p className="text-sm font-medium text-foreground">{formatDuration(totalDuration)}</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      {step === 'summary' && (
        <div className="border-t border-border p-5">
          <button
            type="button"
            onClick={() => {
              // In a real app this would navigate to a waiver page
              alert('Proceeding to sign waiver...')
            }}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-charcoal px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-charcoal-light"
          >
            <Shield className="h-4 w-4" />
            Next: Sign Waiver
          </button>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            A deposit may be required to confirm your booking
          </p>
        </div>
      )}

      {step !== 'summary' && step === 'datetime' && selectedDate && selectedTime && (
        <div className="border-t border-border p-5">
          <button
            type="button"
            onClick={() => setStep('summary')}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gold px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-gold-dark"
          >
            Review Booking
          </button>
        </div>
      )}
    </div>
  )
}
