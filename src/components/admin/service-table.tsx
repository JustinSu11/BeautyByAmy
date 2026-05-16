'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, ToggleLeft, ToggleRight, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { ServiceForm } from './service-form'
import { cn } from '@/lib/utils'
import type { Service } from '@/types/service'

const CATEGORY_LABELS: Record<string, string> = {
  lashes: 'Lash Extensions', brows: 'Brow Services',
  pmu: 'Permanent Makeup', addons: 'Add-ons',
}

export function ServiceTable({ services: initial }: { services: Service[] }) {
  const router  = useRouter()
  const [services, setServices] = useState(initial)
  const [editing, setEditing]   = useState<Service | null>(null)
  const [adding, setAdding]     = useState(false)

  async function toggle(svc: Service) {
    const res = await fetch(`/api/admin/services/${svc.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: !svc.enabled }),
    })
    if (!res.ok) {
      toast.error('Failed to update service status')
      return
    }
    setServices((prev) => prev.map((s) => s.id === svc.id ? { ...s, enabled: !s.enabled } : s))
  }

  async function destroy(id: string) {
    if (!confirm('Delete this service? This cannot be undone.')) return
    const res = await fetch(`/api/admin/services/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      toast.error('Failed to delete service')
      return
    }
    setServices((prev) => prev.filter((s) => s.id !== id))
  }

  const categories = ['lashes', 'brows', 'pmu', 'addons']

  return (
    <div>
      {(editing || adding) && (
        <ServiceForm
          initial={editing ?? undefined}
          onClose={() => { setEditing(null); setAdding(false) }}
          onSaved={() => router.refresh()}
        />
      )}

      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-2xl text-white">Services</h1>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 rounded-lg bg-[#C9A96E] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#A68B4E] cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add Service
        </button>
      </div>

      {categories.map((cat) => {
        const rows = services.filter((s) => s.category === cat)
        if (!rows.length) return null
        return (
          <div key={cat} className="mb-8">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#C9A96E]">
              {CATEGORY_LABELS[cat]}
            </h2>
            <div className="overflow-hidden rounded-xl border border-white/10">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-left text-xs text-white/40">
                    <th className="px-4 py-3">Service</th>
                    <th className="px-4 py-3">Duration</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {rows.map((svc) => (
                    <tr key={svc.id} className={cn('transition hover:bg-white/5', !svc.enabled && 'opacity-40')}>
                      <td className="px-4 py-3 text-white">{svc.name}</td>
                      <td className="px-4 py-3 text-white/50">{svc.duration}</td>
                      <td className="px-4 py-3 font-serif text-[#C9A96E]">{svc.price}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => toggle(svc)} className="cursor-pointer">
                          {svc.enabled
                            ? <ToggleRight className="h-5 w-5 text-[#C9A96E]" />
                            : <ToggleLeft  className="h-5 w-5 text-white/30"   />}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <button onClick={() => setEditing(svc)} className="text-white/30 hover:text-white cursor-pointer"><Pencil className="h-3.5 w-3.5" /></button>
                          <button onClick={() => destroy(svc.id)} className="text-white/30 hover:text-red-400 cursor-pointer"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}
    </div>
  )
}
