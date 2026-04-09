'use client'

import { useState, useEffect, useCallback } from 'react'
import { useScrollAnimate } from '@/hooks/use-scroll-animate'
import { cn } from '@/lib/utils'
import { Star, ChevronLeft, ChevronRight } from 'lucide-react'

const testimonials = [
  {
    quote:
      "Amy is an absolute artist. I've never felt more beautiful or confident. The attention to detail, the calming atmosphere, the results -- everything is beyond five stars.",
    name: 'Sarah Mitchell',
    detail: 'Classic Full Set & Brow Lamination',
    since: 'Client since 2022',
  },
  {
    quote:
      "I was so nervous about getting permanent makeup, but Amy made the entire process comfortable and stress-free. My powder brows look incredibly natural -- I wake up feeling put-together every single day.",
    name: 'Jessica Park',
    detail: 'Powder Brows',
    since: 'Client since 2023',
  },
  {
    quote:
      "I've been to many lash artists and Amy is by far the best. She takes her time, listens to what I want, and the retention is unbeatable. Her studio feels like a little luxury escape.",
    name: 'Mia Rodriguez',
    detail: 'Mega Volume Full Set',
    since: 'Client since 2021',
  },
  {
    quote:
      "The lip blush completely changed my morning routine. Amy matched the perfect shade to my skin tone. It's subtle, natural, and I couldn't be happier with the result.",
    name: 'Danielle Tran',
    detail: 'Lip Blush',
    since: 'Client since 2024',
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

  const t = testimonials[current]

  return (
    <section ref={ref} className="bg-charcoal py-20 lg:py-28">
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

        {/* Stars */}
        <div className="mb-8 flex items-center justify-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-gold text-gold" />
          ))}
        </div>

        {/* Quote area */}
        <div className="relative min-h-[200px] sm:min-h-[180px]">
          <blockquote
            className={cn(
              'font-serif text-xl leading-relaxed italic text-card/90 transition-all duration-300 sm:text-2xl lg:text-3xl text-balance',
              isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
            )}
          >
            {`"${t.quote}"`}
          </blockquote>
        </div>

        <div
          className={cn(
            'mt-8 flex flex-col items-center gap-1 transition-all duration-300',
            isTransitioning ? 'opacity-0' : 'opacity-100'
          )}
        >
          <cite className="text-sm font-semibold not-italic text-card/80">
            {t.name}
          </cite>
          <span className="text-xs text-gold-light">{t.detail}</span>
          <span className="text-xs text-card/40">{t.since}</span>
        </div>

        {/* Navigation */}
        <div className="mt-10 flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={prev}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-card/20 text-card/50 transition-colors hover:border-gold hover:text-gold"
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
                  'h-1.5 rounded-full transition-all',
                  i === current ? 'w-6 bg-gold' : 'w-1.5 bg-card/30 hover:bg-card/50'
                )}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={next}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-card/20 text-card/50 transition-colors hover:border-gold hover:text-gold"
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
