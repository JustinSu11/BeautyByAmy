import { auth } from '@/lib/auth'
import { db } from '@/db'
import { announcements } from '@/db/schema'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  message:       z.string().min(1),
  active:        z.boolean().default(false),
  expires_at:    z.string().datetime().nullable().optional(),
  scheduled_for: z.string().datetime().nullable().optional(),
})

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const data = await db
    .select()
    .from(announcements)
    .orderBy(announcements.created_at)

  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  // Deactivate all existing announcements if this one is active
  if (parsed.data.active) {
    await db.update(announcements).set({ active: false })
  }

  const [row] = await db
    .insert(announcements)
    .values({
      message:       parsed.data.message,
      active:        parsed.data.active,
      expires_at:    parsed.data.expires_at    ? new Date(parsed.data.expires_at)    : null,
      scheduled_for: parsed.data.scheduled_for ? new Date(parsed.data.scheduled_for) : null,
    })
    .returning()

  return NextResponse.json(row, { status: 201 })
}
