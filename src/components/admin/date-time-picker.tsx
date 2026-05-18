'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

interface Props {
  /** datetime-local string (e.g. "2026-06-01T14:30") or empty string */
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

/** Pad a number to 2 digits */
const pad = (n: number) => String(n).padStart(2, '0')

/** Format a datetime-local string for display */
function formatDisplay(value: string): string {
  if (!value) return ''
  const d = new Date(value)
  return d.toLocaleString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  })
}

export function AdminDateTimePicker({ value, onChange, placeholder = 'Pick a date & time…' }: Props) {
  const today = new Date()
  const containerRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)

  // Parse current value into date parts
  const parsed = value ? new Date(value) : null
  const [viewMonth, setViewMonth] = useState(parsed?.getMonth() ?? today.getMonth())
  const [viewYear,  setViewYear]  = useState(parsed?.getFullYear() ?? today.getFullYear())
  const [selDate,   setSelDate]   = useState<Date | null>(parsed)
  const [hour,      setHour]      = useState(parsed ? pad(parsed.getHours()) : '09')
  const [minute,    setMinute]    = useState(parsed ? pad(parsed.getMinutes()) : '00')

  // Close on outside click
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  // Build calendar grid
  const firstDay   = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  function selectDay(day: number) {
    const d = new Date(viewYear, viewMonth, day)
    setSelDate(d)
  }

  function confirm() {
    if (!selDate) return
    const iso = `${selDate.getFullYear()}-${pad(selDate.getMonth() + 1)}-${pad(selDate.getDate())}T${hour}:${minute}`
    onChange(iso)
    setOpen(false)
  }

  function clear() {
    setSelDate(null)
    setHour('09')
    setMinute('00')
    onChange('')
    setOpen(false)
  }

  const isSelected = (day: number) =>
    selDate?.getDate() === day &&
    selDate?.getMonth() === viewMonth &&
    selDate?.getFullYear() === viewYear

  const isToday = (day: number) =>
    day === today.getDate() &&
    viewMonth === today.getMonth() &&
    viewYear === today.getFullYear()

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={cn(
          'flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-xs transition-colors',
          open
            ? 'border-[#C9A96E] ring-1 ring-[#C9A96E]/30'
            : 'border-[#D9D1C7] hover:border-[#C9A96E]/60',
          value ? 'text-[#2D2D2D]' : 'text-[#6B6B6B]/60'
        )}
      >
        <CalendarDays className="h-3.5 w-3.5 shrink-0 text-[#C9A96E]" />
        <span>{value ? formatDisplay(value) : placeholder}</span>
        {value && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); clear() }}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); clear() } }}
            className="ml-1 rounded-full p-0.5 text-[#6B6B6B]/40 hover:bg-[#F5F0E8] hover:text-[#6B6B6B] cursor-pointer"
            aria-label="Clear date"
          >
            <X className="h-3 w-3" />
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-72 rounded-xl border border-[#D9D1C7] bg-white shadow-xl">

          {/* Month navigation */}
          <div className="flex items-center justify-between border-b border-[#F0EBE3] px-4 py-3">
            <button
              type="button"
              onClick={prevMonth}
              className="flex h-7 w-7 items-center justify-center rounded-full text-[#6B6B6B] hover:bg-[#FAF8F5] hover:text-[#2D2D2D] cursor-pointer transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-serif text-sm font-medium text-[#2D2D2D]">
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="flex h-7 w-7 items-center justify-center rounded-full text-[#6B6B6B] hover:bg-[#FAF8F5] hover:text-[#2D2D2D] cursor-pointer transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="p-3">
            {/* Weekday headers */}
            <div className="mb-1 grid grid-cols-7">
              {WEEKDAYS.map(d => (
                <div key={d} className="py-1 text-center text-[10px] font-medium uppercase tracking-wider text-[#6B6B6B]/60">
                  {d}
                </div>
              ))}
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7 gap-0.5">
              {cells.map((day, i) => {
                if (day === null) return <div key={`e-${i}`} />
                const selected = isSelected(day)
                const todayMark = isToday(day)
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => selectDay(day)}
                    className={cn(
                      'relative flex aspect-square items-center justify-center rounded-lg text-xs transition-all cursor-pointer',
                      selected
                        ? 'bg-[#C9A96E] text-white font-semibold shadow-sm'
                        : 'text-[#2D2D2D] hover:bg-[#FAF8F5] hover:text-[#C9A96E]',
                      todayMark && !selected && 'font-semibold'
                    )}
                  >
                    {day}
                    {todayMark && !selected && (
                      <span className="absolute bottom-0.5 left-1/2 h-0.5 w-0.5 -translate-x-1/2 rounded-full bg-[#C9A96E]" />
                    )}
                  </button>
                )
              })}
            </div>

            {/* Time row */}
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-[#E8E2DA] bg-[#FAF8F5] px-3 py-2">
              <span className="text-[10px] font-medium uppercase tracking-wider text-[#6B6B6B]">Time</span>
              <div className="ml-auto flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  max={23}
                  value={hour}
                  onChange={e => setHour(pad(Math.min(23, Math.max(0, +e.target.value))))}
                  className="w-10 rounded border border-[#D9D1C7] bg-white px-1.5 py-1 text-center text-xs text-[#2D2D2D] outline-none focus:border-[#C9A96E]"
                />
                <span className="text-xs font-semibold text-[#6B6B6B]">:</span>
                <input
                  type="number"
                  min={0}
                  max={59}
                  step={15}
                  value={minute}
                  onChange={e => setMinute(pad(Math.min(59, Math.max(0, +e.target.value))))}
                  className="w-10 rounded border border-[#D9D1C7] bg-white px-1.5 py-1 text-center text-xs text-[#2D2D2D] outline-none focus:border-[#C9A96E]"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={clear}
                className="flex-1 rounded-lg border border-[#D9D1C7] py-1.5 text-xs text-[#6B6B6B] hover:border-[#6B6B6B] hover:text-[#2D2D2D] transition-colors cursor-pointer"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={confirm}
                disabled={!selDate}
                className="flex-1 rounded-lg bg-[#C9A96E] py-1.5 text-xs font-semibold text-white hover:bg-[#A68B4E] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  )
}
