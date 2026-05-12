'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

const categories = [
  { id: 'lashes',  label: 'Lash Extensions' },
  { id: 'brows',   label: 'Brow Services' },
  { id: 'pmu',     label: 'Permanent Makeup' },
  { id: 'addons',  label: 'Add-ons' },
]

export function ServicesStickyNav() {
  const [active, setActive] = useState('lashes')

  useEffect(() => {
    const OFFSET = 120 // nav (64) + sticky nav (~45) + buffer

    function onScroll() {
      let current = categories[0].id
      for (const cat of categories) {
        const el = document.getElementById(cat.id)
        if (el && el.getBoundingClientRect().top <= OFFSET + 40) {
          current = cat.id
        }
      }
      setActive(current)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="sticky top-16 z-40 border-b border-border bg-background/92 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <div className="flex overflow-x-auto scrollbar-none">
          {categories.map((cat) => (
            <a
              key={cat.id}
              href={`#${cat.id}`}
              className={cn(
                'flex-shrink-0 border-b-2 px-4 py-4 text-[11px] font-medium uppercase tracking-[0.1em] whitespace-nowrap transition-colors duration-200 sm:px-6',
                active === cat.id
                  ? 'border-gold text-charcoal'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {cat.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
