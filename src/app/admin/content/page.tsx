'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Check, RotateCcw, PenLine } from 'lucide-react'
import { cn } from '@/lib/utils'

type ContentItem = {
  key: string
  value: string
  label: string
  isDefault: boolean
}

const SECTION_GROUPS: { heading: string; keys: string[] }[] = [
  {
    heading: 'Homepage',
    keys: ['hero_headline', 'hero_subtext', 'meet_amy_bio_1', 'meet_amy_bio_2'],
  },
  {
    heading: 'Services Page — Category Descriptions',
    keys: ['lashes_description', 'signature_description', 'beauty_bar_description'],
  },
]

function ContentField({
  item,
  onSaved,
}: {
  item: ContentItem
  onSaved: (key: string, value: string) => void
}) {
  const [value, setValue] = useState(item.value)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    setValue(item.value)
    setDirty(false)
  }, [item.value])

  const isMultiline = item.key.includes('bio') || item.key.includes('description')

  function handleChange(v: string) {
    setValue(v)
    setDirty(v !== item.value)
  }

  async function save() {
    if (!dirty || saving) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/content', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: item.key, value }),
      })
      if (!res.ok) throw new Error('Failed to save')
      onSaved(item.key, value)
      setDirty(false)
      toast.success('Saved')
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  function reset() {
    setValue(item.value)
    setDirty(false)
  }

  return (
    <div className="rounded-lg border border-[#E8E2DA] bg-white p-5 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-2">
        <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#6B6B6B]">
          <PenLine className="h-3 w-3 text-[#C9A96E]" />
          {item.label}
        </label>
        {!item.isDefault && !dirty && (
          <span className="rounded-full bg-[#C9A96E]/10 border border-[#C9A96E]/30 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#A68B4E]">
            customized
          </span>
        )}
      </div>

      {isMultiline ? (
        <textarea
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          rows={3}
          className="w-full resize-none rounded-lg border border-[#D9D1C7] bg-[#FAFAF8] px-3 py-2.5 text-[13px] text-[#2D2D2D] outline-none transition-colors focus:border-[#C9A96E] focus:bg-white"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full rounded-lg border border-[#D9D1C7] bg-[#FAFAF8] px-3 py-2.5 text-[13px] text-[#2D2D2D] outline-none transition-colors focus:border-[#C9A96E] focus:bg-white"
        />
      )}

      {dirty && (
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={save}
            disabled={saving}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-colors',
              saving
                ? 'bg-[#C9A96E]/60 cursor-not-allowed'
                : 'bg-[#C9A96E] hover:bg-[#A68B4E] cursor-pointer',
            )}
          >
            <Check className="h-3.5 w-3.5" />
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={reset}
            className="flex items-center gap-1.5 rounded-lg border border-[#D9D1C7] px-3 py-1.5 text-xs text-[#6B6B6B] hover:border-[#6B6B6B] hover:text-[#2D2D2D] transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            Discard
          </button>
        </div>
      )}
    </div>
  )
}

export default function ContentPage() {
  const [items, setItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    fetch('/api/admin/content')
      .then((r) => r.json())
      .then((data: ContentItem[]) => { setItems(data); setLoading(false) })
      .catch(() => { toast.error('Failed to load content'); setLoading(false) })
  }, [])

  useEffect(() => { load() }, [load])

  function onSaved(key: string, value: string) {
    setItems((prev) => prev.map((item) => item.key === key ? { ...item, value, isDefault: false } : item))
  }

  const byKey = Object.fromEntries(items.map((i) => [i.key, i]))

  return (
    <div className="p-4 sm:p-7">
      <div className="mb-6">
        <h1 className="font-serif text-xl font-semibold text-[#2D2D2D]">Site Content</h1>
        <p className="mt-0.5 text-sm text-[#6B6B6B]">
          Edit the text that appears on the public website. Changes take effect immediately.
        </p>
      </div>

      {loading ? (
        <div className="py-16 text-center text-sm text-[#6B6B6B]">Loading...</div>
      ) : (
        <div className="space-y-10">
          {SECTION_GROUPS.map((group) => (
            <div key={group.heading}>
              <h2 className="mb-4 text-[9px] font-bold uppercase tracking-[0.18em] text-[#C9A96E]">
                {group.heading}
              </h2>
              <div className="space-y-4">
                {group.keys.map((key) =>
                  byKey[key] ? (
                    <ContentField key={key} item={byKey[key]} onSaved={onSaved} />
                  ) : null,
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
