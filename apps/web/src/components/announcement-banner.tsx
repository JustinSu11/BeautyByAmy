import { db } from '@/db'
import { announcements } from '@/db/schema'
import { and, eq, gt, isNull, or } from 'drizzle-orm'
import { Megaphone } from 'lucide-react'

export async function AnnouncementBanner() {
  const [data] = await db
    .select({ message: announcements.message })
    .from(announcements)
    .where(
      and(
        eq(announcements.active, true),
        // Show if expires_at is null (no expiry) or hasn't passed yet
        or(isNull(announcements.expires_at), gt(announcements.expires_at, new Date())),
      ),
    )
    .limit(1)

  if (!data) return null

  return (
    <div className="relative z-50 flex items-center justify-center gap-3 bg-[#C9A96E] px-4 py-2.5 text-center text-sm font-medium text-white">
      <Megaphone className="h-3.5 w-3.5 shrink-0" />
      <span>{data.message}</span>
    </div>
  )
}
