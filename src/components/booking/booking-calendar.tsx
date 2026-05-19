'use client'

import { useState, useEffect, useCallback } from 'react'
import { useBooking } from '@/lib/booking-context'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export function BookingCalendar() {
  const { selectedDate, setSelectedDate, selectedService } = useBooking()
  const today = new Date()
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [viewYear, setViewYear] = useState(today.getFullYear())

  const [availableDays, setAvailableDays] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState(false)

  const fetchAvailability = useCallback(async () => {
    if (!selectedService) {
      setAvailableDays([])
      return
    }
    setLoading(true)
    setFetchError(false)
    try {
      const params = new URLSearchParams({
        serviceVariationId: selectedService.id,
        year: String(viewYear),
        month: String(viewMonth),
      })
      const res = await fetch(`/api/booking/availability?${params}`)
      if (!res.ok) throw new Error('Availability fetch failed')
      const data = await res.json()
      setAvailableDays(data.availableDays ?? [])
    } catch {
      setFetchError(true)
      setAvailableDays([])
    } finally {
      setLoading(false)
    }
  }, [selectedService, viewMonth, viewYear])

  useEffect(() => {
    fetchAvailability()
  }, [fetchAvailability])

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  const isCurrentMonth = viewMonth === today.getMonth() && viewYear === today.getFullYear()
  const canGoPrev = !isCurrentMonth

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1) }
    else setViewMonth(viewMonth - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1) }
    else setViewMonth(viewMonth + 1)
  }

  const isSelected = (day: number) =>
    !!selectedDate &&
    selectedDate.getDate() === day &&
    selectedDate.getMonth() === viewMonth &&
    selectedDate.getFullYear() === viewYear

  const isToday = (day: number) =>
    day === today.getDate() &&
    viewMonth === today.getMonth() &&
    viewYear === today.getFullYear()

  const isPast = (day: number) => {
    const d = new Date(viewYear, viewMonth, day)
    d.setHours(0, 0, 0, 0)
    const t = new Date(); t.setHours(0, 0, 0, 0)
    return d < t
  }

  const handleSelect = (day: number) => {
    if (availableDays.includes(day) && !isPast(day)) {
      setSelectedDate(new Date(viewYear, viewMonth, day))
    }
  }

  // Build calendar grid
  const cells: (number | null)[] = []
  for (let i = 0; i < firstDayOfMonth; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div className="rounded-xl border border-border bg-card p-4 lg:p-6">
      {/* Month navigation */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={prevMonth}
          disabled={!canGoPrev}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Previous month"
          type="button"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h3 className="font-serif text-lg text-charcoal">
          {MONTHS[viewMonth]} {viewYear}
        </h3>
        <button
          onClick={nextMonth}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary"
          aria-label="Next month"
          type="button"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="mb-2 grid grid-cols-7 gap-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-1 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {d}
          </div>
        ))}
      </div>

      {/* Days grid — overlaid with loading indicator */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-card/70 backdrop-blur-[2px]">
            <Loader2 className="h-5 w-5 animate-spin text-gold" />
          </div>
        )}

        <div className="grid grid-cols-7 gap-1" role="grid" aria-label="Select a date" aria-busy={loading}>
          {cells.map((day, i) => {
            if (day === null) return <div key={`empty-${i}`} className="aspect-square" />

            const available = availableDays.includes(day) && !isPast(day)
            const selected = isSelected(day)
            const todayMark = isToday(day)

            return (
              <button
                key={day}
                onClick={() => handleSelect(day)}
                disabled={!available}
                type="button"
                className={cn(
                  'relative flex aspect-square items-center justify-center rounded-lg text-sm transition-all',
                  available && !selected && 'cursor-pointer text-foreground hover:bg-gold/10 hover:text-gold-dark',
                  !available && 'cursor-not-allowed text-muted-foreground/40',
                  selected && 'bg-gold font-semibold text-primary-foreground shadow-sm',
                  todayMark && !selected && available && 'font-semibold',
                )}
                aria-label={`${MONTHS[viewMonth]} ${day}, ${viewYear}${!available ? ' (unavailable)' : ''}`}
                aria-pressed={selected}
              >
                {day}
                {todayMark && !selected && (
                  <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-gold" />
                )}
                {available && !selected && !todayMark && (
                  <span className="absolute bottom-1 left-1/2 h-0.5 w-0.5 -translate-x-1/2 rounded-full bg-gold/40" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Error state */}
      {fetchError && (
        <p className="mt-3 text-center text-xs text-destructive">
          Could not load availability.{' '}
          <button type="button" onClick={fetchAvailability} className="underline hover:no-underline">
            Retry
          </button>
        </p>
      )}

      {/* Legend */}
      <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-gold" />
          Available
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-muted" />
          Unavailable
        </span>
      </div>
    </div>
  )
}
