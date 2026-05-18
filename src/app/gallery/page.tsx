import type { Metadata } from 'next'
import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'
import { db } from '@/db'
import { galleryImages } from '@/db/schema'
import { GalleryClient, type GalleryCard } from '@/components/gallery/gallery-client'

export const metadata: Metadata = {
  title: 'Gallery — Before & After Results in Mobile, AL',
  description:
    'See real before-and-after results for eyelash extensions, microblading, ombré brows, and lip blush by BeautyByAmy in Mobile, AL. Book your transformation today.',
}

async function getGalleryCards(): Promise<GalleryCard[]> {
  const data = await db
    .select({
      id:         galleryImages.id,
      url:        galleryImages.url,
      before_url: galleryImages.before_url,
      category:   galleryImages.category,
      label:      galleryImages.label,
    })
    .from(galleryImages)
    .orderBy(galleryImages.display_order)

  return data.map((row) => ({
    id:        row.id,
    afterUrl:  row.url,
    afterAlt:  row.label,
    beforeUrl: row.before_url,
    category:  row.category,
    label:     row.label,
  }))
}

export default async function GalleryPage() {
  const cards = await getGalleryCards()

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

          {cards.length === 0 && (
            <p className="py-20 text-center text-sm text-muted-foreground">No gallery images yet.</p>
          )}

          <GalleryClient cards={cards} />

        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
