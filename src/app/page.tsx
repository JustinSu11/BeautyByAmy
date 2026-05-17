import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'
import { HeroSection } from '@/components/landing/hero-section'
import { MeetAmySection } from '@/components/landing/meet-amy-section'
import { FeaturedServicesSection } from '@/components/landing/featured-services-section'
import { GallerySection } from '@/components/landing/gallery-section'
import { TestimonialSection } from '@/components/landing/testimonial-section'
import { CtaSection } from '@/components/landing/cta-section'
import { getSiteImageUrls } from '@/lib/site-images'
import { db } from '@/db'
import { galleryImages } from '@/db/schema'

export default async function HomePage() {
  const [img, gallery] = await Promise.all([
    getSiteImageUrls(['hero', 'meet-amy', 'service-lashes', 'service-brows', 'service-pmu']),
    db.select({ url: galleryImages.url, label: galleryImages.label })
      .from(galleryImages)
      .orderBy(galleryImages.display_order)
      .limit(6),
  ])

  return (
    <>
      <SiteNav />
      <main>
        <HeroSection imageUrl={img['hero']} />
        <MeetAmySection imageUrl={img['meet-amy']} />
        <FeaturedServicesSection images={{ lashes: img['service-lashes'], brows: img['service-brows'], pmu: img['service-pmu'] }} />
        <GallerySection images={gallery} />
        <TestimonialSection />
        <CtaSection />
      </main>
      <SiteFooter />
    </>
  )
}
