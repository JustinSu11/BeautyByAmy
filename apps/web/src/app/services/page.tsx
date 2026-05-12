import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'
import { ServicesStickyNav } from '@/components/services/services-sticky-nav'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Services | BeautyByAmy',
  description:
    'Browse our full menu of eyelash extensions, brow services, and permanent makeup treatments — with transparent pricing and easy online booking.',
}

// ── Data ──────────────────────────────────────────────────────────────────────

const categories = [
  {
    id: 'lashes',
    num: '01',
    name: 'Lashes',
    label: 'Lash Extensions',
    description:
      'Individually applied silk lashes — classic, hybrid, or full volume — for a seamless, customised look that enhances your natural eye shape.',
    image: { src: '/images/gallery-1.jpg', alt: 'Classic eyelash extension close-up' },
    groups: [
      {
        label: 'Classic',
        services: [
          { name: 'Classic Set',                          duration: '2 hrs 30 mins', price: '$185' },
          { name: 'Classic Touch Up — 7 to 14 days',     duration: '45 mins',       price: '$60'  },
          { name: 'Classic Touch Up — 15 to 21 days',    duration: '1 hr',          price: '$80'  },
          { name: 'Classic Touch Up — 22 to 28 days',    duration: '1 hr 15 mins',  price: '$100' },
        ],
      },
      {
        label: 'Volume',
        services: [
          { name: 'Volume Set',                           duration: '2 hrs 30 mins', price: '$210' },
          { name: 'Volume Touch Up — 7 to 14 days',      duration: '1 hr',          price: '$90'  },
          { name: 'Volume Touch Up — 15 to 21 days',     duration: '1 hr 15 mins',  price: '$110' },
          { name: 'Volume Touch Up — 22 to 28 days',     duration: '1 hr 30 mins',  price: '$130' },
        ],
      },
      {
        label: 'Hybrid',
        services: [
          { name: 'Hybrid Set',                           duration: '2 hrs 15 mins', price: '$195' },
          { name: 'Hybrid Touch Up — 7 to 14 days',      duration: '50 mins',       price: '$75'  },
          { name: 'Hybrid Touch Up — 15 to 21 days',     duration: '1 hr 5 mins',   price: '$95'  },
          { name: 'Hybrid Touch Up — 22 to 28 days',     duration: '1 hr 20 mins',  price: '$115' },
        ],
      },
      {
        label: 'Other',
        services: [
          { name: 'Touch Up',    duration: '1 hr 30 mins', price: '$100' },
          { name: 'Lash Removal', duration: '30 mins',     price: '$30'  },
        ],
      },
    ],
  },
  {
    id: 'brows',
    num: '02',
    name: 'Brows',
    label: 'Brow Services',
    description:
      'Shape, tint, and define. Quick, high-impact brow treatments to keep your arches perfectly groomed between appointments.',
    image: { src: '/images/gallery-2.jpg', alt: 'Brow lamination before and after' },
    groups: [
      {
        label: null,
        services: [
          { name: 'Brow Tint',         duration: '30 mins', price: '$35'          },
          { name: 'Brow Wax',          duration: '15 mins', price: '$15'          },
          { name: 'Color Splash-Ins',  duration: '30 mins', price: '$50'          },
          { name: 'Chin Wax',          duration: '30 mins', price: 'Price varies' },
        ],
      },
    ],
  },
  {
    id: 'pmu',
    num: '03',
    name: 'Permanent\nMakeup',
    label: 'Permanent Makeup',
    description:
      'Semi-permanent artistry for brows and lips — wake up every morning with effortless definition that lasts years, not hours.',
    image: { src: '/images/gallery-5.jpg', alt: 'Microblading healed result' },
    groups: [
      {
        label: 'Brows',
        services: [
          { name: 'Microblading',              duration: '2 hrs 45 mins', price: '$450' },
          { name: 'Microshading',              duration: '3 hrs',         price: '$650' },
          { name: 'Ombré Brows',              duration: '2 hrs 30 mins', price: '$500' },
          { name: 'Ombré Cover-Up',           duration: '3 hrs',         price: '$650' },
          { name: 'Microshading Cover-Up',     duration: '3 hrs 30 mins', price: '$750' },
          { name: 'Cover-Up with Correction',  duration: '3 hrs 30 mins', price: '$800' },
        ],
      },
      {
        label: 'Lips',
        services: [
          { name: 'Lip Blush', duration: '3 hrs', price: '$600' },
        ],
      },
      {
        label: 'Color Refreshes',
        services: [
          { name: 'Brow Color Refresh — 8 weeks to 6 months',  duration: '2 hrs',         price: '$175' },
          { name: 'Brow Color Refresh — 6 months to 1 year',   duration: '2 hrs 15 mins', price: '$250' },
          { name: 'Brow Color Refresh — 12 to 20 months',      duration: '2 hrs 30 mins', price: '$375' },
        ],
      },
    ],
  },
  {
    id: 'addons',
    num: '04',
    name: 'Add-ons',
    label: 'Consultations & Add-ons',
    description:
      "Not sure where to start? Book a consultation with Amy to discuss your goals, skin tone, and lifestyle before committing to a treatment.",
    image: { src: '/images/gallery-6.jpg', alt: 'BeautyByAmy studio suite' },
    groups: [
      {
        label: null,
        services: [
          { name: 'PMU Consultation',               duration: '30 mins', price: '$25'  },
          { name: 'Patch Test',                     duration: '30 mins', price: '$25'  },
          { name: 'Additional Correction / Touch Up', duration: '2 hrs', price: '$150' },
        ],
      },
    ],
  },
]

