import type { Metadata } from 'next'
import Image from 'next/image'
import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'
import { cn } from '@/lib/utils'
import { db } from '@/db'
import { galleryImages } from '@/db/schema'

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
}

async function getGalleryImages(): Promise<GalleryImage[]> {
  const data = await db
    .select({ id: galleryImages.id, url: galleryImages.url, blur_data_url: galleryImages.blur_data_url, category: galleryImages.category, label: galleryImages.label })
    .from(galleryImages)
    .orderBy(galleryImages.display_order)

  return data.map((row) => ({
    id:       row.id,
    src:      row.url,
    alt:      row.label,
    category: row.category,
    label:    row.label,
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

// Alternate aspect ratios so the masonry grid has visual rhythm
const TOP_ASPECTS    = ['aspect-[2/3]', 'aspect-square', 'aspect-[3/4]']
const BOTTOM_ASPECTS = ['aspect-[4/3]', 'aspect-[4/3]', 'aspect-[4/3]']

export default async function GalleryPage() {
  const images = await getGalleryImages()

  // Distribute images across 3 columns in order (1st→col0, 2nd→col1, 3rd→col2, 4th→col0, …)
  const cols: GalleryImage[][] = [[], [], []]
  images.forEach((img, i) => cols[i % 3].push(img))

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

          {images.length === 0 && (
            <p className="py-20 text-center text-sm text-muted-foreground">No gallery images yet.</p>
          )}

          {/* Mobile: 2-column grid */}
          <div className="grid grid-cols-2 gap-3 sm:hidden">
            {images.map((img) => (
              <div key={img.id} className="group relative aspect-[3/4] overflow-hidden rounded-2xl">
                <Image src={img.src} alt={img.alt} fill
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  sizes="50vw"
                />
                <ImageOverlay category={img.category} label={img.label} />
              </div>
            ))}
          </div>

          {/* sm+: 3-column masonry with explicit aspect ratios per row */}
          <div className="hidden sm:flex sm:gap-4">
            {cols.map((col, colIdx) => (
              <div key={colIdx} className="flex flex-1 min-w-0 flex-col gap-4">
                {col.map((img, rowIdx) => {
                  const aspect = rowIdx % 2 === 0
                    ? TOP_ASPECTS[colIdx]
                    : BOTTOM_ASPECTS[colIdx]
                  return (
                    <div key={img.id} className={cn('group relative overflow-hidden rounded-2xl', aspect)}>
                      <Image src={img.src} alt={img.alt} fill
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        sizes="33vw"
                      />
                      <ImageOverlay category={img.category} label={img.label} />
                    </div>
                  )
                })}
              </div>
            ))}
          </div>

        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
