'use client'

import { useMemo } from 'react'
import { useBooking } from '@/lib/booking-context'
import { getTimeSlots, type TimeSlot } from '@/lib/services-data'
import { Sun, CloudSun, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'

const periodConfig = {
  morning: { label: 'Morning', icon: Sun },
  afternoon: { label: 'Afternoon', icon: CloudSun },
  evening: { label: 'Evening', icon: Moon },
}

export function TimeSlotGrid() {
  const { selectedDate, selectedTime, setSelectedTime } = useBooking()
  const allSlots = getTimeSlots()

  const grouped = useMemo(() => {
    const groups: Record<string, TimeSlot[]> = { morning: [], afternoon: [], evening: [] }
    for (const slot of allSlots) {
      groups[slot.period].push(slot)
    }
    return groups
  }, [allSlots])

  // Simulate some slots being unavailable based on the selected date
  const unavailableSlots = useMemo(() => {
    if (!selectedDate) return []
    const seed = selectedDate.getDate()
    return allSlots
      .filter((_, i) => (i + seed) % 5 === 0)
      .map((s) => s.time)
  }, [selectedDate, allSlots])

  if (!selectedDate) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
        <p className="font-serif text-lg text-muted-foreground">Select a date to see available times</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {(Object.keys(periodConfig) as Array<keyof typeof periodConfig>).map((period) => {
        const config = periodConfig[period]
        const Icon = config.icon
        const slots = grouped[period]

        if (slots.length === 0) return null

        return (
          <div key={period}>
            <div className="mb-3 flex items-center gap-2">
              <Icon className="h-4 w-4 text-gold" />
              <h4 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                {config.label}
              </h4>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {slots.map((slot) => {
                const isUnavailable = unavailableSlots.includes(slot.time)
                const isSelected = selectedTime === slot.time

                return (
                  <button
                    key={slot.time}
                    onClick={() => !isUnavailable && setSelectedTime(slot.time)}
                    disabled={isUnavailable}
                    type="button"
                    className={cn(
                      'rounded-lg border px-3 py-2.5 text-sm font-medium transition-all',
                      isSelected
                        ? 'border-gold bg-gold text-primary-foreground shadow-sm'
                        : isUnavailable
                          ? 'border-transparent bg-muted/50 text-muted-foreground/40 cursor-not-allowed'
                          : 'cursor-pointer border-border bg-card text-foreground hover:border-gold-light hover:text-gold-dark'
                    )}
                    aria-label={`${slot.label}${isUnavailable ? ' (unavailable)' : ''}`}
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
