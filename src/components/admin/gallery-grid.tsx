'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { ImageUploader } from './image-uploader'

type GalleryImage = {
  id: string
  url: string
  category: string
  label: string
}

export function GalleryGrid({ images: initial }: { images: GalleryImage[] }) {
  const router = useRouter()
  const [images, setImages] = useState(initial)

  async function destroy(id: string) {
    if (!confirm('Remove this image from the gallery?')) return
    const res = await fetch(`/api/admin/gallery/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      toast.error('Failed to remove image')
      return
    }
    setImages((prev) => prev.filter((img) => img.id !== id))
    toast.success('Image removed')
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-xl font-semibold text-[#2D2D2D]">Gallery</h1>
          <p className="mt-0.5 text-sm text-[#6B6B6B]">{images.length} images</p>
        </div>
      </div>

      <ImageUploader onUploaded={() => router.refresh()} />

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((img) => (
          <div key={img.id} className="group relative overflow-hidden rounded-lg border border-[#E8E2DA] bg-white shadow-sm">
            <div className="aspect-[3/4] w-full relative bg-[#F0EBE4]">
              <Image src={img.url} alt={img.label} fill className="object-cover" sizes="25vw" />
            </div>
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 via-transparent to-transparent p-3 opacity-0 transition group-hover:opacity-100">
              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#C9A96E]">{img.category}</p>
              <p className="text-[13px] font-semibold text-white">{img.label}</p>
            </div>
            <button
              aria-label={`Remove ${img.label} from gallery`}
              onClick={() => destroy(img.id)}
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#C44B4B]/10 text-[#C44B4B] opacity-0 transition hover:bg-[#C44B4B] hover:text-white group-hover:opacity-100 cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
