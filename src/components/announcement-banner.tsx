import { db } from '@/db'
import { announcements } from '@/db/schema'
import { and, eq, gt, isNull, lte, or } from 'drizzle-orm'
import { Megaphone } from 'lucide-react'

export async function AnnouncementBanner() {
  const now = new Date()
  const [data] = await db
    .select({ message: announcements.message })
    .from(announcements)
    .where(
      and(
        // Show if manually active OR scheduled time has arrived
        or(eq(announcements.active, true), and(isNull(announcements.active), lte(announcements.scheduled_for, now)), lte(announcements.scheduled_for, now)),
        // Not expired
        or(isNull(announcements.expires_at), gt(announcements.expires_at, now)),
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
