'use client'

import { useState } from 'react'
import { categories, getServicesByCategory } from '@/lib/services-data'
import { useBooking } from '@/lib/booking-context'
import { ServiceCard } from './service-card'
import { Eye, PenLine, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

const categoryIcons = {
  eyelashes: Eye,
  brows: PenLine,
  'permanent-makeup': Sparkles,
}

export function ServiceList() {
  const { services } = useBooking()
  const [activeCategory, setActiveCategory] = useState<string>(categories[0].id)

  return (
    <div>
      {/* Category tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1 scrollbar-none" role="tablist">
        {categories.map((cat) => {
          const Icon = categoryIcons[cat.id]
          const isActive = activeCategory === cat.id
          const count = getServicesByCategory(services, cat.id).length
          return (
            <button
              key={cat.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                'flex shrink-0 cursor-pointer items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-charcoal text-primary-foreground shadow-sm'
                  : 'bg-secondary text-secondary-foreground hover:bg-muted'
              )}
            >
              <Icon className="h-4 w-4" />
              {cat.label}
              <span className={cn(
                'rounded-full px-1.5 py-0.5 text-xs',
                isActive ? 'bg-white/20 text-primary-foreground' : 'bg-background text-muted-foreground'
              )}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Services grid */}
      {categories.map((cat) => (
        <div
          key={cat.id}
          role="tabpanel"
          hidden={activeCategory !== cat.id}
          className="flex flex-col gap-3"
        >
          {activeCategory === cat.id &&
            getServicesByCategory(services, cat.id).map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
        </div>
      ))}
    </div>
  )
}
