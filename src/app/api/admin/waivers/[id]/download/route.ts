import { auth } from '@/lib/auth'
import { db } from '@/db'
import { manualWaivers } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  // Only manual waivers have attached files — digital waivers are pure DB records
  const [waiver] = await db
    .select({ cloudinary_url: manualWaivers.cloudinary_url, client_name: manualWaivers.client_name })
    .from(manualWaivers)
    .where(eq(manualWaivers.id, id))
    .limit(1)

  if (!waiver) {
    return NextResponse.json({ error: 'No file attached to this waiver' }, { status: 404 })
  }

  if (!waiver.cloudinary_url) {
    return NextResponse.json({ error: 'No file attached to this waiver' }, { status: 404 })
  }

  return NextResponse.json({ url: waiver.cloudinary_url, client: waiver.client_name })
}
