import { auth } from '@/lib/auth'
import { db } from '@/db'
import { galleryImages } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { uploadImage, deleteImage } from '@/lib/cloudinary'
import { NextResponse } from 'next/server'

/** PATCH — add or replace the "before" image on an existing gallery card */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const form = await req.formData()
  const beforeFile = form.get('beforeFile') as File | null
  if (!beforeFile) return NextResponse.json({ error: 'beforeFile is required' }, { status: 400 })

  const [existing] = await db
    .select({ before_cloudinary_id: galleryImages.before_cloudinary_id })
    .from(galleryImages)
    .where(eq(galleryImages.id, id))
    .limit(1)
  if (!existing) return NextResponse.json({ error: 'Image not found' }, { status: 404 })

  // Delete old before image from Cloudinary if present
  if (existing.before_cloudinary_id) {
    try { await deleteImage(existing.before_cloudinary_id) } catch { /* ignore */ }
  }

  const buffer = Buffer.from(await beforeFile.arrayBuffer())
  const before = await uploadImage(buffer, 'beautybyamy/gallery/before')

  const [row] = await db
    .update(galleryImages)
    .set({
      before_cloudinary_id: before.cloudinary_id,
      before_url:           before.url,
      before_blur_data_url: before.blur_data_url,
    })
    .where(eq(galleryImages.id, id))
    .returning()

  return NextResponse.json(row)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const [image] = await db
    .select({
      cloudinary_id:        galleryImages.cloudinary_id,
      before_cloudinary_id: galleryImages.before_cloudinary_id,
    })
    .from(galleryImages)
    .where(eq(galleryImages.id, id))
    .limit(1)

  if (!image) return NextResponse.json({ error: 'Image not found' }, { status: 404 })

  if (!image.cloudinary_id.startsWith('local-')) {
    try { await deleteImage(image.cloudinary_id) } catch {
      return NextResponse.json({ error: 'Cloudinary delete failed' }, { status: 500 })
    }
  }
  if (image.before_cloudinary_id) {
    try { await deleteImage(image.before_cloudinary_id) } catch { /* ignore */ }
  }

  await db.delete(galleryImages).where(eq(galleryImages.id, id))
  return new NextResponse(null, { status: 204 })
}
