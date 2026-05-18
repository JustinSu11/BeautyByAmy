'use client'

import { useRef, useState } from 'react'
import { Upload, X } from 'lucide-react'
import { toast } from 'sonner'

type Props = { onClose: () => void; onUploaded: () => void }

export function WaiverUploadForm({ onClose, onUploaded }: Props) {
  const fileRef              = useRef<HTMLInputElement>(null)
  const [saving, setSaving]  = useState(false)
  const [fileName, setFileName] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    const form = new FormData(e.currentTarget)
    const res  = await fetch('/api/admin/waivers', { method: 'POST', body: form })
    setSaving(false)
    if (!res.ok) { toast.error('Upload failed — please try again'); return }
    toast.success('Waiver saved')
    onUploaded()
    onClose()
  }

  const inputCls = 'w-full rounded-lg border border-[#D9D1C7] bg-white px-3 py-2.5 text-sm text-[#2D2D2D] placeholder:text-[#6B6B6B]/50 outline-none focus:border-[#C9A96E]'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl border border-[#E8E2DA] bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-serif text-lg font-semibold text-[#2D2D2D]">Upload Signed Waiver</h2>
          <button onClick={onClose} aria-label="Close" className="text-[#6B6B6B] hover:text-[#2D2D2D] cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-[#6B6B6B]">Client Name *</label>
              <input name="client_name" required placeholder="Jane Smith" className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#6B6B6B]">Appointment Date</label>
              <input name="appointment_date" type="date" className={inputCls} />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-[#6B6B6B]">Service *</label>
            <select name="service" required className={inputCls}>
              <option value="">Select a service…</option>
              <option>Ombré Brows</option>
              <option>Microblading</option>
              <option>Microshading</option>
              <option>Lip Blush</option>
              <option>Classic Lash Set</option>
              <option>Volume Lash Set</option>
              <option>Hybrid Lash Set</option>
              <option>Brow Lamination</option>
              <option>Brow Tint</option>
              <option>Brow Wax</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs text-[#6B6B6B]">Waiver File (PDF or image)</label>
            <label
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileRef.current?.click() }}
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#D9D1C7] bg-[#FAF8F5] py-6 text-center transition hover:border-[#C9A96E] hover:bg-[#C9A96E]/5"
            >
              <Upload className="h-5 w-5 text-[#6B6B6B]/50" />
              <span className="text-sm text-[#6B6B6B]">
                {fileName || 'Click to choose PDF or image'}
              </span>
              <span className="text-[11px] text-[#6B6B6B]/60">PDF, JPG, PNG — max 10 MB</span>
              <input
                ref={fileRef}
                name="file"
                type="file"
                accept=".pdf,image/*"
                className="hidden"
                onChange={(e) => setFileName(e.target.files?.[0]?.name ?? '')}
              />
            </label>
          </div>

          <div>
            <label className="mb-1 block text-xs text-[#6B6B6B]">Notes (optional)</label>
            <textarea
              name="notes"
              rows={2}
              placeholder="e.g. Paper copy scanned at studio on day of appointment"
              className={inputCls}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-2 rounded-lg bg-[#C9A96E] py-2.5 text-sm font-semibold text-white transition hover:bg-[#A68B4E] disabled:opacity-50 cursor-pointer"
          >
            {saving ? 'Saving…' : 'Save Waiver'}
          </button>
        </form>
      </div>
    </div>
  )
}
