'use client'

import { useState } from 'react'
import { Shield, CheckCircle } from 'lucide-react'

export function WaiverForm({ token }: { token: string }) {
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function sign() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/waivers/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, agreed: true }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Something went wrong.')
        return
      }
      setDone(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="mt-6 flex flex-col items-center gap-3 text-center">
        <CheckCircle className="h-10 w-10 text-gold" />
        <p className="font-serif text-lg text-charcoal">Waiver signed — you&apos;re all set!</p>
        <p className="text-sm text-muted-foreground">See you at your appointment.</p>
      </div>
    )
  }

  return (
    <div className="mt-5">
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-gold"
        />
        <span className="text-sm text-muted-foreground">
          I have read and agree to the terms above.
        </span>
      </label>

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

      <button
        type="button"
        onClick={sign}
        disabled={!agreed || loading}
        className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-gold px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-gold-dark disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Shield className="h-4 w-4" />
        {loading ? 'Saving…' : 'Sign & Complete'}
      </button>
    </div>
  )
}
