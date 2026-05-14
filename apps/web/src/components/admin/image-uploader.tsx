'use client'

import { useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import { toast } from 'sonner'

type Props = {
  onUploaded: () => void
}

export function ImageUploader({ onUploaded }: Props) {
  const inputRef   = useRef<HTMLInputElement>(null)
  const [loading, setLoading]   = useState(false)
  const [category, setCategory] = useState('Lash Extensions')
  const [label,    setLabel]    = useState('')

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!label.trim()) {
      toast.error('Add a label before uploading')
      return
    }

    setLoading(true)
    const form = new FormData()
    form.append('file', file)
    form.append('category', category)
    form.append('label', label)

    const res = await fetch('/api/admin/gallery', { method: 'POST', body: form })
    setLoading(false)

    if (!res.ok) {
      toast.error('Upload failed — please try again')
      return
    }
    setLabel('')
    if (inputRef.current) inputRef.current.value = ''
    toast.success('Image uploaded successfully')
    onUploaded()
  }

  const inputCls = 'rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#C9A96E]'

  return (
    <div className="rounded-xl border border-dashed border-white/20 bg-white/5 p-6">
      <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#C9A96E]">Upload Image</p>
      <div className="flex flex-wrap gap-3">
        <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
          <option>Lash Extensions</option>
          <option>Brow Services</option>
          <option>Permanent Makeup</option>
          <option>Our Studio</option>
        </select>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Label (e.g. Classic Set)"
          className={`${inputCls} flex-1 min-w-[180px]`}
        />
        <label
          className={`flex cursor-pointer items-center gap-2 rounded-lg bg-[#C9A96E] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#A68B4E] ${loading ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <Upload className="h-4 w-4" />
          {loading ? 'Uploading…' : 'Choose & Upload'}
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </label>
      </div>
    </div>
  )
}
