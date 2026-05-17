import { db } from '@/db'
import { siteImages } from '@/db/schema'
import { eq } from 'drizzle-orm'

/** Static fallbacks used when a slot has not been uploaded through the admin panel. */
const FALLBACKS: Record<string, string> = {
  'hero':           '/images/hero-bg.jpg',
  'meet-amy':       '/images/amy-portrait.jpg',
  'service-lashes': '/images/service-lashes.jpg',
  'service-brows':  '/images/service-brows.jpg',
  'service-pmu':    '/images/service-pmu.jpg',
}

/**
 * Returns the Cloudinary URL for a named image slot, or falls back to the
 * bundled static file if the slot hasn't been uploaded yet.
 *
 * Safe to call from any server component — does NOT require an admin session.
 */
export async function getSiteImageUrl(slot: string): Promise<string> {
  const [row] = await db
    .select({ url: siteImages.url })
    .from(siteImages)
    .where(eq(siteImages.slot, slot))
    .limit(1)

  return row?.url ?? FALLBACKS[slot] ?? '/images/hero-bg.jpg'
}

/**
 * Fetches multiple slots in one query. Returns a map of slot → URL.
 * Falls back to static files for any slot not yet in the DB.
 */
export async function getSiteImageUrls(slots: string[]): Promise<Record<string, string>> {
  const rows = await db
    .select({ slot: siteImages.slot, url: siteImages.url })
    .from(siteImages)

  const bySlot = Object.fromEntries(rows.map((r) => [r.slot, r.url]))

  return Object.fromEntries(
    slots.map((slot) => [slot, bySlot[slot] ?? FALLBACKS[slot] ?? '/images/hero-bg.jpg'])
  )
}
