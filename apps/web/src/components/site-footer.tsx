import Link from 'next/link'
import { Instagram, Facebook, Mail, MapPin, Phone } from 'lucide-react'

const footerLinks = [
  { label: 'Home', href: '/' },
  { label: 'Book Appointment', href: '/booking' },
  { label: 'Cancellation Policy', href: '/#contact' },
  { label: 'Privacy Policy', href: '/#contact' },
]

const socialLinks = [
  { label: 'Instagram', href: 'https://www.instagram.com/iibeautybyamyii/', icon: Instagram },
  { label: 'Facebook', href: 'https://www.facebook.com/iibeautybyamy/', icon: Facebook },
  { label: 'Email', href: 'mailto:beautybyamyle@gmail.com', icon: Mail },
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
                100 North Florida Street, Mobile, AL, United States, 36607
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-gold/60" />
                (251) 273-2769
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-gold/60" />
                beautybyamyle@gmail.com
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
        <div className="mt-12 border-t border-card/10 pt-8 text-center text-xs text-card/40">
          <p>
            {'© 2026 BeautyByAmy. All rights reserved. Crafted with care.'}
          </p>
        </div>
      </div>
    </footer>
  )
}
