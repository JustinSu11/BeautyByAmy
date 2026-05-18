'use client'

import { useState, useMemo } from 'react'
import { useBooking } from '@/lib/booking-context'
import { getAvailableDates } from '@/lib/services-data'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export function BookingCalendar() {
  const { selectedDate, setSelectedDate } = useBooking()
  const today = new Date()
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [viewYear, setViewYear] = useState(today.getFullYear())

  const availableDays = useMemo(
    () => getAvailableDates(viewMonth, viewYear),
    [viewMonth, viewYear]
  )

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear(viewYear - 1)
    } else {
      setViewMonth(viewMonth - 1)
    }
  }

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear(viewYear + 1)
    } else {
      setViewMonth(viewMonth + 1)
    }
  }

  const isCurrentMonth = viewMonth === today.getMonth() && viewYear === today.getFullYear()
  const canGoPrev = !isCurrentMonth

  const isSelected = (day: number) => {
    if (!selectedDate) return false
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === viewMonth &&
      selectedDate.getFullYear() === viewYear
    )
  }

  const isToday = (day: number) => {
    return day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear()
  }

  const handleSelect = (day: number) => {
    if (availableDays.includes(day)) {
      setSelectedDate(new Date(viewYear, viewMonth, day))
    }
  }

  // Build calendar grid
  const cells: (number | null)[] = []
  for (let i = 0; i < firstDayOfMonth; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  // Fill remaining cells to complete the grid
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
          <div
            key={d}
            className="py-1 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1" role="grid" aria-label="Select a date">
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} className="aspect-square" />
          }
          const available = availableDays.includes(day)
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
                available && !selected && 'text-foreground hover:bg-gold/10 hover:text-gold-dark cursor-pointer',
                !available && 'text-muted-foreground/40 cursor-not-allowed',
                selected && 'bg-gold text-primary-foreground font-semibold shadow-sm',
                todayMark && !selected && available && 'font-semibold'
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
