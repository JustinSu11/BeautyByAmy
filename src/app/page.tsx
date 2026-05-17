import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'
import { HeroSection } from '@/components/landing/hero-section'
import { MeetAmySection } from '@/components/landing/meet-amy-section'
import { FeaturedServicesSection } from '@/components/landing/featured-services-section'
import { TestimonialSection } from '@/components/landing/testimonial-section'
import { CtaSection } from '@/components/landing/cta-section'
import { getSiteImageUrls } from '@/lib/site-images'

export default async function HomePage() {
  const img = await getSiteImageUrls(['hero', 'meet-amy', 'service-lashes', 'service-brows', 'service-pmu'])

  return (
    <>
      <SiteNav />
      <main>
        <HeroSection imageUrl={img['hero']} />
        <MeetAmySection imageUrl={img['meet-amy']} />
        <FeaturedServicesSection images={{ lashes: img['service-lashes'], brows: img['service-brows'], pmu: img['service-pmu'] }} />
        <TestimonialSection />
        <CtaSection />
      </main>
      <SiteFooter />
    </>
  )
}
