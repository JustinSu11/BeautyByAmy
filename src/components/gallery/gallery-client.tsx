'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export type GalleryCard = {
  id: string
  afterUrl: string
  afterAlt: string
  beforeUrl: string | null
  category: string
  label: string
}

// ── Per-card mini carousel ────────────────────────────────────────────────────

function CardCarousel({ card, onOpen }: { card: GalleryCard; onOpen: () => void }) {
  const frames = card.beforeUrl
    ? [{ url: card.afterUrl, label: 'After' }, { url: card.beforeUrl, label: 'Before' }]
    : [{ url: card.afterUrl, label: '' }]
  const [idx, setIdx] = useState(0)   // 0 = after (default)

  function prev(e: React.MouseEvent) {
    e.stopPropagation()
    setIdx((i) => (i - 1 + frames.length) % frames.length)
  }
  function next(e: React.MouseEvent) {
    e.stopPropagation()
    setIdx((i) => (i + 1) % frames.length)
  }

  const isMulti = frames.length > 1

  return (
    <div
      className="group relative w-full h-full cursor-pointer overflow-hidden rounded-2xl bg-[#F0EBE4]"
      onClick={onOpen}
    >
      {/* Image — crossfade between frames */}
      <div className="relative w-full h-full">
        {frames.map((f, i) => (
          <div
            key={f.url}
            className={cn(
              'absolute inset-0 transition-opacity duration-300',
              i === idx ? 'opacity-100' : 'opacity-0 pointer-events-none'
            )}
          >
            <Image
              src={f.url}
              alt={`${card.label}${f.label ? ` — ${f.label}` : ''}`}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, 33vw"
            />
          </div>
        ))}
      </div>

      {/* Before/After pill — shows which frame is active */}
      {isMulti && (
        <span className="absolute left-3 top-3 z-10 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm pointer-events-none">
          {frames[idx].label}
        </span>
      )}

      {/* Carousel arrows — only when multiple frames; z-10 so they sit above the label overlay */}
      {isMulti && (
        <>
          <button
            onClick={prev}
            aria-label="Show previous"
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-white opacity-0 backdrop-blur-sm transition group-hover:opacity-100 hover:bg-black/60"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={next}
            aria-label="Show next"
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-white opacity-0 backdrop-blur-sm transition group-hover:opacity-100 hover:bg-black/60"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5 pointer-events-none">
            {frames.map((_, i) => (
              <span
                key={i}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  i === idx ? 'w-4 bg-white' : 'w-1.5 bg-white/50'
                )}
              />
            ))}
          </div>
        </>
      )}

      {/* Label overlay — pointer-events-none so arrows beneath it remain clickable */}
      <div className={cn(
        'pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 via-black/10 to-transparent px-3 pt-3 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100',
        isMulti ? 'pb-8' : 'pb-3'
      )}>
        <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-[#C9A96E]">{card.category}</p>
        <p className="font-serif text-sm leading-tight text-white sm:text-base">{card.label}</p>
      </div>
    </div>
  )
}

// ── Fullscreen modal ──────────────────────────────────────────────────────────
// Shows a single card as a before/after carousel.
// Left/right arrows (and ← → keys) navigate between After and Before.

