'use client'

import Link from 'next/link'
import { useScrollAnimate } from '@/hooks/use-scroll-animate'
import { cn } from '@/lib/utils'
import { ArrowRight, MapPin, Phone, Clock } from 'lucide-react'

const contactDetails = [
  { icon: MapPin, label: '123 Luxury Lane, Suite 4, Beverly Hills, CA 90210' },
  { icon: Phone, label: '(310) 555-0187' },
  { icon: Clock, label: 'Tue-Sat: 9AM - 7PM | Sun-Mon: Closed' },
]

export function CtaSection() {
  const { ref, isVisible } = useScrollAnimate()

  return (
    <section id="contact" ref={ref} className="bg-background py-20 lg:py-28">
      <div
        className={cn(
          'mx-auto max-w-4xl px-4 text-center transition-all duration-700 lg:px-8',
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        )}
      >
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.25em] text-gold">
          Ready to Transform?
        </p>
        <h2 className="font-serif text-3xl text-charcoal sm:text-4xl text-balance">
          Your Beauty Journey Starts Here
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-muted-foreground">
          Book your appointment today and experience the difference of
          personalized, luxury beauty care.
        </p>

        <Link
          href="/booking"
          className="group mt-8 inline-flex items-center gap-2 rounded-full bg-gold px-8 py-4 text-sm font-semibold text-primary-foreground transition-all hover:bg-gold-dark hover:shadow-lg"
        >
          Book Your Appointment
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>

        {/* Contact details */}
        <div className="mx-auto mt-14 flex max-w-2xl flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-8">
          {contactDetails.map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-sm text-muted-foreground">
              <item.icon className="h-4 w-4 shrink-0 text-gold/60" />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
