import { auth } from '@/lib/auth'
import { db } from '@/db'
import { waivers, manualWaivers } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { deleteFile } from '@/lib/cloudinary'
import { NextResponse } from 'next/server'

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  // Try manual waivers first (they have Cloudinary files to clean up)
  const [manual] = await db
    .select({ cloudinary_id: manualWaivers.cloudinary_id })
    .from(manualWaivers)
    .where(eq(manualWaivers.id, id))
    .limit(1)

  if (manual) {
    if (manual.cloudinary_id) {
      const { error: removeErr } = await deleteFile(manual.cloudinary_id)
        .then(() => ({ error: null }))
        .catch((e: Error) => ({ error: e.message }))

      if (removeErr) {
        // Log but continue — orphaned Cloudinary assets can be cleaned up manually
        console.error('[waivers/delete] Cloudinary file removal failed:', manual.cloudinary_id, removeErr)
      }
    }
    await db.delete(manualWaivers).where(eq(manualWaivers.id, id))
    return new NextResponse(null, { status: 204 })
  }

  // Fall back to digital waivers (no file — just delete the DB row)
  const [digital] = await db
    .select({ id: waivers.id })
    .from(waivers)
    .where(eq(waivers.id, id))
    .limit(1)

  if (!digital) return NextResponse.json({ error: 'Waiver not found' }, { status: 404 })

  await db.delete(waivers).where(eq(waivers.id, id))
  return new NextResponse(null, { status: 204 })
}