function Modal({ card, onClose }: { card: GalleryCard; onClose: () => void }) {
  const frames = card.beforeUrl
    ? [{ url: card.afterUrl, label: 'After' }, { url: card.beforeUrl, label: 'Before' }]
    : [{ url: card.afterUrl, label: '' }]
  const [frameIdx, setFrameIdx] = useState(0)   // 0 = after

  const prevFrame = useCallback(() => {
    setFrameIdx((i) => (i - 1 + frames.length) % frames.length)
  }, [frames.length])

  const nextFrame = useCallback(() => {
    setFrameIdx((i) => (i + 1) % frames.length)
  }, [frames.length])

  // Keyboard: Esc closes, ← → navigate before/after
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape')     onClose()
      if (e.key === 'ArrowLeft')  prevFrame()
      if (e.key === 'ArrowRight') nextFrame()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, prevFrame, nextFrame])

  // Prevent body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const isMultiFrame = frames.length > 1

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Prev frame — only shown when there are 2 frames */}
      {isMultiFrame && (
        <button
          onClick={(e) => { e.stopPropagation(); prevFrame() }}
          aria-label="Previous"
          className="absolute left-4 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      {/* Next frame */}
      {isMultiFrame && (
        <button
          onClick={(e) => { e.stopPropagation(); nextFrame() }}
          aria-label="Next"
          className="absolute right-4 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      {/* Main image area */}
      <div
        className="relative flex h-[85vh] w-full max-w-3xl flex-col items-center justify-center px-16"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image with crossfade */}
        <div className="relative w-full flex-1 overflow-hidden rounded-2xl">
          {frames.map((f, i) => (
            <div
              key={f.url}
              className={cn(
                'absolute inset-0 transition-opacity duration-300',
                i === frameIdx ? 'opacity-100' : 'opacity-0'
              )}
            >
              <Image
                src={f.url}
                alt={`${card.label}${f.label ? ` — ${f.label}` : ''}`}
                fill
                className="object-contain"
                sizes="(max-width: 1280px) 80vw, 900px"
                priority
              />
            </div>
          ))}
        </div>

        {/* Caption row */}
        <div className="mt-4 w-full">
          <p className="text-xs uppercase tracking-widest text-[#C9A96E]">{card.category}</p>
          <p className="font-serif text-lg text-white">{card.label}</p>
        </div>

        {/* Dot indicators + frame label */}
        {isMultiFrame && (
          <div className="mt-3 flex items-center gap-3">
            {frames.map((f, i) => (
              <button
                key={i}
                onClick={() => setFrameIdx(i)}
                className="flex items-center gap-1.5 group/dot"
                aria-label={f.label}
              >
                <span className={cn(
                  'block h-1.5 rounded-full transition-all',
                  i === frameIdx ? 'w-6 bg-[#C9A96E]' : 'w-1.5 bg-white/30 group-hover/dot:bg-white/60'
                )} />
                <span className={cn(
                  'text-[10px] uppercase tracking-widest transition',
                  i === frameIdx ? 'text-[#C9A96E]' : 'text-white/40 group-hover/dot:text-white/70'
                )}>
                  {f.label}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

export function GalleryClient({ cards }: { cards: GalleryCard[] }) {
  const [modalCard, setModalCard] = useState<GalleryCard | null>(null)

  // Distribute into 3 columns
  const cols: GalleryCard[][] = [[], [], []]
  cards.forEach((c, i) => cols[i % 3].push(c))

  const TOP_ASPECTS    = ['aspect-[2/3]', 'aspect-square', 'aspect-[3/4]']
  const BOTTOM_ASPECTS = ['aspect-[4/3]', 'aspect-[4/3]', 'aspect-[4/3]']

  return (
    <>
      {/* Mobile: 2-column grid */}
      <div className="grid grid-cols-2 gap-3 sm:hidden">
        {cards.map((card) => (
          <div key={card.id} className="aspect-[3/4]">
            <CardCarousel card={card} onOpen={() => setModalCard(card)} />
          </div>
        ))}
      </div>

      {/* sm+: 3-column masonry */}
      <div className="hidden sm:flex sm:gap-4">
        {cols.map((col, colIdx) => (
          <div key={colIdx} className="flex flex-1 min-w-0 flex-col gap-4">
            {col.map((card, rowIdx) => {
              const aspect = rowIdx % 2 === 0 ? TOP_ASPECTS[colIdx] : BOTTOM_ASPECTS[colIdx]
              return (
                <div key={card.id} className={aspect}>
                  <CardCarousel card={card} onOpen={() => setModalCard(card)} />
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalCard !== null && (
        <Modal card={modalCard} onClose={() => setModalCard(null)} />
      )}
    </>
  )
}
