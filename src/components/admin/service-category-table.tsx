'use client'

import { useState } from 'react'
import { GripVertical } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { inferPublicCategory, formatDurationLong, formatPriceDisplay, type PublicCategory } from '@/lib/services-data'
import type { Service } from '@/lib/services-data'

const CATEGORY_LABELS: Record<PublicCategory, string> = {
  lashes: 'Lash Extensions',
  brows:  'Brow Services',
  pmu:    'Permanent Makeup',
  addons: 'Consultations & Add-ons',
}

const CATEGORIES = Object.keys(CATEGORY_LABELS) as PublicCategory[]

type OverrideMap = Record<string, PublicCategory>

interface Props {
  services: Service[]
  overrides: OverrideMap
}

export function ServiceCategoryTable({ services, overrides: initialOverrides }: Props) {
  const [overrides, setOverrides]   = useState<OverrideMap>(initialOverrides)
  const [saving, setSaving]         = useState<string | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOverCat, setDragOverCat] = useState<PublicCategory | null>(null)

  function effectiveCategory(svc: Service): PublicCategory {
    return overrides[svc.id] ?? inferPublicCategory(svc.name)
  }

  async function moveCategory(svcId: string, category: PublicCategory) {
    setSaving(svcId)
    const res = await fetch('/api/admin/service-overrides', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ squareVariationId: svcId, category }),
    })
    setSaving(null)
    if (!res.ok) { toast.error('Failed to update category'); return }
    setOverrides((prev) => ({ ...prev, [svcId]: category }))
    toast.success(`Moved to ${CATEGORY_LABELS[category]}`)
  }

  // ── Drag handlers ────────────────────────────────────────────────────────────

  function onDragStart(e: React.DragEvent, svcId: string) {
    e.dataTransfer.setData('serviceId', svcId)
    e.dataTransfer.effectAllowed = 'move'
    setDraggingId(svcId)
  }

  function onDragEnd() {
    setDraggingId(null)
    setDragOverCat(null)
  }

  function onDragOver(e: React.DragEvent, cat: PublicCategory) {
    e.preventDefault()                        // required — tells browser this is a valid drop target
    e.dataTransfer.dropEffect = 'move'
    setDragOverCat(cat)
  }

  function onDragLeave() {
    setDragOverCat(null)
  }

  async function onDrop(e: React.DragEvent, cat: PublicCategory) {
    e.preventDefault()
    setDragOverCat(null)
    setDraggingId(null)

    const svcId = e.dataTransfer.getData('serviceId')
    if (!svcId) return

    const svc = services.find((s) => s.id === svcId)
    if (!svc) return

    // No-op if dropped onto the same category it's already in
    if (effectiveCategory(svc) === cat) return

    await moveCategory(svcId, cat)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-xl font-semibold text-[#2D2D2D]">Services</h1>
        <p className="mt-0.5 text-sm text-[#6B6B6B]">
          Services are managed in Square. Drag a service into a different category to reassign it on the public menu.
        </p>
      </div>

      {CATEGORIES.map((cat) => {
        const rows = services.filter((svc) => effectiveCategory(svc) === cat)
        const isDropTarget = dragOverCat === cat

        return (
          <div
            key={cat}
            className="mb-8"
            onDragOver={(e) => onDragOver(e, cat)}
            onDragLeave={onDragLeave}
            onDrop={(e) => onDrop(e, cat)}
          >
            {/* Category header */}
            <div className="mb-3 flex items-center gap-3">
              <h2 className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#C9A96E]">
                {CATEGORY_LABELS[cat]}
              </h2>
              <span className="text-[10px] text-[#6B6B6B]/50">{rows.length} service{rows.length !== 1 ? 's' : ''}</span>
            </div>

            {/* Drop zone */}
            <div
              className={cn(
                'overflow-hidden rounded-lg border bg-white shadow-sm transition-all duration-150',
                isDropTarget
                  ? 'border-[#C9A96E] ring-2 ring-[#C9A96E]/25 bg-[#C9A96E]/[0.03]'
                  : 'border-[#E8E2DA]',
              )}
            >
              {rows.length === 0 ? (
                /* Empty state — gives a visible drop target when a category has no services */
                <div className={cn(
                  'flex items-center justify-center py-6 text-xs text-[#6B6B6B]/40 transition-colors',
                  isDropTarget && 'text-[#C9A96E]'
                )}>
                  {isDropTarget ? 'Drop here to move' : 'No services — drag one here'}
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#F0EBE4] text-left">
                      <th className="w-8 border-b border-[#E8E2DA] px-3 py-3" />
                      <th className="border-b border-[#E8E2DA] px-4 py-3 text-[11px] font-bold uppercase tracking-[0.09em] text-[#6B6B6B]">Service</th>
                      <th className="border-b border-[#E8E2DA] px-4 py-3 text-[11px] font-bold uppercase tracking-[0.09em] text-[#6B6B6B]">Duration</th>
                      <th className="border-b border-[#E8E2DA] px-4 py-3 text-[11px] font-bold uppercase tracking-[0.09em] text-[#6B6B6B]">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((svc) => {
                      const isOverridden = svc.id in overrides
                      const isDragging   = draggingId === svc.id
                      const isSaving     = saving === svc.id

                      return (
                        <tr
                          key={svc.id}
                          draggable={!isSaving}
                          onDragStart={(e) => onDragStart(e, svc.id)}
                          onDragEnd={onDragEnd}
                          className={cn(
                            'group transition-all duration-100',
                            isDragging  && 'opacity-40',
                            isSaving    && 'opacity-60 pointer-events-none',
                            !isDragging && !isSaving && 'hover:bg-[#F0EBE4]',
                          )}
                        >
                          {/* Drag handle */}
                          <td className="border-b border-[#E8E2DA] px-3 py-3">
                            <GripVertical className="h-4 w-4 cursor-grab text-[#6B6B6B]/30 transition-colors group-hover:text-[#6B6B6B]/60 active:cursor-grabbing" />
                          </td>

                          {/* Name */}
                          <td className="border-b border-[#E8E2DA] px-4 py-3 text-[13px] text-[#2D2D2D]">
                            <span className="cursor-grab active:cursor-grabbing">{svc.name}</span>
                            {isOverridden && (
                              <span className="ml-2 rounded-full bg-[#C9A96E]/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#A68B4E]">
                                overridden
                              </span>
                            )}
                            {isSaving && (
                              <span className="ml-2 text-[10px] text-[#6B6B6B]/50">saving…</span>
                            )}
                          </td>

                          <td className="border-b border-[#E8E2DA] px-4 py-3 text-[13px] text-[#6B6B6B]">
                            {formatDurationLong(svc.duration)}
                          </td>
                          <td className="border-b border-[#E8E2DA] px-4 py-3 font-serif text-[13px] text-[#A68B4E]">
                            {formatPriceDisplay(svc.price)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
