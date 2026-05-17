'use client'

import Image from 'next/image'
import { useScrollAnimate } from '@/hooks/use-scroll-animate'
import { cn } from '@/lib/utils'

type GalleryImage = { url: string; label: string }

const COLUMN_ASPECTS = ['aspect-[2/3]', 'aspect-square', 'aspect-[3/4]'] as const

export function GallerySection({ images }: { images: GalleryImage[] }) {
  // Pair images into 3 columns of 2. Any image beyond 6 is ignored; fewer than 6
  // gracefully collapses — columns with no bottom image simply don't render one.
  const columns = [0, 1, 2].map((col) => ({
    top:    images[col * 2]     ?? null,
    bottom: images[col * 2 + 1] ?? null,
    aspect: COLUMN_ASPECTS[col],
  }))
  const { ref, isVisible } = useScrollAnimate()

  return (
    <section id="gallery" ref={ref} className="bg-card py-20 lg:py-28 shadow-[inset_0_1px_0_rgba(0,0,0,0.06)]">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">

        {/* Header */}
        <div
          className={cn(
            'mb-14 text-center transition-all duration-700',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
        >
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.25em] text-gold">
            Portfolio
          </p>
          <h2 className="font-serif text-3xl text-charcoal sm:text-4xl text-balance">
            Our Work Speaks
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-muted-foreground">
            A selection of recent transformations from our studio.
          </p>
        </div>

        {/* Masonry grid — outer flex stretches all columns to the same height;
            top image sets each column's distinct height, bottom image fills the rest */}
        <div
          className={cn(
            'flex items-stretch gap-3 lg:gap-4 transition-all duration-700',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
        >
          {columns.map((col, i) => col.top && (
            <div key={i} className="flex flex-col gap-3 lg:gap-4 flex-1 min-w-0">
              {/* Top image — fixed aspect ratio, drives the column's visual height */}
              <div className={cn('group relative overflow-hidden rounded-2xl', col.aspect)}>
                <Image
                  src={col.top.url}
                  alt={col.top.label}
                  fill
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              </div>

              {/* Bottom image — grows to fill remaining height, all columns bottom-align */}
              {col.bottom && (
                <div className="group relative overflow-hidden rounded-2xl flex-1 min-h-[140px]">
                  <Image
                    src={col.bottom.url}
                    alt={col.bottom.label}
                    fill
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
