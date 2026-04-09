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
  const { selectedServices, totalPrice, totalDuration, step, setStep, canProceed, selectedDate, selectedTime } = useBooking()
  const [summaryOpen, setSummaryOpen] = useState(false)

  const getButtonLabel = () => {
    switch (step) {
      case 'services':
        return selectedServices.length > 0
          ? `Continue with ${selectedServices.length} service${selectedServices.length > 1 ? 's' : ''}`
          : 'Select a Service'
      case 'datetime':
        return selectedDate && selectedTime ? 'Review Booking' : 'Choose Date & Time'
      case 'summary':
        return 'Sign Waiver & Confirm'
    }
  }

  const handleAction = () => {
    switch (step) {
      case 'services':
        if (canProceed) setStep('datetime')
        break
      case 'datetime':
        if (canProceed) setStep('summary')
        break
      case 'summary':
        alert('Proceeding to sign waiver...')
        break
    }
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 backdrop-blur-sm lg:hidden">
      {/* Summary peek */}
      {selectedServices.length > 0 && (
        <Sheet open={summaryOpen} onOpenChange={setSummaryOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              className="flex w-full items-center justify-between border-b border-border px-4 py-2.5 text-sm"
            >
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground">
                  {selectedServices.length} service{selectedServices.length > 1 ? 's' : ''}
                </span>
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

      {/* Action button */}
      <div className="p-3">
        <button
          type="button"
          onClick={handleAction}
          disabled={!canProceed && step !== 'services'}
          className={cn(
            'flex w-full items-center justify-center rounded-lg px-6 py-3.5 text-sm font-semibold transition-all',
            canProceed
              ? 'bg-gold text-primary-foreground shadow-sm hover:bg-gold-dark active:scale-[0.98]'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
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
    </div>
  )
}
