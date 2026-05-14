'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Upload } from 'lucide-react'
import { toast } from 'sonner'

type SiteImage = { slot: string; url: string; alt: string }

const SLOT_LABELS: Record<string, string> = {
  'hero':      'Hero Background',
  'meet-amy':  "Amy's Portrait",
  'gallery-1': 'Gallery Slot 1',
  'gallery-2': 'Gallery Slot 2',
  'gallery-3': 'Gallery Slot 3',
  'gallery-4': 'Gallery Slot 4',
  'gallery-5': 'Gallery Slot 5',
  'gallery-6': 'Gallery Slot 6',
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
    <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
      <div className="relative aspect-video w-full bg-white/5">
        <Image src={image.url} alt={image.alt} fill className="object-cover" sizes="25vw" />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <p className="text-sm text-white">Uploading...</p>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between p-3">
        <div>
          <p className="text-xs font-semibold text-white">{SLOT_LABELS[image.slot] ?? image.slot}</p>
          <p className="text-[10px] text-white/30">{image.slot}</p>
        </div>
        <label
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click() }}
          className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/50 transition hover:border-[#C9A96E] hover:text-[#C9A96E]"
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
    <div className="p-8">
      <h1 className="mb-1 font-serif text-2xl text-white">Site Images</h1>
      <p className="mb-6 text-sm text-white/40">Replace any image slot on the public site. Changes go live immediately.</p>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {images.map((img) => (
          <SlotCard key={img.slot} image={img} onUpdated={load} />
        ))}
      </div>

      {images.length === 0 && (
        <p className="py-12 text-center text-sm text-white/30">No image slots seeded yet. Run the seed SQL in Supabase dashboard first.</p>
      )}
    </div>
  )
}
