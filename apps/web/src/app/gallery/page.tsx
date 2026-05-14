import type { Metadata } from 'next'
import Image from 'next/image'
import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'
import { cn } from '@/lib/utils'
import { createServerClient } from '@/lib/supabase'

export const metadata: Metadata = {
  title: 'Gallery | BeautyByAmy',
  description:
    'Browse our portfolio of eyelash extensions, permanent makeup, microblading, and brow services.',
}

type GalleryImage = {
  id: string
  src: string
  alt: string
  category: string
  label: string
  aspect?: string
}

async function getGalleryImages(): Promise<GalleryImage[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('gallery_images')
    .select('id, url, blur_data_url, category, label, display_order')
    .order('display_order')
  if (error) throw new Error('Failed to load gallery')
  return data.map((row) => ({
    id: row.id as string,
    src: row.url as string,
    alt: row.label as string,
    category: row.category as string,
    label: row.label as string,
  }))
}

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

export default async function GalleryPage() {
  const images = await getGalleryImages()

  // Masonry column assignment — guard against fewer than 6 images
  const safeImages = images.slice(0, 6)
  const columns = safeImages.length >= 6
    ? [
        { top: safeImages[0], bottom: safeImages[3] },
        { top: safeImages[1], bottom: safeImages[4] },
        { top: safeImages[2], bottom: safeImages[5] },
      ]
    : []

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

          {/* sm+: 3-column masonry — only renders when 6+ images are loaded */}
          {columns.length > 0 && (
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
          )}

        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
