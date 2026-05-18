'use client'

import { useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import { toast } from 'sonner'

type Props = {
  onUploaded: () => void
}

export function ImageUploader({ onUploaded }: Props) {
  const afterRef   = useRef<HTMLInputElement>(null)
  const beforeRef  = useRef<HTMLInputElement>(null)
  const [loading,    setLoading]    = useState(false)
  const [category,   setCategory]   = useState('Lash Extensions')
  const [label,      setLabel]      = useState('')
  const [afterName,  setAfterName]  = useState('')
  const [beforeName, setBeforeName] = useState('')

  async function handleSubmit() {
    const afterFile  = afterRef.current?.files?.[0]
    const beforeFile = beforeRef.current?.files?.[0]
    if (!afterFile) { toast.error('Choose an after image'); return }
    if (!label.trim()) { toast.error('Add a label'); return }

    setLoading(true)
    const form = new FormData()
    form.append('file',     afterFile)
    form.append('category', category)
    form.append('label',    label)
    if (beforeFile) form.append('beforeFile', beforeFile)

    const res = await fetch('/api/admin/gallery', { method: 'POST', body: form })
    setLoading(false)

    if (!res.ok) { toast.error('Upload failed — please try again'); return }

    setLabel('')
    setAfterName('')
    setBeforeName('')
    if (afterRef.current)  afterRef.current.value  = ''
    if (beforeRef.current) beforeRef.current.value = ''
    toast.success('Image uploaded successfully')
    onUploaded()
  }

  const inputCls = 'rounded-lg border border-[#D9D1C7] bg-white px-3 py-2.5 text-sm text-[#2D2D2D] placeholder:text-[#6B6B6B]/50 outline-none focus:border-[#C9A96E]'
  const fileBtnCls = 'flex cursor-pointer items-center gap-2 rounded-lg border border-[#D9D1C7] bg-white px-3 py-2.5 text-sm text-[#6B6B6B] hover:border-[#C9A96E] transition'

  return (
    <div className="rounded-lg border-2 border-dashed border-[#D9D1C7] bg-white p-6 hover:border-[#C9A96E] hover:bg-[#C9A96E]/5 transition-colors">
      <p className="mb-4 text-[9px] font-bold uppercase tracking-[0.14em] text-[#C9A96E]">Upload Image</p>
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

        {/* After image — required */}
        <label className={fileBtnCls}>
          <Upload className="h-4 w-4 shrink-0 text-[#C9A96E]" />
          <span className="truncate max-w-[140px]">{afterName || 'After image *'}</span>
          <input ref={afterRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => setAfterName(e.target.files?.[0]?.name ?? '')} />
        </label>

        {/* Before image — optional */}
        <label className={fileBtnCls}>
          <Upload className="h-4 w-4 shrink-0 text-[#6B6B6B]/60" />
          <span className="truncate max-w-[140px]">{beforeName || 'Before image (optional)'}</span>
          <input ref={beforeRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => setBeforeName(e.target.files?.[0]?.name ?? '')} />
        </label>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-[#C9A96E] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#A68B4E] disabled:opacity-50 cursor-pointer"
        >
          {loading ? 'Uploading…' : 'Upload'}
        </button>
      </div>
    </div>
  )
}
