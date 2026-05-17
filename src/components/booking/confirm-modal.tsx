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
          destroy: () => Promise<void>
          tokenize: () => Promise<{ status: 'OK' | 'Cancel' | 'Error' | 'Unknown'; token?: string; errors?: { message: string }[] }>
        }>
      }>
    }
  }
}

interface ConfirmModalProps {
  onClose: () => void
  onSuccess: () => void
}

export function ConfirmModal({ onClose, onSuccess }: ConfirmModalProps) {
  const { customerInfo, selectedService, selectedDate, selectedTime } = useBooking()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const cardRef = useRef<{ tokenize: () => Promise<{ status: 'OK' | 'Cancel' | 'Error' | 'Unknown'; token?: string; errors?: { message: string }[] }>; destroy: () => Promise<void> } | null>(null)

  useEffect(() => {
    // Guard against React StrictMode double-invoke: track whether this effect
    // instance was cleaned up before async init finished.
    let cancelled = false

    async function initCard() {
      try {
        if (!window.Square) throw new Error('Square SDK not available')
        // Bail if a card is already mounted (StrictMode re-run guard)
        if (cardRef.current) return

        const payments = await window.Square.payments(
          process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID!,
          process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID!
        )
        const card = await payments.card()

        if (cancelled) {
          await card.destroy()
          return
        }

        await card.attach('#square-card-container')
        cardRef.current = card
      } catch (err) {
        if (!cancelled) {
          console.error('[ConfirmModal] Square SDK init failed', err)
          setError('Payment form failed to load. Please refresh and try again.')
        }
      }
    }

    const squareSrc =
      process.env.NODE_ENV === 'production'
        ? 'https://web.squarecdn.com/v1/square.js'
        : 'https://sandbox.web.squarecdn.com/v1/square.js'

    if (window.Square) {
      // Script already loaded (e.g. modal reopened) — init directly
      initCard()
    } else {
      const script = document.createElement('script')
      script.src = squareSrc
      script.onload = initCard
      script.onerror = () => {
        if (!cancelled) setError('Payment form failed to load. Please refresh and try again.')
      }
      document.head.appendChild(script)
    }

    return () => {
      cancelled = true
      // Destroy the card element so the container is clean on remount
      cardRef.current?.destroy().catch(() => {})
      cardRef.current = null
    }
  }, [])

  async function handleConfirm() {
    if (!cardRef.current || !selectedService || !selectedDate || !selectedTime) return
    setLoading(true)
    setError(null)

    try {
      const result = await cardRef.current.tokenize()
      if (result.status !== 'OK' || !result.token) {
        setError(result.errors?.[0]?.message ?? 'Card error. Please check your details.')
        return
      }

      const [hourStr, minuteStr] = selectedTime.split(':')
      const hour = parseInt(hourStr, 10)
      const minute = parseInt(minuteStr, 10)
      if (isNaN(hour) || isNaN(minute)) {
        setError('Invalid time selection. Please go back and re-select a time.')
        return
      }

      const startsAt = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        hour,
        minute
      ).toISOString()

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceId: result.token,
          name: customerInfo.name,
          phone: customerInfo.phone,
          email: customerInfo.email,
          // selectedService.id is the Square variation ID from fetchSquareServices
          serviceVariationId: selectedService.id,
          serviceName: selectedService.name,
          startsAt,
          durationMinutes: selectedService.duration,
          serviceId: selectedService.id,
          requiresWaiver: selectedService.requiresWaiver ?? false,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'Booking failed. Please try again.')
        return
      }

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
          onClick={handleConfirm}
          disabled={loading}
          className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-gold px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-gold-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CreditCard className="h-4 w-4" />
          {loading ? 'Confirming…' : 'Confirm Booking'}
        </button>

        <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Shield className="h-3.5 w-3.5" />
          Card secured by Square. Only charged for no-shows or late cancellations.
        </p>
      </div>
    </div>
  )
}
