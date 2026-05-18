'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

export function HeroSection({ imageUrl = '/images/hero-bg.jpg' }: { imageUrl?: string }) {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src={imageUrl}
          alt=""
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-charcoal/55" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl px-4 py-32 text-center lg:px-8">
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-gold-light">
          Mobile, AL Luxury Beauty Studio
        </p>
        <h1 className="font-serif text-4xl leading-tight text-card sm:text-5xl md:text-6xl lg:text-7xl text-balance">
          Elevate Your
          <br />
          Natural Beauty
        </h1>
        <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-card/70 sm:text-lg">
          Bespoke eyelash extensions, brow artistry, and permanent makeup
          by Amy — where precision meets luxury.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/booking"
            className="group flex items-center gap-2 rounded-full bg-gold px-8 py-4 text-sm font-semibold text-primary-foreground transition-all hover:bg-gold-dark hover:shadow-lg"
          >
            Book Appointment
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/services"
            className="rounded-full border border-card/30 px-8 py-4 text-sm font-medium text-card transition-all hover:bg-card/10"
          >
            View Services
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2">
        <span className="text-xs uppercase tracking-widest text-card/50">Scroll</span>
        <div className="h-8 w-px bg-card/30" />
      </div>
    </section>
  )
}
