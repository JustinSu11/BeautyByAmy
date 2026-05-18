import type { Metadata } from 'next'
import Link from 'next/link'
import { MapPin, Phone, Mail, Instagram, Facebook, Clock } from 'lucide-react'
import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'

export const metadata: Metadata = {
  title: 'Contact | BeautyByAmy',
  description:
    'Get in touch with BeautyByAmy. Visit our studio in Mobile, AL or reach out by phone and email.',
}

const HOURS = [
  { day: 'Monday',    hours: 'By appointment only' },
  { day: 'Tuesday',   hours: 'By appointment only' },
  { day: 'Wednesday', hours: 'By appointment only' },
  { day: 'Thursday',  hours: 'By appointment only' },
  { day: 'Friday',    hours: 'By appointment only' },
  { day: 'Saturday',  hours: 'By appointment only' },
  { day: 'Sunday',    hours: 'Closed'               },
]

const SOCIAL = [
  {
    label: 'Instagram',
    handle: '@iibeautybyamyii',
    href: 'https://www.instagram.com/iibeautybyamyii/',
    icon: Instagram,
  },
  {
    label: 'Facebook',
    handle: 'iibeautybyamy',
    href: 'https://www.facebook.com/iibeautybyamy/',
    icon: Facebook,
  },
]

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      <main className="pt-28 pb-24">
        <div className="mx-auto max-w-5xl px-4 lg:px-8">

          {/* Page header */}
          <div className="mb-14 text-center">
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.25em] text-gold">
              Get in Touch
            </p>
            <h1 className="font-serif text-4xl text-charcoal sm:text-5xl text-balance">
              Contact Us
            </h1>
            <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
              {"Questions about a service or ready to book? We'd love to hear from you."}
            </p>
          </div>

          <div className="grid gap-10 md:grid-cols-2">

            {/* Left — contact details */}
            <div className="flex flex-col gap-8">

              {/* Location */}
              <div className="rounded-2xl border border-[#E8E2DA] bg-white p-6">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C9A96E]/10">
                    <MapPin className="h-4 w-4 text-gold" />
                  </div>
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-charcoal">
                    Studio Location
                  </h2>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  100 North Florida Street<br />
                  Mobile, AL 36607<br />
                  United States
                </p>
                <a
                  href="https://maps.google.com/?q=100+North+Florida+Street+Mobile+AL+36607"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-gold hover:text-[#A68B4E] transition-colors"
                >
                  Open in Google Maps →
                </a>
              </div>

              {/* Phone & Email */}
              <div className="rounded-2xl border border-[#E8E2DA] bg-white p-6">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C9A96E]/10">
                    <Phone className="h-4 w-4 text-gold" />
                  </div>
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-charcoal">
                    Phone & Email
                  </h2>
                </div>
                <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
                  <li>
                    <a
                      href="tel:+12512732769"
                      className="flex items-center gap-2 hover:text-gold transition-colors"
                    >
                      <Phone className="h-3.5 w-3.5 shrink-0 text-gold/60" />
                      (251) 273-2769
                    </a>
                  </li>
                  <li>
                    <a
                      href="mailto:beautybyamyle@gmail.com"
                      className="flex items-center gap-2 hover:text-gold transition-colors"
                    >
                      <Mail className="h-3.5 w-3.5 shrink-0 text-gold/60" />
                      beautybyamyle@gmail.com
                    </a>
                  </li>
                </ul>
              </div>

              {/* Social */}
              <div className="rounded-2xl border border-[#E8E2DA] bg-white p-6">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C9A96E]/10">
                    <Instagram className="h-4 w-4 text-gold" />
                  </div>
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-charcoal">
                    Follow Along
                  </h2>
                </div>
                <ul className="flex flex-col gap-3">
                  {SOCIAL.map((s) => (
                    <li key={s.label}>
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-sm text-muted-foreground hover:text-gold transition-colors"
                      >
                        <s.icon className="h-4 w-4 shrink-0 text-gold/60" />
                        <span>
                          <span className="font-medium text-charcoal">{s.label}</span>
                          <span className="ml-2 text-muted-foreground">{s.handle}</span>
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right — hours + CTA */}
            <div className="flex flex-col gap-8">

              {/* Hours */}
              <div className="rounded-2xl border border-[#E8E2DA] bg-white p-6">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C9A96E]/10">
                    <Clock className="h-4 w-4 text-gold" />
                  </div>
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-charcoal">
                    Hours
                  </h2>
                </div>
                <ul className="flex flex-col divide-y divide-[#F0EBE4]">
                  {HOURS.map(({ day, hours }) => (
                    <li key={day} className="flex items-center justify-between py-2.5 text-sm">
                      <span className="font-medium text-charcoal">{day}</span>
                      <span className={hours === 'Closed' ? 'text-muted-foreground/50' : 'text-muted-foreground'}>
                        {hours}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-xs leading-relaxed text-muted-foreground/70">
                  All appointments are by request. Book online and Amy will confirm your time.
                </p>
              </div>

              {/* Book CTA */}
              <div className="rounded-2xl bg-charcoal p-6 text-center">
                <p className="mb-1 text-xs font-medium uppercase tracking-[0.2em] text-gold">
                  Ready?
                </p>
                <h3 className="font-serif text-xl text-white">
                  Book Your Appointment
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">
                  {"Choose your service, pick a time, and we'll take care of the rest."}
                </p>
                <Link
                  href="/booking"
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#C9A96E] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[#A68B4E]"
                >
                  Book Now
                </Link>
              </div>

            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