// ── Components ────────────────────────────────────────────────────────────────

function ServiceRow({ name, duration, price }: { name: string; duration: string; price: string }) {
  const isVaries = price === 'Price varies'
  return (
    <div className="group grid grid-cols-[1fr_auto_auto] items-center gap-x-4 border-b border-border py-4 pl-3 transition-all duration-150 hover:bg-cream-dark/60 hover:pl-4 sm:grid-cols-[1fr_auto_auto_auto] sm:gap-x-6">
      {/* Gold left-bar accent on hover */}
      <div className="absolute left-0 top-0 h-full w-[3px] origin-center scale-y-0 rounded-r-sm bg-gold transition-transform duration-200 group-hover:scale-y-100" />

      {/* Name + duration (duration below name on mobile, separate column on sm+) */}
      <div className="relative min-w-0">
        <p className="truncate text-sm font-normal text-foreground sm:text-[15px]">{name}</p>
        <p className="mt-0.5 text-xs font-light text-muted-foreground sm:hidden">{duration}</p>
      </div>

      {/* Duration — hidden on mobile, visible sm+ */}
      <p className="hidden text-xs font-light whitespace-nowrap text-muted-foreground sm:block sm:text-[13px]">
        {duration}
      </p>

      {/* Price */}
      <p className={cn(
        'whitespace-nowrap text-right font-serif text-base font-normal sm:text-lg',
        isVaries ? 'font-sans text-xs italic font-light text-muted-foreground' : 'text-gold-dark'
      )}>
        {price}
      </p>

      {/* Book button */}
      <Link
        href="/booking"
        className="whitespace-nowrap rounded-full border border-border px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.08em] text-foreground transition-all duration-150 hover:border-gold hover:bg-gold hover:text-white sm:px-4"
      >
        Book
      </Link>
    </div>
  )
}

