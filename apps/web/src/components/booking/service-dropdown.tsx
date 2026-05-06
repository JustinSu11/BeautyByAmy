'use client'

import { useState, useRef, useEffect } from 'react'
import { useBooking } from '@/lib/booking-context'
import { categories, getServicesByCategory, formatDuration, formatPrice } from '@/lib/services-data'
import type { Service } from '@/lib/services-data'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ServiceDropdown() {
  const { selectedService, selectService } = useBooking()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSelect(service: Service) {
    selectService(service)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex w-full cursor-pointer items-center justify-between rounded-xl border bg-card px-4 py-3.5 text-left transition-colors',
          open ? 'border-gold ring-2 ring-gold/20' : 'border-border hover:border-gold/50'
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {selectedService ? (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{selectedService.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatDuration(selectedService.duration)} &middot; {formatPrice(selectedService.price)}
            </p>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">Select a service…</span>
        )}
        <ChevronDown
          className={cn('ml-3 h-4 w-4 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[420px] overflow-y-auto rounded-xl border border-border bg-card shadow-xl"
        >
          {categories.map((cat) => {
            const catServices = getServicesByCategory(cat.id)
            if (catServices.length === 0) return null
            return (
              <div key={cat.id}>
                {/* Category heading */}
                <div className="sticky top-0 bg-secondary/80 px-4 py-2 backdrop-blur-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                    {cat.label}
                  </p>
                </div>

                {/* Services in this category */}
                {catServices.map((service) => {
                  const isSelected = selectedService?.id === service.id
                  return (
                    <button
                      key={service.id}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelect(service)}
                      className={cn(
                        'flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary',
                        isSelected && 'bg-gold/5'
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <p className={cn('text-sm', isSelected ? 'font-semibold text-charcoal' : 'text-foreground')}>
                          {service.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDuration(service.duration)} &middot; {formatPrice(service.price)}
                        </p>
                      </div>
                      {isSelected && <Check className="h-4 w-4 shrink-0 text-gold" />}
                    </button>
                  )
                })}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
