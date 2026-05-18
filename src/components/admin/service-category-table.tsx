'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { inferPublicCategory, formatDurationLong, formatPriceDisplay, type PublicCategory } from '@/lib/services-data'
import type { Service } from '@/lib/services-data'

const CATEGORY_LABELS: Record<PublicCategory, string> = {
  lashes:  'Lash Extensions',
  brows:   'Brow Services',
  pmu:     'Permanent Makeup',
  addons:  'Consultations & Add-ons',
}

const CATEGORIES = Object.keys(CATEGORY_LABELS) as PublicCategory[]

type OverrideMap = Record<string, PublicCategory>

interface Props {
  services: Service[]
  overrides: OverrideMap
}

export function ServiceCategoryTable({ services, overrides: initialOverrides }: Props) {
  const [overrides, setOverrides] = useState<OverrideMap>(initialOverrides)
  const [saving, setSaving] = useState<string | null>(null)

  function effectiveCategory(svc: Service): PublicCategory {
    return overrides[svc.id] ?? inferPublicCategory(svc.name)
  }

  async function moveCategory(svc: Service, category: PublicCategory) {
    setSaving(svc.id)
    const res = await fetch('/api/admin/service-overrides', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ squareVariationId: svc.id, category }),
    })
    setSaving(null)
    if (!res.ok) { toast.error('Failed to update category'); return }
    setOverrides((prev) => ({ ...prev, [svc.id]: category }))
    toast.success('Category updated')
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-xl font-semibold text-[#2D2D2D]">Services</h1>
        <p className="mt-0.5 text-sm text-[#6B6B6B]">
          Services are managed in Square. Use the dropdowns to reassign categories on the public menu.
        </p>
      </div>

      {CATEGORIES.map((cat) => {
        const rows = services.filter((svc) => effectiveCategory(svc) === cat)
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
                    <th className="border-b border-[#E8E2DA] px-4 py-3 text-[11px] font-bold uppercase tracking-[0.09em] text-[#6B6B6B]">Service</th>
                    <th className="border-b border-[#E8E2DA] px-4 py-3 text-[11px] font-bold uppercase tracking-[0.09em] text-[#6B6B6B]">Duration</th>
                    <th className="border-b border-[#E8E2DA] px-4 py-3 text-[11px] font-bold uppercase tracking-[0.09em] text-[#6B6B6B]">Price</th>
                    <th className="border-b border-[#E8E2DA] px-4 py-3 text-[11px] font-bold uppercase tracking-[0.09em] text-[#6B6B6B]">Category</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((svc) => {
                    const isOverridden = svc.id in overrides
                    return (
                      <tr key={svc.id} className="transition hover:bg-[#F0EBE4]">
                        <td className="border-b border-[#E8E2DA] px-4 py-3 text-[13px] text-[#2D2D2D]">
                          <span>{svc.name}</span>
                          {isOverridden && (
                            <span className="ml-2 rounded-full bg-[#C9A96E]/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#A68B4E]">
                              overridden
                            </span>
                          )}
                        </td>
                        <td className="border-b border-[#E8E2DA] px-4 py-3 text-[13px] text-[#6B6B6B]">
                          {formatDurationLong(svc.duration)}
                        </td>
                        <td className="border-b border-[#E8E2DA] px-4 py-3 font-serif text-[13px] text-[#A68B4E]">
                          {formatPriceDisplay(svc.price)}
                        </td>
                        <td className="border-b border-[#E8E2DA] px-4 py-3 text-[13px]">
                          <select
                            value={effectiveCategory(svc)}
                            disabled={saving === svc.id}
                            onChange={(e) => moveCategory(svc, e.target.value as PublicCategory)}
                            className={cn(
                              'rounded-md border border-[#D9D1C7] bg-white px-2 py-1 text-xs text-[#2D2D2D] outline-none focus:border-[#C9A96E] cursor-pointer',
                              saving === svc.id && 'opacity-50',
                            )}
                          >
                            {CATEGORIES.map((c) => (
                              <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}
    </div>
  )
}
