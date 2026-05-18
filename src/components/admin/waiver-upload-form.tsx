'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { Upload, X, Search, Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

type SquareCustomer = { id: string; name: string; email?: string; phone?: string }

type Props = { onClose: () => void; onUploaded: () => void }

export function WaiverUploadForm({ onClose, onUploaded }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [saving, setSaving] = useState(false)
  const [fileName, setFileName] = useState('')

  // Client search state
  const [nameQuery, setNameQuery]           = useState('')
  const [results, setResults]               = useState<SquareCustomer[]>([])
  const [searching, setSearching]           = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<SquareCustomer | null>(null)
  const [showDropdown, setShowDropdown]     = useState(false)
  const [noResults, setNoResults]           = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Debounced search as Amy types
  const handleNameChange = useCallback((value: string) => {
    setNameQuery(value)
    setSelectedCustomer(null)
    setNoResults(false)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (value.trim().length < 2) {
      setResults([])
      setShowDropdown(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(`/api/admin/customers/search?q=${encodeURIComponent(value)}`)
        const data: SquareCustomer[] = await res.json()
        setResults(data)
        setNoResults(data.length === 0)
        setShowDropdown(true)
      } catch {
        setResults([])
        setNoResults(true)
        setShowDropdown(true)
      } finally {
        setSearching(false)
      }
    }, 300)
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  function selectCustomer(c: SquareCustomer) {
    setSelectedCustomer(c)
    setNameQuery(c.name)
    setShowDropdown(false)
    setNoResults(false)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!selectedCustomer) {
      toast.error('Please search for and select a client from the dropdown before saving.')
      return
    }

    setSaving(true)
    const form = new FormData(e.currentTarget)
    // Replace the typed name with the exact Square name and attach the customer ID
    form.set('client_name', selectedCustomer.name)
    form.set('square_customer_id', selectedCustomer.id)

    const res = await fetch('/api/admin/waivers', { method: 'POST', body: form })
    setSaving(false)

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      toast.error(data.error ?? 'Upload failed — please try again')
      return
    }

    toast.success('Waiver saved and note added to client\'s Square profile')
    onUploaded()
    onClose()
  }

  const inputCls = 'w-full rounded-lg border border-[#D9D1C7] bg-white px-3 py-2.5 text-sm text-[#2D2D2D] placeholder:text-[#6B6B6B]/50 outline-none focus:border-[#C9A96E]'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl border border-[#E8E2DA] bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-serif text-lg font-semibold text-[#2D2D2D]">Upload Signed Waiver</h2>
          <button onClick={onClose} aria-label="Close" className="text-[#6B6B6B] hover:text-[#2D2D2D] cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">

          {/* Client name — typeahead from Square */}
          <div className="relative" ref={dropdownRef}>
            <label className="mb-1 block text-xs text-[#6B6B6B]">
              Client Name *
              <span className="ml-1 font-normal text-[#6B6B6B]/60">(search by name as booked)</span>
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#6B6B6B]/40" />
              {searching && (
                <Loader2 className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-[#C9A96E]" />
              )}
              <input
                value={nameQuery}
                onChange={(e) => handleNameChange(e.target.value)}
                onFocus={() => results.length > 0 && setShowDropdown(true)}
                placeholder="Start typing a client name…"
                className={`${inputCls} pl-8 ${selectedCustomer ? 'border-[#C9A96E] bg-[#C9A96E]/5' : ''}`}
                autoComplete="off"
              />
            </div>

            {/* Selected indicator */}
            {selectedCustomer && (
              <p className="mt-1 text-[11px] text-[#C9A96E]">
                ✓ Matched — {selectedCustomer.email ?? selectedCustomer.phone ?? 'Square profile found'}
              </p>
            )}

            {/* No results warning */}
            {noResults && !searching && nameQuery.length >= 2 && (
              <div className="mt-1.5 flex items-start gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                <p className="text-[11px] text-amber-700 leading-snug">
                  No Square client found matching &ldquo;{nameQuery}&rdquo;. The client must have
                  booked an appointment first. Check the name in Amy&apos;s Square dashboard.
                </p>
              </div>
            )}

            {/* Dropdown */}
            {showDropdown && results.length > 0 && (
              <ul className="absolute z-10 mt-1 w-full rounded-lg border border-[#E8E2DA] bg-white shadow-lg overflow-hidden">
                {results.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => selectCustomer(c)}
                      className="flex w-full flex-col items-start px-3 py-2.5 text-left text-sm hover:bg-[#FAF8F5] transition-colors"
                    >
                      <span className="font-medium text-[#2D2D2D]">{c.name}</span>
                      {(c.email || c.phone) && (
                        <span className="text-[11px] text-[#6B6B6B]">
                          {c.email ?? c.phone}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-[#6B6B6B]">Service *</label>
              <select name="service" required className={inputCls}>
                <option value="">Select…</option>
                <option>Ombré Brows</option>
                <option>Microblading</option>
                <option>Microshading</option>
                <option>Lip Blush</option>
                <option>Classic Lash Set</option>
                <option>Volume Lash Set</option>
                <option>Hybrid Lash Set</option>
                <option>Brow Lamination</option>
                <option>Brow Tint</option>
                <option>Brow Wax</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#6B6B6B]">Appointment Date</label>
              <input name="appointment_date" type="date" className={inputCls} />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-[#6B6B6B]">Waiver File (PDF or image)</label>
            <label
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileRef.current?.click() }}
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#D9D1C7] bg-[#FAF8F5] py-6 text-center transition hover:border-[#C9A96E] hover:bg-[#C9A96E]/5"
            >
              <Upload className="h-5 w-5 text-[#6B6B6B]/50" />
              <span className="text-sm text-[#6B6B6B]">
                {fileName || 'Click to choose PDF or image'}
              </span>
              <span className="text-[11px] text-[#6B6B6B]/60">PDF, JPG, PNG — max 10 MB</span>
              <input
                ref={fileRef}
                name="file"
                type="file"
                accept=".pdf,image/*"
                className="hidden"
                onChange={(e) => setFileName(e.target.files?.[0]?.name ?? '')}
              />
            </label>
          </div>

          <div>
            <label className="mb-1 block text-xs text-[#6B6B6B]">Notes (optional)</label>
            <textarea
              name="notes"
              rows={2}
              placeholder="e.g. Paper copy scanned at studio on day of appointment"
              className={inputCls}
            />
          </div>

          <button
            type="submit"
            disabled={saving || !selectedCustomer}
            className="mt-2 rounded-lg bg-[#C9A96E] py-2.5 text-sm font-semibold text-white transition hover:bg-[#A68B4E] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {saving ? 'Saving…' : 'Save Waiver'}
          </button>
        </form>
      </div>
    </div>
  )
}
