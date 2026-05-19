'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, ToggleLeft, ToggleRight, Clock } from 'lucide-react'
import { AdminDateTimePicker } from '@/components/admin/date-time-picker'
import { toast } from 'sonner'

type Announcement = {
  id: string
  message: string
  active: boolean
  scheduled_for: string | null
  expires_at: string | null
}

/** Returns the display status of an announcement from the client's perspective. */
function getStatus(item: Announcement): 'live' | 'scheduled' | 'inactive' {
  if (item.active) return 'live'
  if (item.scheduled_for && new Date(item.scheduled_for) > new Date()) return 'scheduled'
  return 'inactive'
}

export default function AnnouncementsPage() {
  const [items, setItems]           = useState<Announcement[]>([])
  const [message, setMessage]       = useState('')
  const [scheduledFor, setScheduledFor] = useState('')   // datetime-local string
  const [saving, setSaving]         = useState(false)

  useEffect(() => {
    fetch('/api/admin/announcements').then((r) => r.json()).then(setItems)
  }, [])

  async function create() {
    if (!message.trim()) return
    setSaving(true)
    const body: Record<string, unknown> = { message, active: false }
    if (scheduledFor) body.scheduled_for = new Date(scheduledFor).toISOString()
    const res = await fetch('/api/admin/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    setSaving(false)
    if (!res.ok) { toast.error('Failed to create announcement'); return }
    const data = await res.json()
    setItems((prev) => [data, ...prev])
    setMessage('')
    setScheduledFor('')
    toast.success(scheduledFor ? 'Announcement scheduled' : 'Announcement created')
  }

  async function toggle(item: Announcement) {
    // Toggling a scheduled item clears the schedule and activates immediately, or deactivates
    const isLive = item.active
    const body: Record<string, unknown> = { active: !isLive }
    if (!isLive && item.scheduled_for) body.scheduled_for = null   // clear schedule on manual activate
    const res = await fetch(`/api/admin/announcements/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) { toast.error('Failed to update'); return }
    const data = await res.json()
    // When activating, server deactivates all others
    setItems((prev) => prev.map((a) => a.id === item.id ? data : { ...a, active: false }))
  }

  async function destroy(id: string) {
    if (!confirm('Delete this announcement?')) return
    const res = await fetch(`/api/admin/announcements/${id}`, { method: 'DELETE' })
    if (!res.ok) { toast.error('Failed to delete'); return }
    setItems((prev) => prev.filter((a) => a.id !== id))
    toast.success('Deleted')
  }

  /** Format a UTC ISO string as local date/time for display. */
  function fmtLocal(iso: string) {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit',
    })
  }

  const inputCls = 'rounded-lg border border-[#D9D1C7] bg-white px-4 py-2.5 text-sm text-[#2D2D2D] placeholder:text-[#6B6B6B]/50 outline-none focus:border-[#C9A96E]'

  return (
    <div className="p-4 sm:p-7">
      <h1 className="mb-1 font-serif text-xl font-semibold text-[#2D2D2D]">Announcements</h1>
      <p className="mb-6 text-sm text-[#6B6B6B]">
        Only one announcement is live at a time. Leave the schedule blank to save as inactive — you can activate it manually later.
      </p>

      {/* Create form */}
      <div className="mb-8 rounded-xl border border-[#E8E2DA] bg-white p-5 shadow-sm">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#6B6B6B]">New Announcement</p>
        <div className="flex flex-col gap-3">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') create() }}
            placeholder="e.g. Now booking June appointments!"
            className={`${inputCls} w-full`}
          />
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-col gap-1">
              <label className="flex items-center gap-1.5 text-xs text-[#6B6B6B]">
                <Clock className="h-3.5 w-3.5" />
                Schedule for (optional)
              </label>
              <AdminDateTimePicker
                value={scheduledFor}
                onChange={setScheduledFor}
                placeholder="Pick a date & time…"
              />
            </div>
            <button
              onClick={create}
              disabled={saving}
              className="ml-auto flex items-center gap-2 rounded-lg bg-[#C9A96E] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#A68B4E] disabled:opacity-50 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              {scheduledFor ? 'Schedule' : 'Add'}
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="flex flex-col gap-0">
        {items.map((item) => {
          const status = getStatus(item)
          return (
            <div key={item.id} className="flex items-start gap-4 rounded-lg border border-[#E8E2DA] bg-white px-4 py-3 mb-3.5 shadow-sm">
              {/* Toggle — only meaningful for non-scheduled items */}
              <button
                onClick={() => toggle(item)}
                className="cursor-pointer shrink-0 mt-0.5"
                aria-label={item.active ? 'Deactivate announcement' : 'Activate announcement'}
              >
                {item.active
                  ? <ToggleRight className="h-5 w-5 text-[#C9A96E]" />
                  : <ToggleLeft  className="h-5 w-5 text-[#6B6B6B]/40" />}
              </button>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#2D2D2D]">{item.message}</p>
                {status === 'scheduled' && item.scheduled_for && (
                  <p className="mt-0.5 flex items-center gap-1 text-[11px] text-[#6B6B6B]">
                    <Clock className="h-3 w-3" />
                    Goes live {fmtLocal(item.scheduled_for)}
                  </p>
                )}
              </div>

              {/* Status badge */}
              {status === 'live' && (
                <span className="shrink-0 rounded-full bg-[#4B8B5A]/10 border border-[#4B8B5A]/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#4B8B5A]">
                  Live
                </span>
              )}
              {status === 'scheduled' && (
                <span className="shrink-0 rounded-full bg-[#5A7AB8]/10 border border-[#5A7AB8]/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#5A7AB8]">
                  Scheduled
                </span>
              )}

              <button
                onClick={() => destroy(item.id)}
                aria-label="Delete announcement"
                className="shrink-0 text-[#6B6B6B]/40 hover:text-[#C44B4B] cursor-pointer transition-colors mt-0.5"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )
        })}
        {items.length === 0 && (
          <p className="py-8 text-center text-sm text-[#6B6B6B]">No announcements yet.</p>
        )}
      </div>
    </div>
  )
}
