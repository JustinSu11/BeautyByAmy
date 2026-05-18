'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { ServiceForm } from './service-form'
import { cn } from '@/lib/utils'
import type { Service } from '@/types/service'

const CATEGORY_LABELS: Record<string, string> = {
  lashes: 'Lash Extensions', brows: 'Brow Services',
  pmu: 'Permanent Makeup', addons: 'Add-ons',
}

const CATEGORIES = Object.keys(CATEGORY_LABELS) as Array<keyof typeof CATEGORY_LABELS>

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

  async function moveCategory(svc: Service, category: string) {
    const res = await fetch(`/api/admin/services/${svc.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category }),
    })
    if (!res.ok) { toast.error('Failed to move service'); return }
    // Update local state immediately — row jumps to new category section
    setServices((prev) => prev.map((s) => s.id === svc.id ? { ...s, category: category as Service['category'] } : s))
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
        <div>
          <h1 className="font-serif text-xl font-semibold text-[#2D2D2D]">Services</h1>
          <p className="mt-0.5 text-sm text-[#6B6B6B]">Manage your service catalog.</p>
        </div>
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
            <h2 className="mb-3 text-[9px] font-bold uppercase tracking-[0.18em] text-[#C9A96E]">
              {CATEGORY_LABELS[cat]}
            </h2>
            <div className="overflow-hidden rounded-lg border border-[#E8E2DA] bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#F0EBE4] text-left">
                    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.09em] text-[#6B6B6B] border-b border-[#E8E2DA]">Service</th>
                    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.09em] text-[#6B6B6B] border-b border-[#E8E2DA]">Duration</th>
                    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.09em] text-[#6B6B6B] border-b border-[#E8E2DA]">Price</th>
                    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.09em] text-[#6B6B6B] border-b border-[#E8E2DA]">Status</th>
                    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.09em] text-[#6B6B6B] border-b border-[#E8E2DA]">Category</th>
                    <th className="px-4 py-3 border-b border-[#E8E2DA]" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((svc) => (
                    <tr key={svc.id} className={cn('transition hover:bg-[#F0EBE4]', !svc.enabled && 'opacity-50')}>
                      <td className="px-4 py-3 text-[13px] border-b border-[#E8E2DA] text-[#2D2D2D]">{svc.name}</td>
                      <td className="px-4 py-3 text-[13px] border-b border-[#E8E2DA] text-[#6B6B6B]">{svc.duration}</td>
                      <td className="px-4 py-3 text-[13px] border-b border-[#E8E2DA] font-serif text-[#A68B4E]">{svc.price}</td>
                      <td className="px-4 py-3 text-[13px] border-b border-[#E8E2DA]">
                        <button onClick={() => toggle(svc)} className="cursor-pointer">
                          {svc.enabled
                            ? (
                              <span className="bg-[#4B8B5A]/10 text-[#4B8B5A] border border-[#4B8B5A]/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                                Active
                              </span>
                            ) : (
                              <span className="bg-[#F0EBE4] text-[#6B6B6B] border border-[#D9D1C7] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                                Disabled
                              </span>
                            )
                          }
                        </button>
                      </td>
                      <td className="px-4 py-3 text-[13px] border-b border-[#E8E2DA]">
                        <select
                          value={svc.category}
                          onChange={(e) => moveCategory(svc, e.target.value)}
                          className="rounded-md border border-[#D9D1C7] bg-white px-2 py-1 text-xs text-[#2D2D2D] outline-none focus:border-[#C9A96E] cursor-pointer"
                        >
                          {CATEGORIES.map((c) => (
                            <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-[13px] border-b border-[#E8E2DA]">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditing(svc)}
                            className="border border-[#D9D1C7] text-[#2D2D2D] hover:bg-[#F0EBE4] text-xs px-2.5 py-1 rounded-md transition cursor-pointer"
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => destroy(svc.id)}
                            className="border border-[#C44B4B]/30 text-[#C44B4B] hover:bg-[#C44B4B]/10 text-xs px-2.5 py-1 rounded-md transition cursor-pointer"
                          >
                            <Trash2 className="h-3 w-3" />
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
      })}
    </div>
  )
}
