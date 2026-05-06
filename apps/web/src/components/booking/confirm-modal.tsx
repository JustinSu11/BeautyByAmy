// apps/web/src/components/booking/confirm-modal.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { useBooking } from '@/lib/booking-context'
import { X, CreditCard, Shield } from 'lucide-react'

declare global {
  interface Window {
    Square?: {
      payments: (appId: string, locationId: string) => Promise<{
        card: () => Promise<{
          attach: (selector: string) => Promise<void>
          tokenize: () => Promise<{ status: string; token?: string; errors?: { message: string }[] }>
        }>
      }>
    }
  }
}

interface ConfirmModalProps {
  onClose: () => void
  onSuccess: () => void
  serviceVariationId: string
  teamMemberId: string
}

type ModalStage = 'card' | 'otp'

export function ConfirmModal({
  onClose,
  onSuccess,
  serviceVariationId,
  teamMemberId,
}: ConfirmModalProps) {
  const { customerInfo, selectedService, selectedDate, selectedTime } = useBooking()
  const [stage, setStage] = useState<ModalStage>('card')
  const [sourceId, setSourceId] = useState<string | null>(null)
  const [otp, setOtp] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const cardRef = useRef<{ tokenize: () => Promise<{ status: string; token?: string; errors?: { message: string }[] }> } | null>(null)

  // Load Square Web Payments SDK and attach card form
  useEffect(() => {
    if (stage !== 'card') return
    const script = document.createElement('script')
    script.src =
      process.env.NODE_ENV === 'production'
        ? 'https://web.squarecdn.com/v1/square.js'
        : 'https://sandbox.web.squarecdn.com/v1/square.js'
    script.onload = async () => {
      const payments = await window.Square!.payments(
        process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID!,
        process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID!
      )
      const card = await payments.card()
      await card.attach('#square-card-container')
      cardRef.current = card
    }
    document.head.appendChild(script)
    return () => { document.head.removeChild(script) }
  }, [stage])

  async function handleCardSubmit() {
    if (!cardRef.current) return
    setLoading(true)
    setError(null)
    try {
      const result = await cardRef.current.tokenize()
      if (result.status !== 'OK' || !result.token) {
        setError(result.errors?.[0]?.message ?? 'Card error. Please check your details.')
        return
      }
      setSourceId(result.token)
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: customerInfo.phone }),
      })
      if (!res.ok) throw new Error()
      setStage('otp')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleOtpSubmit() {
    if (!sourceId || !selectedService || !selectedDate || !selectedTime) return
    setLoading(true)
    setError(null)
    try {
      const verifyRes = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: customerInfo.phone,
          email: customerInfo.email,
          name: customerInfo.name,
          token: otp.trim(),
        }),
      })
      if (!verifyRes.ok) {
        const data = await verifyRes.json()
        setError(data.error ?? 'Invalid code')
        return
      }

      const [hourStr, minuteStr] = selectedTime.split(':')
      const hour = parseInt(hourStr, 10)
      const minute = parseInt(minuteStr, 10)
      if (isNaN(hour) || isNaN(minute)) {
        setError('Invalid time selection. Please go back and re-select a time.')
        setLoading(false)
        return
      }
      const startsAt = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        hour,
        minute
      ).toISOString()

      const bookingRes = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceId,
          serviceVariationId,
          teamMemberId,
          startsAt,
          durationMinutes: selectedService.duration,
          serviceId: selectedService.id,
          requiresWaiver: selectedService.requiresWaiver ?? false,
        }),
      })
      if (!bookingRes.ok) throw new Error('Booking failed')

      onSuccess()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="relative w-full max-w-md rounded-2xl bg-card p-6 shadow-xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 cursor-pointer text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        {stage === 'card' && (
          <>
            <div className="mb-5">
              <h2 className="font-serif text-xl text-charcoal">Secure Your Booking</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                A card is required to hold your appointment. You won&apos;t be charged today.
              </p>
            </div>

            <div id="square-card-container" className="min-h-[100px]" />

            {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

            <button
              type="button"
              onClick={handleCardSubmit}
              disabled={loading}
              className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-gold px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-gold-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CreditCard className="h-4 w-4" />
              {loading ? 'Processing…' : 'Continue'}
            </button>

            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <Shield className="h-3.5 w-3.5" />
              Card secured by Square. Only charged for no-shows or late cancellations.
            </p>
          </>
        )}

        {stage === 'otp' && (
          <>
            <div className="mb-5">
              <h2 className="font-serif text-xl text-charcoal">Verify Your Phone</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Enter the 6-digit code sent to <strong>{customerInfo.phone}</strong>
              </p>
            </div>

            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-center text-2xl tracking-[0.5em] text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
            />

            {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

            <button
              type="button"
              onClick={handleOtpSubmit}
              disabled={loading || otp.length !== 6}
              className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-gold px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-gold-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Confirming…' : 'Confirm Booking'}
            </button>

            <button
              type="button"
              onClick={async () => {
                await fetch('/api/auth/otp/send', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ phone: customerInfo.phone }),
                })
              }}
              className="mt-3 w-full cursor-pointer text-sm text-muted-foreground underline-offset-2 hover:underline"
            >
              Resend code
            </button>
          </>
        )}
      </div>
    </div>
  )
}
