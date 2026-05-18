import { auth } from '@/lib/auth'
import { db } from '@/db'
import { siteImages } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { uploadImage, deleteImage } from '@/lib/cloudinary'
import { NextResponse } from 'next/server'

const ORDERED_SLOTS = [
  'hero', 'meet-amy',
  'service-lashes', 'service-brows', 'service-pmu',
]
const VALID_SLOTS = new Set(ORDERED_SLOTS)

// Placeholder shown for slots that haven't been uploaded yet
const PLACEHOLDER_URL = 'https://placehold.co/1920x1080/F5F0EB/A68B4E?text=No+image+set'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rows = await db.select().from(siteImages)
  const bySlot = Object.fromEntries(rows.map((r) => [r.slot, r]))

  // Always return all 5 slots so the UI renders every card
  const data = ORDERED_SLOTS.map((slot) => bySlot[slot] ?? {
    id: null, slot, cloudinary_id: null,
    url: PLACEHOLDER_URL,
    blur_data_url: null,
    alt: slot,
    created_at: null,
  })

  return NextResponse.json(data)
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await req.formData()
  const slot = form.get('slot') as string | null
  const file = form.get('file') as File | null
  const alt  = form.get('alt') as string | null

  if (!slot || !VALID_SLOTS.has(slot) || !file) {
    return NextResponse.json({ error: 'slot must be a valid image slot, and file is required' }, { status: 400 })
  }

  // Fetch current slot to clean up old Cloudinary asset
  const [existing] = await db
    .select({ cloudinary_id: siteImages.cloudinary_id })
    .from(siteImages)
    .where(eq(siteImages.slot, slot))
    .limit(1)

  const buffer = Buffer.from(await file.arrayBuffer())
  const { cloudinary_id, url, blur_data_url } = await uploadImage(buffer, `beautybyamy/site/${slot}`)

  // Delete old Cloudinary asset if it was a real upload (best-effort)
  if (existing?.cloudinary_id && !existing.cloudinary_id.startsWith('local-')) {
    try { await deleteImage(existing.cloudinary_id) } catch { /* ignore */ }
  }

  // Upsert — works whether or not the slot row exists yet
  const [row] = await db
    .insert(siteImages)
    .values({ slot, cloudinary_id, url, blur_data_url, alt: alt || slot })
    .onConflictDoUpdate({
      target: siteImages.slot,
      set: { cloudinary_id, url, blur_data_url, alt: alt || slot },
    })
    .returning()

  return NextResponse.json(row)
}
