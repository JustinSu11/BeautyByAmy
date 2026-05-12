import type { Metadata } from 'next'
import Image from 'next/image'
import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Gallery | BeautyByAmy',
  description:
    'Browse our portfolio of eyelash extensions, permanent makeup, microblading, and brow services.',
}

type GalleryImage = {
  src: string
  alt: string
  category: string
  label: string
  aspect?: string
}

// Single source of truth — both grids pull from here
const images: GalleryImage[] = [
  {
    src:      '/images/gallery-1.jpg',
    alt:      'Classic eyelash extension close-up',
    category: 'Lash Extensions',
    label:    'Classic Set',
    aspect:   'aspect-[2/3]',
  },
  {
    src:      '/images/gallery-2.jpg',
    alt:      'Brow lamination before and after',
    category: 'Brow Services',
    label:    'Brow Lamination',
    aspect:   'aspect-square',
  },
  {
    src:      '/images/gallery-3.jpg',
    alt:      'Volume lash set — full look',
    category: 'Lash Extensions',
    label:    'Volume Set',
    aspect:   'aspect-[3/4]',
  },
  {
    src:      '/images/gallery-4.jpg',
    alt:      'Lip blush permanent makeup result',
    category: 'Permanent Makeup',
    label:    'Lip Blush',
  },
  {
    src:      '/images/gallery-5.jpg',
    alt:      'Microblading healed result',
    category: 'Permanent Makeup',
    label:    'Microblading',
  },
  {
    src:      '/images/gallery-6.jpg',
    alt:      'Studio suite detail',
    category: 'Our Studio',
    label:    'BeautyByAmy Studio',
  },
]

// Masonry column assignment: [0,3] | [1,4] | [2,5]
const columns = [
  { top: images[0], bottom: images[3] },
  { top: images[1], bottom: images[4] },
  { top: images[2], bottom: images[5] },
]

// Overlay that reveals on hover — gradient + category pill + service name
function ImageOverlay({ category, label }: { category: string; label: string }) {
  return (
    <div className="absolute inset-0 flex flex-col justify-end opacity-100 transition-opacity duration-300 sm:opacity-0 sm:group-hover:opacity-100">
      {/* Gradient scrim */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      {/* Text */}
      <div className="relative px-4 pb-4">
        <p className="mb-1 text-[9px] font-medium uppercase tracking-[0.2em] text-gold-light">
          {category}
        </p>
        <p className="font-serif text-sm leading-tight text-white sm:text-base">
          {label}
        </p>
      </div>
    </div>
  )
}

export default function GalleryPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      <main className="pt-28 pb-24">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">

          {/* Page header */}
          <div className="mb-14 text-center">
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.25em] text-gold">
              Portfolio
            </p>
            <h1 className="font-serif text-4xl text-charcoal sm:text-5xl text-balance">
              Our Work
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-muted-foreground">
              A curated selection of transformations from our studio — lashes, brows, and
              permanent makeup artistry.
            </p>
          </div>

          {/* Mobile: 2-column uniform grid (< sm) */}
          <div className="grid grid-cols-2 gap-3 sm:hidden">
            {images.map((img) => (
              <div key={img.src} className="group relative aspect-[3/4] overflow-hidden rounded-2xl">
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  sizes="50vw"
                />
                <ImageOverlay category={img.category} label={img.label} />
              </div>
            ))}
          </div>

          {/* sm+: 3-column masonry — top image sets column height; bottom fills the rest */}
          <div className="hidden sm:flex sm:items-stretch sm:gap-4">
            {columns.map((col) => (
              <div key={col.top.src} className="flex flex-1 min-w-0 flex-col gap-4">

                {/* Top image — fixed aspect ratio drives column height variation */}
                <div className={cn('group relative overflow-hidden rounded-2xl', col.top.aspect)}>
                  <Image
                    src={col.top.src}
                    alt={col.top.alt}
                    fill
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    sizes="33vw"
                  />
                  <ImageOverlay category={col.top.category} label={col.top.label} />
                </div>

                {/* Bottom image — stretches to fill remaining height */}
                <div className="group relative flex-1 overflow-hidden rounded-2xl min-h-[180px]">
                  <Image
                    src={col.bottom.src}
                    alt={col.bottom.alt}
                    fill
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    sizes="33vw"
                  />
                  <ImageOverlay category={col.bottom.category} label={col.bottom.label} />
                </div>

              </div>
            ))}
          </div>

        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
