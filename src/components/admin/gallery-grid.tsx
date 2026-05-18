'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Trash2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { ImageUploader } from './image-uploader'

type GalleryImage = {
  id: string
  url: string
  before_url: string | null
  category: string
  label: string
}

function BeforeUploadButton({ id, onDone }: { id: string; onDone: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    const form = new FormData()
    form.append('beforeFile', file)
    const res = await fetch(`/api/admin/gallery/${id}`, { method: 'PATCH', body: form })
    setLoading(false)
    if (!res.ok) { toast.error('Upload failed'); return }
    toast.success('Before image added')
    onDone()
  }

  return (
    <label className="flex cursor-pointer items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-[10px] text-white backdrop-blur-sm hover:bg-black/70 transition">
      <Upload className="h-3 w-3" />
      {loading ? '…' : 'Add before'}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </label>
  )
}

export function GalleryGrid({ images: initial }: { images: GalleryImage[] }) {
  const router = useRouter()
  const [images, setImages] = useState(initial)

  async function destroy(id: string) {
    if (!confirm('Remove this image from the gallery?')) return
    const res = await fetch(`/api/admin/gallery/${id}`, { method: 'DELETE' })
    if (!res.ok) { toast.error('Failed to remove image'); return }
    setImages((prev) => prev.filter((img) => img.id !== id))
    toast.success('Image removed')
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-xl font-semibold text-[#2D2D2D]">Gallery</h1>
          <p className="mt-0.5 text-sm text-[#6B6B6B]">{images.length} image{images.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <ImageUploader onUploaded={() => router.refresh()} />

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((img) => (
          <div key={img.id} className="group relative overflow-hidden rounded-lg border border-[#E8E2DA] bg-white shadow-sm">
            <div className="aspect-[3/4] w-full relative bg-[#F0EBE4]">
              <Image src={img.url} alt={img.label} fill className="object-cover" sizes="25vw" />
            </div>

            {img.before_url && (
              <span className="absolute left-2 top-2 rounded-full bg-[#C9A96E] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white shadow">
                B/A
              </span>
            )}

            <div className="absolute inset-0 flex flex-col justify-between p-2 opacity-0 transition group-hover:opacity-100">
              <div className="flex justify-end">
                <button
                  aria-label={`Remove ${img.label}`}
                  onClick={() => destroy(img.id)}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-[#C44B4B]/80 text-white hover:bg-[#C44B4B] cursor-pointer transition"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex flex-col gap-1.5">
                {!img.before_url && (
                  <BeforeUploadButton id={img.id} onDone={() => router.refresh()} />
                )}
                <div className="rounded bg-black/50 px-2 py-1 backdrop-blur-sm">
                  <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#C9A96E]">{img.category}</p>
                  <p className="text-[13px] font-semibold text-white leading-tight">{img.label}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
