import Link from 'next/link'
import { Instagram, Facebook, Mail, MapPin, Phone, Bug } from 'lucide-react'
import { BUSINESS_ADDRESS, BUSINESS_EMAIL, BUSINESS_PHONE } from '@/lib/config'

const footerLinks = [
  { label: 'Home', href: '/' },
  { label: 'Book Appointment', href: '/booking' },
  { label: 'Cancellation Policy', href: '/contact' },
  { label: 'Privacy Policy', href: '/contact' },
  { label: 'Staff Login', href: '/login' },
]

const BUG_REPORT_HREF =
  'mailto:justin.nguyen.swe@gmail.com?subject=Bug%20Report%20%E2%80%94%20BeautyByAmy%20Website&body=Hi%2C%20I%20noticed%20an%20issue%20on%20the%20website%3A%0A%0A[Please%20describe%20what%20happened%20and%20which%20page%20you%20were%20on]'

const socialLinks = [
  { label: 'Instagram', href: 'https://www.instagram.com/iibeautybyamyii/', icon: Instagram },
  { label: 'Facebook', href: 'https://www.facebook.com/iibeautybyamy/', icon: Facebook },
  { label: 'Email', href: `mailto:${BUSINESS_EMAIL}`, icon: Mail },
]

export function SiteFooter() {
  return (
    <footer className="bg-charcoal text-card/80">
      <div className="mx-auto max-w-6xl px-4 py-16 lg:px-8">
        <div className="grid gap-12 md:grid-cols-3">
          {/* Brand */}
          <div>
            <h2 className="font-serif text-2xl text-card">BeautyByAmy</h2>
            <p className="mb-1 text-xs uppercase tracking-[0.25em] text-card/50">
              Luxury Beauty Studio
            </p>
            <p className="mt-4 text-sm leading-relaxed text-card/60">
              Enhancing your natural beauty with meticulous artistry and premium products.
              Every appointment is a bespoke experience.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gold">
              Quick Links
            </h3>
            <ul className="flex flex-col gap-3">
              {footerLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-card/60 transition-colors hover:text-gold-light"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gold">
              Get in Touch
            </h3>
            <ul className="flex flex-col gap-3 text-sm text-card/60">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-gold/60" />
                {BUSINESS_ADDRESS}
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-gold/60" />
                <a href={`tel:${BUSINESS_PHONE}`} className="transition-colors hover:text-gold-light">
                  {BUSINESS_PHONE}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-gold/60" />
                <a href={`mailto:${BUSINESS_EMAIL}`} className="transition-colors hover:text-gold-light">
                  {BUSINESS_EMAIL}
                </a>
              </li>
            </ul>

            {/* Social */}
            <div className="mt-6 flex gap-3">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-card/20 text-card/50 transition-colors hover:border-gold hover:text-gold"
                  aria-label={s.label}
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center gap-3 border-t border-card/10 pt-8 text-xs text-card/40 sm:flex-row sm:justify-between">
          <p>{'© 2026 BeautyByAmy. All rights reserved. Crafted with care.'}</p>
          <a
            href={BUG_REPORT_HREF}
            className="flex items-center gap-1.5 transition-colors hover:text-gold-light"
          >
            <Bug className="h-3.5 w-3.5" />
            Report a bug
          </a>
        </div>
      </div>
    </footer>
  )
}