function OrnamentDivider() {
  return (
    <div className="my-8 flex items-center">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold-light to-transparent" />
      <div className="mx-4 h-[7px] w-[7px] rotate-45 bg-gold opacity-60" />
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold-light to-transparent" />
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ServicesPage() {
  return (
    <div className="linen-bg grain-overlay min-h-screen">
      <SiteNav />

      <main>
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-4 pb-0 pt-28 lg:px-8 lg:pt-36">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">

            {/* Left — text */}
            <div>
              <p className="mb-6 flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.35em] text-gold-dark">
                <span className="h-px w-8 bg-gold" />
                Our Services
              </p>
              <h1 className="font-serif text-5xl leading-[1.04] tracking-tight text-charcoal sm:text-6xl lg:text-7xl">
                Beauty,<br />
                <em className="italic text-gold-dark">precisely</em><br />
                crafted.
              </h1>
              <p className="mt-6 max-w-md text-[15px] font-light leading-relaxed text-muted-foreground">
                From natural lash enhancements to semi-permanent artistry — every
                service is tailored to you, performed with the finest techniques
                and premium products.
              </p>

              {/* Stats — visible on mobile where image is hidden */}
              <div className="mt-8 flex gap-8 lg:hidden">
                {[['31+', 'Services'], ['4', 'Categories'], ['$15', 'Starting from']].map(([num, lbl]) => (
                  <div key={lbl}>
                    <p className="font-serif text-3xl text-gold">{num}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.15em] text-muted-foreground">{lbl}</p>
                  </div>
                ))}
              </div>

              <a
                href="#lashes"
                className="mt-10 inline-flex items-center gap-3 text-[12px] font-medium uppercase tracking-[0.12em] text-charcoal transition-colors hover:text-gold-dark"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border transition-colors hover:border-gold">
                  ↓
                </span>
                Explore all 31 services
              </a>
            </div>

            {/* Right — hero image (hidden on mobile) */}
            <div className="relative hidden lg:block">
              {/* Offset gold border frame */}
              <div className="absolute -left-3 -top-3 bottom-3 right-3 rounded-[200px_200px_160px_160px] border border-gold-light" />
              {/* Image */}
              <div className="relative h-[580px] overflow-hidden rounded-[200px_200px_160px_160px] shadow-[0_32px_80px_rgba(45,45,45,0.18)]">
                <Image
                  src="/images/gallery-3.jpg"
                  alt="Volume lash set"
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 1280px) 50vw, 560px"
                  priority
                />
              </div>
              {/* Floating stat cards */}
              <div className="absolute -right-6 top-10 flex flex-col gap-3">
                {[['31+', 'SERVICES'], ['4', 'CATEGORIES']].map(([num, lbl]) => (
                  <div key={lbl} className="rounded-xl border border-border bg-card px-4 py-3 shadow-md text-center">
                    <p className="font-serif text-2xl text-gold">{num}</p>
                    <p className="mt-0.5 text-[9px] uppercase tracking-[0.15em] text-muted-foreground">{lbl}</p>
                  </div>
                ))}
              </div>
              {/* Floating price badge */}
              <div className="absolute -left-8 bottom-14 rounded-2xl border border-border bg-card px-5 py-4 shadow-lg">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Starting from</p>
                <p className="mt-1 font-serif text-3xl text-gold-dark">$15</p>
                <p className="text-xs font-light text-muted-foreground">Brow wax · 15 mins</p>
              </div>
            </div>

          </div>
        </section>

        {/* ── Sticky category nav ───────────────────────────────────────── */}
        <ServicesStickyNav />

        {/* ── Category sections ─────────────────────────────────────────── */}
        <div className="mx-auto max-w-6xl px-4 pb-24 lg:px-8">
          {categories.map((cat, i) => (
            <section
              key={cat.id}
              id={cat.id}
              className={cn('relative pt-20', i > 0 && 'border-t border-border')}
            >
              {/* Ghost number watermark */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -left-4 top-14 select-none font-serif text-[160px] font-semibold leading-none tracking-tighter text-charcoal opacity-[0.028] sm:text-[200px]"
              >
                {cat.num}
              </span>

              {/* Category header */}
              <div className="relative mb-0 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <p className="mb-2 font-serif text-[12px] italic tracking-[0.08em] text-gold">
                    {cat.num} — {cat.label}
                  </p>
                  <h2 className="whitespace-pre-line font-serif text-4xl leading-[1.08] text-charcoal sm:text-5xl">
                    {cat.name}
                  </h2>
                  <p className="mt-4 max-w-md text-[14px] font-light leading-relaxed text-muted-foreground">
                    {cat.description}
                  </p>
                </div>

                {/* Category image — pill shape, floated right */}
                <div className="w-32 shrink-0 self-start sm:w-40">
                  <div className="relative h-44 overflow-hidden rounded-[80px_80px_64px_64px] border border-gold-light shadow-lg sm:h-52">
                    <Image
                      src={cat.image.src}
                      alt={cat.image.alt}
                      fill
                      className="object-cover object-top"
                      sizes="(max-width: 640px) 128px, 160px"
                    />
                  </div>
                </div>
              </div>

              <OrnamentDivider />

              {/* Service groups */}
              {cat.groups.map((group) => (
                <div key={group.label ?? 'default'} className="relative mb-10">
                  {group.label && (
                    <div className="mb-0 flex items-center gap-3 pb-3">
                      <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-gold-dark">
                        {group.label}
                      </p>
                      <div className="h-px flex-1 bg-border" />
                    </div>
                  )}
                  <div className="relative border-t border-border">
                    {group.services.map((svc) => (
                      <div key={svc.name} className="relative">
                        <ServiceRow {...svc} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          ))}

          {/* ── CTA Banner ─────────────────────────────────────────────── */}
          <div className="relative mt-16 overflow-hidden rounded-3xl">
            <Image
              src="/images/gallery-6.jpg"
              alt="BeautyByAmy studio"
              fill
              className="object-cover"
              sizes="(max-width: 1280px) 100vw, 1200px"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-charcoal/92 via-charcoal/75 to-charcoal/50" />

            <div className="relative flex flex-col items-start gap-8 p-8 sm:p-12 lg:flex-row lg:items-center lg:justify-between lg:p-16">
              <div>
                <h2 className="font-serif text-3xl leading-snug text-white sm:text-4xl">
                  Ready for your<br />
                  <em className="italic text-gold-light">next appointment?</em>
                </h2>
                <p className="mt-3 max-w-sm text-sm font-light text-white/50">
                  Select your service, pick a time, and Amy will take care of the rest.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-end">
                <Link
                  href="/booking"
                  className="inline-flex items-center gap-2 rounded-full bg-gold px-8 py-4 text-sm font-medium text-white transition-colors hover:bg-gold-dark"
                >
                  Book an Appointment
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/gallery"
                  className="text-center text-xs font-light tracking-wide text-white/40 transition-colors hover:text-white/70"
                >
                  View our gallery first
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
