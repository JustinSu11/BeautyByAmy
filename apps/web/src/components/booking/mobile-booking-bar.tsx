'use client'

import { useState } from 'react'
import { useBooking } from '@/lib/booking-context'
import { formatPrice, formatDuration } from '@/lib/services-data'
import { BookingSummary } from './booking-summary'
import { ChevronUp } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

export function MobileBookingBar() {
  const {
    selectedService,
    totalPrice,
    totalDuration,
    step,
    setStep,
    canProceed,
    selectedDate,
    selectedTime,
  } = useBooking()
  const [summaryOpen, setSummaryOpen] = useState(false)

  const getButtonLabel = () => {
    switch (step) {
      case 'booking':
        if (!selectedService) return 'Select a Service'
        if (!selectedDate || !selectedTime) return 'Choose Date & Time'
        return 'Continue to Your Info'
      case 'info':
        return 'Review Booking'
      case 'summary':
        return 'Confirm Booking'
    }
  }

  const handleAction = () => {
    switch (step) {
      case 'booking':
        if (canProceed) setStep('info')
        break
      case 'info':
        if (canProceed) setStep('summary')
        break
      case 'summary':
        // Handled by policy checkbox + button inside BookingSummary
        break
    }
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 backdrop-blur-sm lg:hidden">
      {/* Summary peek */}
      {selectedService && (
        <Sheet open={summaryOpen} onOpenChange={setSummaryOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              className="flex w-full cursor-pointer items-center justify-between border-b border-border px-4 py-2.5 text-sm"
            >
              <div className="flex items-center gap-3">
                <span className="max-w-[180px] truncate text-muted-foreground">{selectedService.name}</span>
                <span className="font-serif text-lg font-semibold text-charcoal">
                  {formatPrice(totalPrice)}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gold">
                <span>Details</span>
                <ChevronUp className="h-3.5 w-3.5" />
              </div>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-2xl">
            <SheetHeader className="sr-only">
              <SheetTitle>Booking Summary</SheetTitle>
            </SheetHeader>
            <BookingSummary className="border-0 shadow-none" />
          </SheetContent>
        </Sheet>
      )}

      {/* Action button — hidden on summary step (BookingSummary handles the CTA there) */}
      {step !== 'summary' && (
        <div className="p-3">
          <button
            type="button"
            onClick={handleAction}
            disabled={!canProceed}
            className={cn(
              'flex w-full items-center justify-center rounded-lg px-6 py-3.5 text-sm font-semibold transition-all',
              canProceed
                ? 'cursor-pointer bg-gold text-primary-foreground shadow-sm hover:bg-gold-dark active:scale-[0.98]'
                : 'cursor-not-allowed bg-muted text-muted-foreground'
            )}
          >
            {getButtonLabel()}
          </button>
          {totalDuration > 0 && (
            <p className="mt-1.5 text-center text-xs text-muted-foreground">
              Estimated time: {formatDuration(totalDuration)}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
