'use client'

import { useState, useRef } from 'react'
import { GripVertical } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { inferPublicCategory, formatDurationLong, formatPriceDisplay, type PublicCategory } from '@/lib/services-data'
import type { Service } from '@/lib/services-data'

const CATEGORY_LABELS: Record<PublicCategory, string> = {
  lashes:       'Luxury Lash Extensions',
  signature:    'Signature Brows & Lips',
  'beauty-bar': 'Beauty Bar Services',
}

const CATEGORIES = Object.keys(CATEGORY_LABELS) as PublicCategory[]

type OverrideMap = Record<string, PublicCategory>

interface Props {
  services: Service[]
  overrides: OverrideMap
}

/** Build initial per-category ID arrays from services + override map */
function buildInitialOrder(services: Service[], overrides: OverrideMap): Record<PublicCategory, string[]> {
  const order = { lashes: [], signature: [], 'beauty-bar': [] } as Record<PublicCategory, string[]>
  for (const svc of services) {
    const cat = overrides[svc.id] ?? inferPublicCategory(svc.name)
    order[cat].push(svc.id)
  }
  return order
}

export function ServiceCategoryTable({ services, overrides: initialOverrides }: Props) {
  const svcById = Object.fromEntries(services.map((s) => [s.id, s]))

  const [overrides, setOverrides]         = useState<OverrideMap>(initialOverrides)
  const [categoryOrder, setCategoryOrder] = useState<Record<PublicCategory, string[]>>(
    () => buildInitialOrder(services, initialOverrides)
  )
  const [draggingId, setDraggingId]       = useState<string | null>(null)
  const [hoverRowId, setHoverRowId]       = useState<string | null>(null)
  const [hoverPos,   setHoverPos]         = useState<'before' | 'after'>('after')
  const [hoverCat,   setHoverCat]         = useState<PublicCategory | null>(null)
  const savingRef = useRef(false)

  function getCategoryForId(id: string): PublicCategory {
    return (CATEGORIES.find((cat) => categoryOrder[cat].includes(id)) ?? 'addons') as PublicCategory
  }

  // ── Drag handlers ────────────────────────────────────────────────────────────

  function onDragStart(e: React.DragEvent, id: string) {
    e.dataTransfer.setData('serviceId', id)
    e.dataTransfer.effectAllowed = 'move'
    setDraggingId(id)
  }

  function onDragEnd() {
    setDraggingId(null)
    setHoverRowId(null)
    setHoverCat(null)
  }

  /** Row-level drag-over: track which half of the row the cursor is in */
  function onRowDragOver(e: React.DragEvent, id: string) {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'move'
    const rect = e.currentTarget.getBoundingClientRect()
    setHoverRowId(id)
    setHoverPos(e.clientY < rect.top + rect.height / 2 ? 'before' : 'after')
    setHoverCat(null)
  }

  /** Category empty-area drag-over (fires when not over a row) */
  function onCatDragOver(e: React.DragEvent, cat: PublicCategory) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setHoverCat(cat)
    setHoverRowId(null)
  }

  function onDragLeave() {
    setHoverCat(null)
  }

  /** Drop onto a specific row — handles both reorder and cross-category */
  async function onRowDrop(e: React.DragEvent, targetCat: PublicCategory, targetRowId: string) {
    e.preventDefault()
    e.stopPropagation()
    const draggedId = e.dataTransfer.getData('serviceId')
    setDraggingId(null); setHoverRowId(null); setHoverCat(null)
    if (!draggedId || draggedId === targetRowId) return
    await applyDrop(draggedId, targetCat, targetRowId, hoverPos)
  }

  /** Drop onto an empty category area — appends to end */
  async function onCatDrop(e: React.DragEvent, targetCat: PublicCategory) {
    e.preventDefault()
    const draggedId = e.dataTransfer.getData('serviceId')
    setDraggingId(null); setHoverRowId(null); setHoverCat(null)
    if (!draggedId) return
    const sourceCat = getCategoryForId(draggedId)
    if (sourceCat === targetCat && categoryOrder[targetCat].at(-1) === draggedId) return
    await applyDrop(draggedId, targetCat, null, 'after')
  }

  async function applyDrop(
    draggedId: string,
    targetCat: PublicCategory,
    targetRowId: string | null,
    position: 'before' | 'after',
  ) {
    if (savingRef.current) return
    savingRef.current = true

    const sourceCat = getCategoryForId(draggedId)

    // Remove from source
    const sourceOrder = categoryOrder[sourceCat].filter((id) => id !== draggedId)

    // Build target order
    let targetOrder: string[]
    if (sourceCat === targetCat) {
      // Same category — reorder within the already-pruned array
      targetOrder = [...sourceOrder]
    } else {
      targetOrder = [...categoryOrder[targetCat]]
    }

    if (targetRowId === null) {
      // Drop onto empty area → append
      targetOrder.push(draggedId)
    } else {
      const idx = targetOrder.indexOf(targetRowId)
      const insertAt = position === 'before' ? idx : idx + 1
      targetOrder.splice(Math.max(0, insertAt), 0, draggedId)
    }

    const newOrder: Record<PublicCategory, string[]> = {
      ...categoryOrder,
      [sourceCat]: sourceCat === targetCat ? targetOrder : sourceOrder,
      [targetCat]: targetOrder,
    }

    // Optimistic update
    setCategoryOrder(newOrder)
    if (sourceCat !== targetCat) {
      setOverrides((prev) => ({ ...prev, [draggedId]: targetCat }))
    }

    // Persist — batch-save all services in affected categories
    const affectedCats = sourceCat === targetCat ? [sourceCat] : [sourceCat, targetCat]
    const payload = affectedCats.flatMap((cat) =>
      newOrder[cat].map((id, index) => ({
        squareVariationId: id,
        category: cat,
        sort_order: index,
      }))
    )

    const res = await fetch('/api/admin/service-overrides', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    savingRef.current = false
    if (!res.ok) {
      toast.error('Failed to save order')
      // Roll back
      setCategoryOrder(categoryOrder)
      if (sourceCat !== targetCat) setOverrides(initialOverrides)
    } else {
      toast.success(sourceCat !== targetCat
        ? `Moved to ${CATEGORY_LABELS[targetCat]}`
        : 'Order saved'
      )
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-xl font-semibold text-[#2D2D2D]">Services</h1>
        <p className="mt-0.5 text-sm text-[#6B6B6B]">
          Drag services to reorder them or move them between categories. Changes appear on the public menu immediately.
        </p>
      </div>

      {CATEGORIES.map((cat) => {
        const ids = categoryOrder[cat]
        const isDropTarget = hoverCat === cat && hoverRowId === null

        return (
          <div
            key={cat}
            className="mb-8"
            onDragOver={(e) => onCatDragOver(e, cat)}
            onDragLeave={onDragLeave}
            onDrop={(e) => onCatDrop(e, cat)}
          >
            <div className="mb-3 flex items-center gap-3">
              <h2 className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#C9A96E]">
                {CATEGORY_LABELS[cat]}
              </h2>
              <span className="text-[10px] text-[#6B6B6B]/50">
                {ids.length} service{ids.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className={cn(
              'overflow-x-auto rounded-lg border bg-white shadow-sm transition-all duration-150',
              isDropTarget
                ? 'border-[#C9A96E] ring-2 ring-[#C9A96E]/25 bg-[#C9A96E]/[0.03]'
                : 'border-[#E8E2DA]',
            )}>
              {ids.length === 0 ? (
                <div className={cn(
                  'flex items-center justify-center py-6 text-xs text-[#6B6B6B]/40 transition-colors',
                  isDropTarget && 'text-[#C9A96E]'
                )}>
                  {isDropTarget ? 'Drop here' : 'No services — drag one here'}
                </div>
              ) : (
                <table className="w-full min-w-[480px] text-sm">
                  <thead>
                    <tr className="bg-[#F0EBE4] text-left">
                      <th className="w-8 border-b border-[#E8E2DA] px-3 py-3" />
                      <th className="border-b border-[#E8E2DA] px-4 py-3 text-[11px] font-bold uppercase tracking-[0.09em] text-[#6B6B6B]">Service</th>
                      <th className="border-b border-[#E8E2DA] px-4 py-3 text-[11px] font-bold uppercase tracking-[0.09em] text-[#6B6B6B]">Duration</th>
                      <th className="border-b border-[#E8E2DA] px-4 py-3 text-[11px] font-bold uppercase tracking-[0.09em] text-[#6B6B6B]">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ids.map((id) => {
                      const svc = svcById[id]
                      if (!svc) return null
                      const isOverridden = id in overrides
                      const isDragging   = draggingId === id
                      const showBefore   = hoverRowId === id && hoverPos === 'before'
                      const showAfter    = hoverRowId === id && hoverPos === 'after'

                      return (
                        <tr
                          key={id}
                          draggable
                          onDragStart={(e) => onDragStart(e, id)}
                          onDragEnd={onDragEnd}
                          onDragOver={(e) => onRowDragOver(e, id)}
                          onDrop={(e) => onRowDrop(e, cat, id)}
                          className={cn(
                            'group relative transition-colors duration-100',
                            isDragging  && 'opacity-40',
                            !isDragging && 'hover:bg-[#F0EBE4]',
                            showBefore  && 'border-t-2 border-t-[#C9A96E]',
                            showAfter   && 'border-b-2 border-b-[#C9A96E]',
                          )}
                        >
                          <td className="border-b border-[#E8E2DA] px-3 py-3">
                            <GripVertical className="h-4 w-4 cursor-grab text-[#6B6B6B]/30 transition-colors group-hover:text-[#6B6B6B]/60 active:cursor-grabbing" />
                          </td>
                          <td className="border-b border-[#E8E2DA] px-4 py-3 text-[13px] text-[#2D2D2D]">
                            <span className="cursor-grab active:cursor-grabbing">{svc.name}</span>
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
