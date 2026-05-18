export const dynamic = 'force-dynamic'

import { ExternalLink } from 'lucide-react'

export default function ServicesPage() {
  return (
    <div className="p-7">
      <div className="mb-6">
        <h1 className="font-serif text-xl font-semibold text-[#2D2D2D]">Services</h1>
        <p className="mt-1 text-sm text-[#6B6B6B]">Managed directly in your Square dashboard</p>
      </div>

      <div className="max-w-md rounded-lg border border-[#E8E2DA] bg-white p-6 shadow-sm">
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#C9A96E]/10">
          <ExternalLink className="h-5 w-5 text-[#C9A96E]" />
        </div>
        <h2 className="mb-1 text-sm font-semibold text-[#2D2D2D]">Add, edit, and remove services in Square</h2>
        <p className="mb-5 text-sm leading-relaxed text-[#6B6B6B]">
          Your service catalog — names, prices, durations, and availability — is managed from your
          Square Appointments dashboard. Changes made there appear on your booking page automatically.
        </p>
        <a
          href="https://squareup.com/dashboard"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-[#C9A96E] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#A68B4E]"
        >
          Open Square Dashboard
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  )
}
