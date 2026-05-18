'use client'

import { useState, useEffect, useCallback } from 'react'
import { Upload, Download, Trash2, FileText, Search } from 'lucide-react'
import { toast } from 'sonner'
import { WaiverUploadForm } from '@/components/admin/waiver-upload-form'
import { cn } from '@/lib/utils'

type Waiver = {
  id: string
  client_name: string
  service: string
  appointment_date: string | null
  method: 'digital' | 'manual'
  signed_at: string | null
  notes: string | null
}

const METHOD_FILTERS = ['all', 'digital', 'manual'] as const
type MethodFilter = (typeof METHOD_FILTERS)[number]

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function WaiversPage() {
  const [waivers, setWaivers]     = useState<Waiver[]>([])
  const [search, setSearch]       = useState('')
  const [filter, setFilter]       = useState<MethodFilter>('all')
  const [uploading, setUploading] = useState(false)

  const load = useCallback(() => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (filter !== 'all') params.set('method', filter)
    fetch(`/api/admin/waivers?${params}`)
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status}`)
        return r.json()
      })
      .then((d) => setWaivers(Array.isArray(d) ? d : []))
      .catch(() => toast.error('Failed to load waivers'))
  }, [search, filter])

  useEffect(() => { load() }, [load])

  async function download(id: string) {
    const res  = await fetch(`/api/admin/waivers/${id}/download`)
    if (!res.ok) { toast.error('No file attached to this waiver'); return }
    const data = await res.json()
    window.open(data.url, '_blank')
  }

  async function destroy(id: string, name: string) {
    if (!confirm(`Permanently delete the waiver for ${name}?`)) return
    const res = await fetch(`/api/admin/waivers/${id}`, { method: 'DELETE' })
    if (!res.ok) { toast.error('Failed to delete waiver'); return }
    setWaivers((prev) => prev.filter((w) => w.id !== id))
    toast.success('Waiver deleted')
  }

  return (
    <div className="p-7">
      {uploading && (
        <WaiverUploadForm onClose={() => setUploading(false)} onUploaded={load} />
      )}

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-xl font-semibold text-[#2D2D2D]">Waivers</h1>
          <p className="text-sm text-[#6B6B6B]">View, download, and manually upload signed client waivers.</p>
        </div>
        <button
          onClick={() => setUploading(true)}
          className="flex items-center gap-2 rounded-lg bg-[#C9A96E] px-4 py-2 text-sm font-medium text-white hover:bg-[#A68B4E] cursor-pointer"
        >
          <Upload className="h-4 w-4" /> Upload Waiver
        </button>
      </div>

      {/* Search + filter */}
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#6B6B6B]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by client name…"
            className="w-full rounded-[7px] border border-[#D9D1C7] bg-white py-2 pl-9 pr-4 text-[13px] text-[#2D2D2D] placeholder:text-[#6B6B6B]/50 outline-none focus:border-[#C9A96E]"
          />
        </div>
        <div className="flex gap-1.5">
          {METHOD_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'rounded-lg border px-3 py-2 text-xs font-semibold capitalize transition cursor-pointer',
                filter === f
                  ? 'border-[#C9A96E]/40 bg-[#C9A96E]/10 text-[#A68B4E]'
                  : 'border-[#D9D1C7] text-[#6B6B6B] hover:border-[#C9A96E]/30 hover:text-[#2D2D2D]',
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-[#E8E2DA] bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F0EBE4] text-left">
              <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.09em] text-[#6B6B6B] border-b border-[#E8E2DA]">Client</th>
              <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.09em] text-[#6B6B6B] border-b border-[#E8E2DA]">Service</th>
              <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.09em] text-[#6B6B6B] border-b border-[#E8E2DA]">Appt. Date</th>
              <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.09em] text-[#6B6B6B] border-b border-[#E8E2DA]">Signed</th>
              <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.09em] text-[#6B6B6B] border-b border-[#E8E2DA]">Method</th>
              <th className="px-4 py-3 border-b border-[#E8E2DA]" />
            </tr>
          </thead>
          <tbody>
            {waivers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-[#6B6B6B]">
                  <FileText className="mx-auto mb-2 h-6 w-6 text-[#6B6B6B]/30" />
                  No waivers found
                </td>
              </tr>
            )}
            {waivers.map((w) => (
              <tr key={w.id} className="hover:bg-[#F0EBE4] transition border-b border-[#E8E2DA]">
                <td className="px-4 py-3 font-medium text-[#2D2D2D]">{w.client_name}</td>
                <td className="px-4 py-3 text-[#6B6B6B]">{w.service}</td>
                <td className="px-4 py-3 text-[#6B6B6B]">{formatDate(w.appointment_date)}</td>
                <td className="px-4 py-3 text-[#6B6B6B]">
                  {w.signed_at
                    ? formatDate(w.signed_at)
                    : <span className="rounded-full bg-[#C9A96E]/10 border border-[#C9A96E]/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#C9A96E]">Pending</span>
                  }
                </td>
                <td className="px-4 py-3">
                  <span className={cn(
                    'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide border',
                    w.method === 'digital'
                      ? 'bg-[#4B8B5A]/10 text-[#4B8B5A] border-[#4B8B5A]/30'
                      : 'bg-[#C9A96E]/10 text-[#A68B4E] border-[#C9A96E]/30',
                  )}>
                    {w.method}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => download(w.id)}
                      aria-label={`Download waiver for ${w.client_name}`}
                      className="text-[#6B6B6B]/50 hover:text-[#C9A96E] transition cursor-pointer"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => destroy(w.id, w.client_name)}
                      aria-label={`Delete waiver for ${w.client_name}`}
                      className="text-[#6B6B6B]/50 hover:text-[#C44B4B] transition cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
