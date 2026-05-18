import { auth } from '@/lib/auth'
import { db } from '@/db'
import { announcements } from '@/db/schema'
import { eq, ne } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const patchSchema = z.object({
  message:       z.string().min(1).optional(),
  active:        z.boolean().optional(),
  expires_at:    z.string().datetime().nullable().optional(),
  scheduled_for: z.string().datetime().nullable().optional(),
})

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const parsed = patchSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  // Only one announcement active at a time
  if (parsed.data.active) {
    await db.update(announcements).set({ active: false }).where(ne(announcements.id, id))
  }

  const updateValues: Record<string, unknown> = {}
  if (parsed.data.message !== undefined) updateValues.message = parsed.data.message
  if (parsed.data.active  !== undefined) updateValues.active  = parsed.data.active
  if ('expires_at'    in parsed.data) updateValues.expires_at    = parsed.data.expires_at    ? new Date(parsed.data.expires_at)    : null
  if ('scheduled_for' in parsed.data) updateValues.scheduled_for = parsed.data.scheduled_for ? new Date(parsed.data.scheduled_for) : null

  const [row] = await db
    .update(announcements)
    .set(updateValues)
    .where(eq(announcements.id, id))
    .returning()

  if (!row) return NextResponse.json({ error: 'Announcement not found' }, { status: 404 })
  return NextResponse.json(row)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await db.delete(announcements).where(eq(announcements.id, id))
  return new NextResponse(null, { status: 204 })
}
