import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'
import { HeroSection } from '@/components/landing/hero-section'
import { MeetAmySection } from '@/components/landing/meet-amy-section'
import { FeaturedServicesSection } from '@/components/landing/featured-services-section'
import { GallerySection } from '@/components/landing/gallery-section'
import { TestimonialSection } from '@/components/landing/testimonial-section'
import { CtaSection } from '@/components/landing/cta-section'
import { getSiteImageUrls } from '@/lib/site-images'

const ALL_SLOTS = [
  'hero', 'meet-amy',
  'service-lashes', 'service-brows', 'service-pmu',
  'gallery-1', 'gallery-2', 'gallery-3',
  'gallery-4', 'gallery-5', 'gallery-6',
]

export default async function HomePage() {
  const img = await getSiteImageUrls(ALL_SLOTS)

  return (
    <>
      <SiteNav />
      <main>
        <HeroSection imageUrl={img['hero']} />
        <MeetAmySection imageUrl={img['meet-amy']} />
        <FeaturedServicesSection images={{ lashes: img['service-lashes'], brows: img['service-brows'], pmu: img['service-pmu'] }} />
        <GallerySection images={{ g1: img['gallery-1'], g2: img['gallery-2'], g3: img['gallery-3'], g4: img['gallery-4'], g5: img['gallery-5'], g6: img['gallery-6'] }} />
        <TestimonialSection />
        <CtaSection />
      </main>
      <SiteFooter />
    </>
  )
}
