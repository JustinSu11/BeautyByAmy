import { createServerClient } from '@/lib/supabase'
import { Megaphone } from 'lucide-react'

export async function AnnouncementBanner() {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('announcements')
    .select('message, expires_at')
    .eq('active', true)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .limit(1)
    .maybeSingle()

  if (!data) return null

  return (
    <div className="relative z-50 flex items-center justify-center gap-3 bg-[#C9A96E] px-4 py-2.5 text-center text-sm font-medium text-white">
      <Megaphone className="h-3.5 w-3.5 shrink-0" />
      <span>{data.message}</span>
    </div>
  )
}
