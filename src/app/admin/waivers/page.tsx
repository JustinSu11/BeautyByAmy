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
    <div className="p-8">
      {uploading && (
        <WaiverUploadForm onClose={() => setUploading(false)} onUploaded={load} />
      )}

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-white">Waivers</h1>
          <p className="text-sm text-white/40">View, download, and manually upload signed client waivers.</p>
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
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by client name…"
            className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-9 pr-4 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#C9A96E]"
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
                  ? 'border-[#C9A96E]/40 bg-[#C9A96E]/15 text-[#C9A96E]'
                  : 'border-white/10 text-white/40 hover:border-white/20 hover:text-white/70',
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5 text-left text-xs text-white/40">
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3">Appt. Date</th>
              <th className="px-4 py-3">Signed</th>
              <th className="px-4 py-3">Method</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {waivers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-white/30">
                  <FileText className="mx-auto mb-2 h-6 w-6 opacity-30" />
                  No waivers found
                </td>
              </tr>
            )}
            {waivers.map((w) => (
              <tr key={w.id} className="hover:bg-white/5 transition">
                <td className="px-4 py-3 font-medium text-white">{w.client_name}</td>
                <td className="px-4 py-3 text-white/50">{w.service}</td>
                <td className="px-4 py-3 text-white/50">{formatDate(w.appointment_date)}</td>
                <td className="px-4 py-3 text-white/50">
                  {w.signed_at
                    ? formatDate(w.signed_at)
                    : <span className="rounded-full bg-[#C9A96E]/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#C9A96E]">Pending</span>
                  }
                </td>
                <td className="px-4 py-3">
                  <span className={cn(
                    'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
                    w.method === 'digital'
                      ? 'bg-green-500/15 text-green-400'
                      : 'bg-purple-500/15 text-purple-300',
                  )}>
                    {w.method}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => download(w.id)}
                      aria-label={`Download waiver for ${w.client_name}`}
                      className="text-white/30 hover:text-[#C9A96E] transition cursor-pointer"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => destroy(w.id, w.client_name)}
                      aria-label={`Delete waiver for ${w.client_name}`}
                      className="text-white/30 hover:text-red-400 transition cursor-pointer"
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
