import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'
import { HeroSection } from '@/components/landing/hero-section'
import { MeetAmySection } from '@/components/landing/meet-amy-section'
import { FeaturedServicesSection } from '@/components/landing/featured-services-section'
import { TestimonialSection } from '@/components/landing/testimonial-section'
import { CtaSection } from '@/components/landing/cta-section'
import { fetchSquareServices } from '@/lib/square'

// Warm the in-process services cache so the booking page loads instantly.
export default async function HomePage() {
  fetchSquareServices().catch(() => {}) // fire-and-forget; don't block the page

  return (
    <>
      <SiteNav />
      <main>
        <HeroSection />
        <MeetAmySection />
        <FeaturedServicesSection />
<TestimonialSection />
        <CtaSection />
      </main>
      <SiteFooter />
    </>
  )
}
