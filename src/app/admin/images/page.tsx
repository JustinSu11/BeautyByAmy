'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Upload } from 'lucide-react'
import { toast } from 'sonner'

type SiteImage = { slot: string; url: string; alt: string }

const SLOT_LABELS: Record<string, string> = {
  'hero':           'Hero Background',
  'meet-amy':       "Amy's Portrait",
  'service-lashes': 'Lash Services Image',
  'service-brows':  'Brow Services Image',
  'service-pmu':    'Permanent Makeup Image',
}

function SlotCard({ image, onUpdated }: { image: SiteImage; onUpdated: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    const form = new FormData()
    form.append('slot', image.slot)
    form.append('file', file)
    form.append('alt',  image.alt)
    const res = await fetch('/api/admin/site-images', { method: 'PATCH', body: form })
    setLoading(false)
    if (!res.ok) { toast.error('Upload failed'); return }
    toast.success('Image updated')
    onUpdated()
  }

  return (
    <div className="overflow-hidden rounded-lg border border-[#E8E2DA] bg-white shadow-sm">
      <div className="relative aspect-video w-full bg-[#F0EBE4]">
        <Image src={image.url} alt={image.alt} fill className="object-cover" sizes="25vw" />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <p className="text-sm text-white">Uploading...</p>
          </div>
        )}
      </div>
      <div className="border-t border-[#E8E2DA] p-3.5 flex items-center justify-between">
        <div>
          <p className="text-[13px] font-bold text-[#2D2D2D]">{SLOT_LABELS[image.slot] ?? image.slot}</p>
          <p className="text-[11px] text-[#6B6B6B]">{image.slot}</p>
        </div>
        <label
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click() }}
          className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#C9A96E] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[#A68B4E]"
        >
          <Upload className="h-3 w-3" />
          Replace
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </label>
      </div>
    </div>
  )
}

export default function SiteImagesPage() {
  const [images, setImages] = useState<SiteImage[]>([])

  function load() {
    fetch('/api/admin/site-images').then((r) => r.json()).then((d) => setImages(d ?? []))
  }

  useEffect(load, [])

  return (
    <div className="p-4 sm:p-7">
      <h1 className="mb-1 font-serif text-xl font-semibold text-[#2D2D2D]">Site Images</h1>
      <p className="mb-6 text-sm text-[#6B6B6B]">Replace any image slot on the public site. Changes go live immediately.</p>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {images.map((img) => (
          <SlotCard key={img.slot} image={img} onUpdated={load} />
        ))}
      </div>

      {images.length === 0 && (
        <p className="py-12 text-center text-sm text-[#6B6B6B]">Loading image slots…</p>
      )}
    </div>
  )
}
