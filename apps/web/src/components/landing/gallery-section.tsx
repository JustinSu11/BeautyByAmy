'use client'

import Image from 'next/image'
import { useScrollAnimate } from '@/hooks/use-scroll-animate'
import { cn } from '@/lib/utils'

const galleryImages = [
  { src: '/images/gallery-1.jpg', alt: 'Classic eyelash extension close-up', span: 'md:row-span-2' },
  { src: '/images/gallery-2.jpg', alt: 'Brow lamination before and after', span: '' },
  { src: '/images/gallery-3.jpg', alt: 'Volume lash set detail', span: '' },
  { src: '/images/gallery-4.jpg', alt: 'Lip blush permanent makeup result', span: 'md:col-span-2' },
  { src: '/images/gallery-5.jpg', alt: 'Microblading healed result', span: '' },
  { src: '/images/gallery-6.jpg', alt: 'Studio interior detail', span: '' },
]

export function GallerySection() {
  const { ref, isVisible } = useScrollAnimate()

  return (
    <section id="gallery" ref={ref} className="bg-card py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        {/* Header */}
        <div
          className={cn(
            'mb-14 text-center transition-all duration-700',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
        >
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.25em] text-gold">
            Portfolio
          </p>
          <h2 className="font-serif text-3xl text-charcoal sm:text-4xl text-balance">
            Our Work Speaks
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-muted-foreground">
            A selection of recent transformations from our studio.
          </p>
        </div>

        {/* Masonry-style grid */}
        <div
          className={cn(
            'grid grid-cols-2 gap-3 md:grid-cols-3 md:auto-rows-[220px] lg:auto-rows-[260px] lg:gap-4 transition-all duration-700',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
        >
          {galleryImages.map((img, i) => (
            <div
              key={img.src}
              className={cn(
                'group relative overflow-hidden rounded-xl',
                img.span
              )}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-charcoal/0 transition-colors group-hover:bg-charcoal/20" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
