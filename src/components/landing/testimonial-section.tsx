'use client'

import { useState, useEffect, useCallback } from 'react'
import { useScrollAnimate } from '@/hooks/use-scroll-animate'
import { cn } from '@/lib/utils'
import { ThumbsUp, ChevronLeft, ChevronRight } from 'lucide-react'

const testimonials = [
  {
    quote:
      "Amy did my permanent ombré eyebrows and I couldn't be happier. She educated me throughout the entire process, carefully mapped my shape, and made sure I felt completely comfortable and pain-free from start to finish. My brows turned out beautifully — I'm so glad I made this investment!",
    name: 'Latoya Walker',
    detail: 'Permanent Ombré Brows',
  },
  {
    quote:
      "Amy takes so much pride in her work! She will make sure it is perfection before she sends you out that door. I've had my ombré brows since 2019 and they still look so good — I get compliments on them daily on how natural they look. 10/10 highly recommend!",
    name: 'Roth Ouisy',
    detail: 'Ombré Brows',
  },
  {
    quote:
      "I've been going to Amy for years and every single visit has been an absolute pleasure. She's professional, warm, and genuinely cares about how you feel walking out of that chair. My lashes always look amazing, last beautifully, and never feel rushed. She's truly a master of her craft.",
    name: 'Shelly Kolger',
    detail: 'Lash Extensions',
  },
  {
    quote:
      "After a terrible microblading experience, I turned to Amy for help. From the moment I arrived, her kindness, attention to detail, and dedication made me feel truly at ease. She treated me like a queen. Don't hesitate to book — you'll be absolutely thrilled, because she'll guarantee it!",
    name: 'Patra Prim',
    detail: 'Brow Transformation',
  },
  {
    quote:
      "Amy is great at what she does! I've done brows and lips with her and I wouldn't trust anyone else at this point. 100% recommend!",
    name: 'Meg Slezak',
    detail: 'Brows & Lip Blush',
  },
  {
    quote:
      "Amy is the first and will be the only to do lashes for me! She provided a relaxing atmosphere and service that is unmatched. Highly recommend Amy for your lash and brow needs!",
    name: 'Barclay Davis',
    detail: 'Lash Extensions',
  },
]

export function TestimonialSection() {
  const { ref, isVisible } = useScrollAnimate()
  const [current, setCurrent] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const goTo = useCallback(
    (index: number) => {
      if (isTransitioning) return
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrent(index)
        setIsTransitioning(false)
      }, 300)
    },
    [isTransitioning]
  )

  const prev = useCallback(() => {
    goTo(current === 0 ? testimonials.length - 1 : current - 1)
  }, [current, goTo])

  const next = useCallback(() => {
    goTo(current === testimonials.length - 1 ? 0 : current + 1)
  }, [current, goTo])

  // Auto-rotate every 6s
  useEffect(() => {
    const timer = setInterval(next, 6000)
    return () => clearInterval(timer)
  }, [next])

  return (
    <section ref={ref} className="bg-charcoal py-20 lg:py-28 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
      <div
        className={cn(
          'mx-auto max-w-3xl px-4 text-center transition-all duration-700 lg:px-8',
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        )}
      >
        {/* Label */}
        <p className="mb-6 text-xs font-medium uppercase tracking-[0.25em] text-gold-light">
          What Our Clients Say
        </p>

        {/* Recommends badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5">
          <ThumbsUp className="h-3.5 w-3.5 text-gold" />
          <span className="text-xs font-medium uppercase tracking-wider text-gold-light">Recommends Amy</span>
        </div>

        {/* Quote area — CSS grid overlay: all slides share the same cell so the
            container height is always set by the longest testimonial, never shifts */}
        <div className="grid">
          {testimonials.map((testimonial, i) => (
            <blockquote
              key={i}
              aria-hidden={i !== current}
              className={cn(
                '[grid-area:1/1] font-serif text-xl leading-relaxed italic text-card/90 transition-all duration-300 sm:text-2xl lg:text-3xl text-balance',
                i === current
                  ? isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
                  : 'opacity-0 pointer-events-none select-none'
              )}
            >
              {`"${testimonial.quote}"`}
            </blockquote>
          ))}
        </div>

        {/* Author — grid overlay same pattern */}
        <div className="mt-8 grid">
          {testimonials.map((testimonial, i) => (
            <div
              key={i}
              aria-hidden={i !== current}
              className={cn(
                '[grid-area:1/1] flex flex-col items-center gap-1 transition-all duration-300',
                i === current
                  ? isTransitioning ? 'opacity-0' : 'opacity-100'
                  : 'opacity-0 pointer-events-none select-none'
              )}
            >
              <cite className="text-sm font-semibold not-italic text-card/80">
                {testimonial.name}
              </cite>
              <span className="text-xs text-gold-light">{testimonial.detail}</span>
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="mt-10 flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={prev}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-card/20 text-card/50 transition-colors hover:border-gold hover:text-gold"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Dots */}
          <div className="flex items-center gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                className={cn(
                  'h-1.5 cursor-pointer rounded-full transition-all',
                  i === current ? 'w-6 bg-gold' : 'w-1.5 bg-card/30 hover:bg-card/50'
                )}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={next}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-card/20 text-card/50 transition-colors hover:border-gold hover:text-gold"
            aria-label="Next testimonial"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Decorative line */}
        <div className="mx-auto mt-10 h-px w-16 bg-gold/40" />
      </div>
    </section>
  )
}
