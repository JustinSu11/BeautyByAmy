import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'
import { HeroSection } from '@/components/landing/hero-section'
import { MeetAmySection } from '@/components/landing/meet-amy-section'
import { FeaturedServicesSection } from '@/components/landing/featured-services-section'
import { GallerySection } from '@/components/landing/gallery-section'
import { TestimonialSection } from '@/components/landing/testimonial-section'
import { CtaSection } from '@/components/landing/cta-section'

export default function HomePage() {
  return (
    <>
      <SiteNav />
      <main>
        <HeroSection />
        <MeetAmySection />
        <FeaturedServicesSection />
        <GallerySection />
        <TestimonialSection />
        <CtaSection />
      </main>
      <SiteFooter />
    </>
  )
}
