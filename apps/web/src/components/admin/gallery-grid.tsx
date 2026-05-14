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
        <h1 className="font-serif text-2xl text-white">Gallery</h1>
        <span className="text-sm text-white/40">{images.length} images</span>
      </div>

      <ImageUploader onUploaded={() => router.refresh()} />

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((img) => (
          <div key={img.id} className="group relative overflow-hidden rounded-xl">
            <div className="aspect-[3/4] w-full relative bg-white/5">
              <Image src={img.url} alt={img.label} fill className="object-cover" sizes="25vw" />
            </div>
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-transparent to-transparent p-3 opacity-0 transition group-hover:opacity-100">
              <p className="text-[10px] uppercase tracking-widest text-[#C9A96E]">{img.category}</p>
              <p className="text-sm text-white">{img.label}</p>
            </div>
            <button
              onClick={() => destroy(img.id)}
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white/60 opacity-0 transition hover:bg-red-500 hover:text-white group-hover:opacity-100 cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
