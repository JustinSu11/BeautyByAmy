'use client'

import Link from 'next/link'
import { useBooking, type BookingStep } from '@/lib/booking-context'
import { Check, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

const steps: { key: BookingStep; label: string; number: number }[] = [
  { key: 'booking', label: 'Appointment', number: 1 },
  { key: 'info', label: 'Your Info', number: 2 },
  { key: 'summary', label: 'Confirm', number: 3 },
]

export function BookingHeader() {
  const { step } = useBooking()
  const currentIndex = steps.findIndex((s) => s.key === step)

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-4 py-4 lg:px-8">
        {/* Brand */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label="Back to home"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="font-serif text-2xl tracking-tight text-charcoal lg:text-3xl">
                BeautyByAmy
              </h1>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Luxury Beauty Studio
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-2 text-sm text-muted-foreground md:flex">
            <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
            Accepting bookings
          </div>
        </div>

        {/* Step indicator */}
        <nav aria-label="Booking progress" className="flex items-center gap-2">
          {steps.map((s, i) => {
            const isComplete = i < currentIndex
            const isCurrent = i === currentIndex
            return (
              <div key={s.key} className="flex flex-1 items-center gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-colors',
                      isComplete && 'bg-gold text-primary-foreground',
                      isCurrent && 'bg-charcoal text-primary-foreground',
                      !isComplete && !isCurrent && 'bg-muted text-muted-foreground'
                    )}
                    aria-current={isCurrent ? 'step' : undefined}
                  >
                    {isComplete ? <Check className="h-3.5 w-3.5" /> : s.number}
                  </span>
                  <span
                    className={cn(
                      'hidden text-sm sm:inline',
                      isCurrent ? 'font-medium text-charcoal' : 'text-muted-foreground'
                    )}
                  >
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={cn(
                      'mx-2 h-px flex-1 transition-colors',
                      i < currentIndex ? 'bg-gold' : 'bg-border'
                    )}
                  />
                )}
              </div>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
