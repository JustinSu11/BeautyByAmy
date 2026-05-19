import { db } from '@/db'
import { siteContent } from '@/db/schema'

/**
 * Default text values for every editable content key.
 * Public pages fall back to these when no DB row exists yet.
 */
export const CONTENT_DEFAULTS: Record<string, string> = {
  // ── Services page category descriptions ────────────────────────────────────
  lashes_description:
    'Individually applied silk lashes in classic, hybrid, or full volume for a seamless, customized look that enhances your natural eye shape.',
  signature_description:
    'From microblading and ombre brows to lip blush, semi-permanent artistry that delivers effortless definition lasting years, not hours.',
  beauty_bar_description:
    'Quick, high-impact treatments including waxing, tinting, threading, and more to keep your look perfectly polished between appointments.',

  // ── Landing page hero ──────────────────────────────────────────────────────
  hero_headline:  'Elevate Your\nNatural Beauty',
  hero_subtext:
    'Bespoke eyelash extensions, brow artistry, and permanent makeup by Amy, where precision meets luxury.',

  // ── Meet Amy section ───────────────────────────────────────────────────────
  meet_amy_bio_1:
    '3x Certified Brow & Lash Artist specializing in lash extensions and all brow services, including our most popular Ombré Brows. Dedicated to keeping your results as soft and natural as possible while giving you the shape and look that fits you.',
  meet_amy_bio_2:
    'Every appointment is personal. Every service is tailored to your unique features. And we do it all with love.',
}

/** Human-readable labels used in the admin Content page. */
export const CONTENT_LABELS: Record<string, string> = {
  lashes_description:    'Lash Extensions — category description',
  signature_description: 'Brows & Lips — category description',
  beauty_bar_description:'Beauty Bar — category description',
  hero_headline:         'Homepage hero headline',
  hero_subtext:          'Homepage hero subtext',
  meet_amy_bio_1:        'Meet Amy — first paragraph',
  meet_amy_bio_2:        'Meet Amy — second paragraph',
}

/**
 * Fetch all site content rows from DB and return a merged map
 * (DB values override defaults, missing keys use defaults).
 * Safe to call from server components — does not require an admin session.
 */
export async function getAllSiteContent(): Promise<Record<string, string>> {
  const rows = await db.select().from(siteContent).catch(() => [])
  const merged = { ...CONTENT_DEFAULTS }
  for (const row of rows) {
    merged[row.content_key] = row.value
  }
  return merged
}

/**
 * Fetch a single content value by key.
 * Returns the default if no DB row exists.
 */
export async function getSiteContent(key: string): Promise<string> {
  const all = await getAllSiteContent()
  return all[key] ?? CONTENT_DEFAULTS[key] ?? ''
}
