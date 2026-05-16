import { auth } from '@/lib/auth'
import { db } from '@/db'
import { galleryImages } from '@/db/schema'
import { desc } from 'drizzle-orm'
import { uploadImage, deleteImage } from '@/lib/cloudinary'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const data = await db
    .select()
    .from(galleryImages)
    .orderBy(galleryImages.display_order)

  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const form     = await req.formData()
  const file     = form.get('file') as File | null
  const category = form.get('category') as string | null
  const label    = form.get('label') as string | null

  if (!file || !category || !label) {
    return NextResponse.json({ error: 'file, category, and label are required' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const { cloudinary_id, url, blur_data_url } = await uploadImage(buffer, 'beautybyamy/gallery')

  // Determine next display_order (highest existing + 1)
  const [topRow] = await db
    .select({ display_order: galleryImages.display_order })
    .from(galleryImages)
    .orderBy(desc(galleryImages.display_order))
    .limit(1)
  const nextOrder = (topRow?.display_order ?? 0) + 1

  const [row] = await db
    .insert(galleryImages)
    .values({ cloudinary_id, url, blur_data_url, category, label, display_order: nextOrder })
    .returning()

  if (!row) {
    // Clean up the Cloudinary upload to avoid orphaned assets
    await deleteImage(cloudinary_id)
    return NextResponse.json({ error: 'Failed to save image record' }, { status: 500 })
  }
  return NextResponse.json(row, { status: 201 })
}
