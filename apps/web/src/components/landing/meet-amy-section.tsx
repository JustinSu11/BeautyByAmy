'use client'

import Image from 'next/image'
import { useScrollAnimate } from '@/hooks/use-scroll-animate'
import { cn } from '@/lib/utils'
import { Award, Heart, Shield } from 'lucide-react'

const credentials = [
  { icon: Award, label: 'Certified Lash Artist' },
  { icon: Shield, label: '8+ Years Experience' },
  { icon: Heart, label: '2,000+ Happy Clients' },
]

export function MeetAmySection() {
  const { ref, isVisible } = useScrollAnimate()

  return (
    <section ref={ref} className="bg-card py-20 lg:py-28">
      <div
        className={cn(
          'mx-auto max-w-6xl px-4 lg:px-8 transition-all duration-700',
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        )}
      >
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-16">
          {/* Photo */}
          <div className="relative w-full max-w-sm shrink-0 lg:w-2/5">
            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl">
              <Image
                src="/images/amy-portrait.jpg"
                alt="Amy, certified beauty specialist and studio owner"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            </div>
            {/* Gold accent frame */}
            <div className="absolute -bottom-3 -right-3 -z-10 h-full w-full rounded-2xl border-2 border-gold/30" />
          </div>

          {/* Content */}
          <div className="flex-1 text-center lg:text-left">
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.25em] text-gold">
              Meet Your Artist
            </p>
            <h2 className="font-serif text-3xl text-charcoal sm:text-4xl text-balance">
              Amy Chen
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground lg:text-lg">
              With over eight years dedicated to the art of beauty enhancement,
              I specialize in creating looks that are uniquely yours. Every lash,
              every brow stroke, and every pigment is placed with meticulous care
              and an eye for natural elegance.
            </p>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground lg:text-lg">
              My studio is your sanctuary -- a quiet, private space where luxury
              meets comfort. I use only premium, cruelty-free products and follow
              the highest hygiene standards.
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
