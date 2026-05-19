'use client'

import { useState, useEffect, useCallback } from 'react'
import { useBooking } from '@/lib/booking-context'
import { Sun, CloudSun, Moon, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SlotData {
  time: string    // HH:mm in business timezone — for display
  startAt: string // UTC ISO string from Square — for booking submission
  label: string   // "9:00 AM" formatted for display
}

type Period = 'morning' | 'afternoon' | 'evening'

const PERIOD_CONFIG: Record<Period, { label: string; icon: typeof Sun }> = {
  morning:   { label: 'Morning',   icon: Sun },
  afternoon: { label: 'Afternoon', icon: CloudSun },
  evening:   { label: 'Evening',   icon: Moon },
}

function getPeriod(hhmm: string): Period {
  const hour = parseInt(hhmm.split(':')[0], 10)
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}

function formatSlotLabel(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`
}

export function TimeSlotGrid() {
  const { selectedDate, selectedTime, selectTimeSlot, selectedService } = useBooking()

  const [slots, setSlots] = useState<SlotData[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState(false)

  const fetchSlots = useCallback(async () => {
    if (!selectedDate || !selectedService) {
      setSlots([])
      return
    }
    setLoading(true)
    setFetchError(false)
    try {
      const params = new URLSearchParams({
        serviceVariationId: selectedService.id,
        year: String(selectedDate.getFullYear()),
        month: String(selectedDate.getMonth()),
        day: String(selectedDate.getDate()),
      })
      const res = await fetch(`/api/booking/slots?${params}`)
      if (!res.ok) throw new Error('Slots fetch failed')
      const data = await res.json()
      const rawSlots: Array<{ time: string; startAt: string }> = data.slots ?? []
      setSlots(
        rawSlots.map((s) => ({ time: s.time, startAt: s.startAt, label: formatSlotLabel(s.time) }))
      )
    } catch {
      setFetchError(true)
      setSlots([])
    } finally {
      setLoading(false)
    }
  }, [selectedDate, selectedService])

  useEffect(() => {
    fetchSlots()
  }, [fetchSlots])

  if (!selectedDate) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
        <p className="font-serif text-lg text-muted-foreground">Select a date to see available times</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-border bg-card py-12">
        <Loader2 className="h-5 w-5 animate-spin text-gold" />
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Could not load available times.{' '}
          <button type="button" onClick={fetchSlots} className="text-gold underline hover:no-underline">
            Retry
          </button>
        </p>
      </div>
    )
  }

  if (slots.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center">
        <p className="font-serif text-base text-muted-foreground">No times available on this date</p>
        <p className="mt-1 text-sm text-muted-foreground">Please select a different day</p>
      </div>
    )
  }

  // Group slots by time-of-day period
  const grouped: Record<Period, SlotData[]> = { morning: [], afternoon: [], evening: [] }
  for (const slot of slots) {
    grouped[getPeriod(slot.time)].push(slot)
  }

  return (
    <div className="flex flex-col gap-5">
      {(Object.keys(PERIOD_CONFIG) as Period[]).map((period) => {
        const config = PERIOD_CONFIG[period]
        const Icon = config.icon
        const periodSlots = grouped[period]
        if (periodSlots.length === 0) return null

        return (
          <div key={period}>
            <div className="mb-3 flex items-center gap-2">
              <Icon className="h-4 w-4 text-gold" />
              <h4 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                {config.label}
              </h4>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {periodSlots.map((slot) => {
                const isSelected = selectedTime === slot.time

                return (
                  <button
                    key={slot.startAt}
                    onClick={() => selectTimeSlot(slot.time, slot.startAt)}
                    type="button"
                    className={cn(
                      'rounded-lg border px-3 py-2.5 text-sm font-medium transition-all',
                      isSelected
                        ? 'border-gold bg-gold text-primary-foreground shadow-sm'
                        : 'cursor-pointer border-border bg-card text-foreground hover:border-gold-light hover:text-gold-dark'
                    )}
                    aria-label={slot.label}
                    aria-pressed={isSelected}
                  >
                    {slot.label}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
