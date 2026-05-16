'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import { toast } from 'sonner'

type Announcement = { id: string; message: string; active: boolean; expires_at: string | null }

export default function AnnouncementsPage() {
  const [items, setItems]     = useState<Announcement[]>([])
  const [message, setMessage] = useState('')
  const [saving, setSaving]   = useState(false)

  useEffect(() => {
    fetch('/api/admin/announcements').then((r) => r.json()).then(setItems)
  }, [])

  async function create() {
    if (!message.trim()) return
    setSaving(true)
    const res  = await fetch('/api/admin/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, active: false }),
    })
    setSaving(false)
    if (!res.ok) { toast.error('Failed to create announcement'); return }
    const data = await res.json()
    setItems((prev) => [data, ...prev])
    setMessage('')
    toast.success('Announcement created')
  }

  async function toggle(item: Announcement) {
    const res  = await fetch(`/api/admin/announcements/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !item.active }),
    })
    if (!res.ok) { toast.error('Failed to update'); return }
    const data = await res.json()
    // When activating, all others become inactive (server enforces this)
    setItems((prev) => prev.map((a) => a.id === item.id ? data : { ...a, active: false }))
  }

  async function destroy(id: string) {
    if (!confirm('Delete this announcement?')) return
    const res = await fetch(`/api/admin/announcements/${id}`, { method: 'DELETE' })
    if (!res.ok) { toast.error('Failed to delete'); return }
    setItems((prev) => prev.filter((a) => a.id !== id))
    toast.success('Deleted')
  }

  const inputCls = 'flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#C9A96E]'

  return (
    <div className="p-8">
      <h1 className="mb-1 font-serif text-2xl text-white">Announcements</h1>
      <p className="mb-6 text-sm text-white/40">Only one announcement can be active at a time. It appears as a gold banner at the top of every page.</p>

      <div className="mb-6 flex gap-3">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') create() }}
          placeholder="e.g. Now booking May appointments!"
          className={inputCls}
        />
        <button
          onClick={create}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-[#C9A96E] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#A68B4E] disabled:opacity-50 cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <button onClick={() => toggle(item)} className="cursor-pointer shrink-0" aria-label={item.active ? 'Deactivate announcement' : 'Activate announcement'}>
              {item.active
                ? <ToggleRight className="h-5 w-5 text-[#C9A96E]" />
                : <ToggleLeft  className="h-5 w-5 text-white/30"   />}
            </button>
            <p className="flex-1 text-sm text-white">{item.message}</p>
            {item.active && (
              <span className="rounded-full bg-[#C9A96E]/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-[#C9A96E]">
                Live
              </span>
            )}
            <button
              onClick={() => destroy(item.id)}
              aria-label="Delete announcement"
              className="text-white/20 hover:text-red-400 cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <p className="py-8 text-center text-sm text-white/30">No announcements yet.</p>
        )}
      </div>
    </div>
  )
}
