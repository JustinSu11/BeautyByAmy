import { auth } from '@/lib/auth'
import { db } from '@/db'
import { adminServices } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const patchSchema = z
  .object({
    name:          z.string().min(1).optional(),
    duration:      z.string().min(1).optional(),
    price:         z.string().min(1).optional(),
    enabled:       z.boolean().optional(),
    group_label:   z.string().nullable().optional(),
    display_order: z.number().int().optional(),
    category:      z.enum(['lashes', 'brows', 'pmu', 'addons']).optional(),
  })
  .refine((obj) => Object.keys(obj).length > 0, {
    message: 'At least one field must be provided',
  })

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const [row] = await db
    .update(adminServices)
    .set(parsed.data)
    .where(eq(adminServices.id, id))
    .returning()

  if (!row) return NextResponse.json({ error: 'Service not found' }, { status: 404 })
  return NextResponse.json(row)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await db.delete(adminServices).where(eq(adminServices.id, id))
  // Idempotent: deleting a non-existent ID returns 204 — correct REST behaviour
  return new NextResponse(null, { status: 204 })
}
