import { auth } from '@/lib/auth'
import { db } from '@/db'
import { siteImages } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { uploadImage, deleteImage } from '@/lib/cloudinary'
import { NextResponse } from 'next/server'

const VALID_SLOTS = new Set([
  'hero', 'meet-amy',
  'gallery-1', 'gallery-2', 'gallery-3',
  'gallery-4', 'gallery-5', 'gallery-6',
])

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const data = await db.select().from(siteImages).orderBy(siteImages.slot)
  return NextResponse.json(data ?? [])
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

  const [row] = await db
    .update(siteImages)
    .set({ cloudinary_id, url, blur_data_url, alt: alt || slot })
    .where(eq(siteImages.slot, slot))
    .returning()

  if (!row) return NextResponse.json({ error: 'Slot not found' }, { status: 404 })
  return NextResponse.json(row)
}
