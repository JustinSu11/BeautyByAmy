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

  const form       = await req.formData()
  const afterFile  = form.get('file') as File | null
  const beforeFile = form.get('beforeFile') as File | null
  const category   = form.get('category') as string | null
  const label      = form.get('label') as string | null

  if (!afterFile || !category || !label) {
    return NextResponse.json({ error: 'file, category, and label are required' }, { status: 400 })
  }

  const afterBuf = Buffer.from(await afterFile.arrayBuffer())
  const after    = await uploadImage(afterBuf, 'beautybyamy/gallery')

  let before: { cloudinary_id: string; url: string; blur_data_url: string } | null = null
  if (beforeFile) {
    const beforeBuf = Buffer.from(await beforeFile.arrayBuffer())
    before = await uploadImage(beforeBuf, 'beautybyamy/gallery/before')
  }

  const [topRow] = await db
    .select({ display_order: galleryImages.display_order })
    .from(galleryImages)
    .orderBy(desc(galleryImages.display_order))
    .limit(1)
  const nextOrder = (topRow?.display_order ?? 0) + 1

  const [row] = await db
    .insert(galleryImages)
    .values({
      cloudinary_id: after.cloudinary_id,
      url:           after.url,
      blur_data_url: after.blur_data_url,
      before_cloudinary_id: before?.cloudinary_id ?? null,
      before_url:           before?.url           ?? null,
      before_blur_data_url: before?.blur_data_url ?? null,
      category,
      label,
      display_order: nextOrder,
    })
    .returning()

  if (!row) {
    await deleteImage(after.cloudinary_id)
    if (before) await deleteImage(before.cloudinary_id)
    return NextResponse.json({ error: 'Failed to save image record' }, { status: 500 })
  }
  return NextResponse.json(row, { status: 201 })
}
