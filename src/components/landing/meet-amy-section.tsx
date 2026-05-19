'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { useScrollAnimate } from '@/hooks/use-scroll-animate'
import { cn } from '@/lib/utils'
import { Award, Heart, Shield } from 'lucide-react'

const credentials = [
  { icon: Award, label: '3x Certified Brow & Lash Artist' },
  { icon: Shield, label: 'Soft & Natural Results' },
  { icon: Heart, label: 'Done With Love' },
]

export function MeetAmySection({ imageUrl = '/images/amy-portrait.jpg' }: { imageUrl?: string }) {
  const { ref, isVisible } = useScrollAnimate()

  // Bidirectional observer — rises + glows when in view, settles back when scrolled away
  const photoRef = useRef<HTMLDivElement>(null)
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    const el = photoRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setIsFocused(entry.isIntersecting),
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={ref} className="linen-bg py-20 lg:py-28 shadow-[inset_0_1px_0_rgba(0,0,0,0.06)]">
      <div
        className={cn(
          'mx-auto max-w-6xl px-4 lg:px-8 transition-all duration-700',
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        )}
      >
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-16">
          {/* Photo */}
          <div ref={photoRef} className="relative w-full max-w-sm shrink-0 lg:w-2/5">
            <div
              className={cn(
                'relative aspect-[3/4] overflow-hidden rounded-2xl transition-all duration-700 ease-out',
                isFocused
                  ? '-translate-y-3 shadow-[0_24px_64px_rgba(219,168,60,0.38),0_4px_16px_rgba(0,0,0,0.08)]'
                  : 'translate-y-0 shadow-md'
              )}
            >
              <Image
                src={imageUrl}
                alt="Amy, certified beauty specialist and studio owner"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 text-center lg:text-left">
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.25em] text-gold">
              Meet Your Artist
            </p>
            <h2 className="font-serif text-3xl text-charcoal sm:text-4xl text-balance">
              Amy Le
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground lg:text-lg">
              3x Certified Brow & Lash Artist specializing in lash extensions and
              all brow services, including our most popular Ombré Brows. I&apos;m
              dedicated to keeping your results as soft and natural as possible
              while giving you the shape and look that fits you and only you.
            </p>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground lg:text-lg">
              Every appointment is personal. Every service is tailored to your
              unique features. And we do it all with love.
            </p>

            {/* Credentials */}
            <div className="mt-8 flex flex-wrap justify-center gap-6 lg:justify-start">
              {credentials.map((cred) => (
                <div key={cred.label} className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/10">
                    <cred.icon className="h-4 w-4 text-gold" />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {cred.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
