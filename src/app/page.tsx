import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'
import { HeroSection } from '@/components/landing/hero-section'
import { MeetAmySection } from '@/components/landing/meet-amy-section'
import { FeaturedServicesSection } from '@/components/landing/featured-services-section'
import { TestimonialSection } from '@/components/landing/testimonial-section'
import { CtaSection } from '@/components/landing/cta-section'
import { getSiteImageUrls } from '@/lib/site-images'

export default async function HomePage() {
  const images = await getSiteImageUrls(['hero', 'meet-amy'])

  return (
    <>
      <SiteNav />
      <main>
        <HeroSection imageUrl={images['hero']} />
        <MeetAmySection imageUrl={images['meet-amy']} />
        <FeaturedServicesSection />
<TestimonialSection />
        <CtaSection />
      </main>
      <SiteFooter />
    </>
  )
}
