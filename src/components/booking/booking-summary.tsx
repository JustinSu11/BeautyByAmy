'use client'

import { useState } from 'react'
import { useBooking } from '@/lib/booking-context'
import { formatDuration, formatPrice } from '@/lib/services-data'
import { Calendar, Clock, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ConfirmModal } from './confirm-modal'

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
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  const {
    selectedService,
    selectedDate,
    selectedTime,
    totalPrice,
    totalDuration,
    step,
    setStep,
    canProceed,
    policyAccepted,
    setPolicyAccepted,
  } = useBooking()

  if (!selectedService) {
    return (
      <div className={cn('rounded-xl border border-dashed border-border bg-card p-6 text-center', className)}>
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
          <Calendar className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="font-serif text-lg text-muted-foreground">Your Booking</p>
        <p className="mt-1 text-sm text-muted-foreground">Select a service to get started</p>
      </div>
    )
  }

  return (
    <div className={cn('rounded-xl border border-border bg-card', className)}>
      <div className="border-b border-border p-5">
        <h3 className="font-serif text-lg text-charcoal">Booking Summary</h3>
      </div>

      {/* Selected service */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">{selectedService.name}</p>
            <p className="text-xs text-muted-foreground">{formatDuration(selectedService.duration)}</p>
          </div>
          <span className="text-sm font-semibold text-charcoal">{formatPrice(selectedService.price)}</span>
        </div>
      </div>

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

      {/* Confirm step: policy checkbox + submit */}
      {step === 'summary' && (
        <div className="border-t border-border p-5">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={policyAccepted}
              onChange={(e) => setPolicyAccepted(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-gold"
            />
            <span className="text-xs leading-relaxed text-muted-foreground">
              I have read and agree to the booking policies, including the 24-hour cancellation notice
              requirement and the digital waiver I will sign before my appointment.
            </span>
          </label>

          {confirmed ? (
            <div className="mt-4 rounded-lg bg-gold/10 p-4 text-center">
              <p className="font-serif text-lg text-charcoal">Booking Confirmed!</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Check your phone for a confirmation text. If your service requires a
                consent form, you&apos;ll receive a link before your appointment.
              </p>
            </div>
          ) : (
            <button
              type="button"
              disabled={!policyAccepted}
              onClick={() => setModalOpen(true)}
              className={cn(
                'mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-6 py-3.5 text-sm font-semibold transition-colors',
                policyAccepted
                  ? 'bg-charcoal text-primary-foreground hover:bg-charcoal/90'
                  : 'cursor-not-allowed bg-muted text-muted-foreground'
              )}
            >
              <Shield className="h-4 w-4" />
              Confirm Booking
            </button>
          )}

          {modalOpen && !confirmed && (
            <ConfirmModal
              onClose={() => setModalOpen(false)}
              onSuccess={() => {
                setModalOpen(false)
                setConfirmed(true)
              }}
              teamMemberId={process.env.NEXT_PUBLIC_SQUARE_TEAM_MEMBER_ID ?? ''}
            />
          )}

          {selectedService.requiresDeposit && (
            <p className="mt-2 text-center text-xs text-muted-foreground">
              A deposit is required to secure this booking
            </p>
          )}
        </div>
      )}

      {/* "Continue to Your Info" CTA on booking step once date + time selected */}
      {step === 'booking' && selectedDate && selectedTime && (
        <div className="border-t border-border p-5">
          <button
            type="button"
            onClick={() => setStep('info')}
            disabled={!canProceed}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-gold px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-gold-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            Continue to Your Info
          </button>
        </div>
      )}
    </div>
  )
}
