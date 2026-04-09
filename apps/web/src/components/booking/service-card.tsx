'use client'

import { useBooking } from '@/lib/booking-context'
import { type Service, formatDuration, formatPrice } from '@/lib/services-data'
import { Clock, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ServiceCardProps {
  service: Service
}

export function ServiceCard({ service }: ServiceCardProps) {
  const { selectService, selectedService } = useBooking()
  const selected = selectedService?.id === service.id

  return (
    <button
      onClick={() => selectService(service)}
      className={cn(
        'group relative flex w-full items-center gap-4 rounded-lg border p-4 text-left transition-all',
        'hover:shadow-sm',
        selected
          ? 'border-gold bg-gold/5 shadow-sm'
          : 'border-border bg-card hover:border-gold-light'
      )}
      aria-pressed={selected}
      type="button"
    >
      {/* Selection indicator */}
      <div
        className={cn(
          'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all',
          selected
            ? 'border-gold bg-gold text-primary-foreground'
            : 'border-border bg-card group-hover:border-gold-light'
        )}
      >
        {selected && <Check className="h-3.5 w-3.5" />}
      </div>

      {/* Service info */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-sm font-medium leading-tight',
          selected ? 'text-charcoal' : 'text-foreground'
        )}>
          {service.name}
        </p>
        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDuration(service.duration)}
          </span>
        </div>
      </div>

      {/* Price */}
      <div className="shrink-0 text-right">
        <span
          className={cn(
            'text-sm font-semibold',
            service.price === 0 ? 'text-gold-dark' : 'text-charcoal'
          )}
        >
          {formatPrice(service.price)}
        </span>
      </div>
    </button>
  )
}
