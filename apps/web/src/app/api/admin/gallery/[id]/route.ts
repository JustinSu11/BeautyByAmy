import { auth } from '@/lib/auth'
import { db } from '@/db'
import { galleryImages } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { deleteImage } from '@/lib/cloudinary'
import { NextResponse } from 'next/server'

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const [image] = await db
    .select({ cloudinary_id: galleryImages.cloudinary_id })
    .from(galleryImages)
    .where(eq(galleryImages.id, id))
    .limit(1)

  if (!image) return NextResponse.json({ error: 'Image not found' }, { status: 404 })

  // Only delete from Cloudinary if it's a real upload (not a local seed placeholder)
  if (!image.cloudinary_id.startsWith('local-')) {
    try {
      await deleteImage(image.cloudinary_id)
    } catch {
      return NextResponse.json({ error: 'Cloudinary delete failed' }, { status: 500 })
    }
  }

  await db.delete(galleryImages).where(eq(galleryImages.id, id))
  return new NextResponse(null, { status: 204 })
}
