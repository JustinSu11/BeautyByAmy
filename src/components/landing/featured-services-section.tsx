'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useScrollAnimate } from '@/hooks/use-scroll-animate'
import { cn } from '@/lib/utils'
import { ArrowRight, Eye, PenLine, Sparkles } from 'lucide-react'

type ServiceImages = { lashes: string; brows: string; pmu: string }

export function FeaturedServicesSection({ images }: { images: ServiceImages }) {
  const featuredCategories = [
    {
      title: 'Eyelash Extensions',
      description:
        'From classic elegance to dramatic volume sets, every lash is individually applied for a seamless, natural look.',
      icon: Eye,
      image: images.lashes,
      priceFrom: '$75',
    },
    {
      title: 'Brow Artistry',
      description:
        'Lamination, tinting, threading, and henna -- sculpted brows tailored to your unique face shape.',
      icon: PenLine,
      image: images.brows,
      priceFrom: '$20',
    },
    {
      title: 'Permanent Makeup',
      description:
        'Microblading, powder brows, and lip blush -- wake up every day with effortlessly beautiful definition.',
      icon: Sparkles,
      image: images.pmu,
      priceFrom: '$200',
    },
  ]
  const { ref, isVisible } = useScrollAnimate()

  return (
    <section id="services" ref={ref} className="bg-background py-20 lg:py-28 shadow-[inset_0_1px_0_rgba(0,0,0,0.06)]">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        {/* Header */}
        <div
          className={cn(
            'mb-14 text-center transition-all duration-700',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
        >
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.25em] text-gold">
            Our Services
          </p>
          <h2 className="font-serif text-3xl text-charcoal sm:text-4xl text-balance">
            Tailored Beauty Treatments
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-muted-foreground">
            Each service is performed with the highest quality products
            and meticulous attention to detail.
          </p>
        </div>

        {/* Cards */}
        <div
          className={cn(
            'stagger-children grid gap-6 md:grid-cols-3',
            isVisible && 'is-visible'
          )}
        >
          {featuredCategories.map((cat) => (
            <div
              key={cat.title}
              className="group overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-lg"
            >
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={cat.image}
                  alt={cat.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 to-transparent" />
                <div className="absolute bottom-4 left-4 flex h-10 w-10 items-center justify-center rounded-full bg-card/90 backdrop-blur-sm">
                  <cat.icon className="h-5 w-5 text-gold" />
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="font-serif text-xl text-charcoal">{cat.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {cat.description}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">
                    {'From '}
                    <span className="font-semibold text-charcoal">{cat.priceFrom}</span>
                  </span>
                  <Link
                    href="/booking"
                    className="flex items-center gap-1 text-sm font-medium text-gold transition-colors hover:text-gold-dark"
                  >
                    View & Book
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
