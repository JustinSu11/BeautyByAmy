import { auth } from '@/lib/auth'
import { db } from '@/db'
import { serviceOverrides } from '@/db/schema'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const CATEGORIES = ['lashes', 'brows', 'pmu', 'addons'] as const

const overrideSchema = z.object({
  squareVariationId: z.string().min(1),
  category: z.enum(CATEGORIES),
})

const batchSchema = z.array(
  z.object({
    squareVariationId: z.string().min(1),
    category: z.enum(CATEGORIES),
    sort_order: z.number().int(),
  })
)

/**
 * PUT /api/admin/service-overrides
 * Upsert a single category override for a Square variation ID.
 */
export async function PUT(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = overrideSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { squareVariationId, category } = parsed.data

  await db
    .insert(serviceOverrides)
    .values({ square_variation_id: squareVariationId, category })
    .onConflictDoUpdate({
      target: serviceOverrides.square_variation_id,
      set: { category, updated_at: new Date() },
    })

  return NextResponse.json({ ok: true })
}

/**
 * PATCH /api/admin/service-overrides
 * Batch-upsert category + sort_order for multiple services at once.
 * Called after a drag-and-drop reorder to persist the new order.
 */
export async function PATCH(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = batchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  await Promise.all(
    parsed.data.map(({ squareVariationId, category, sort_order }) =>
      db
        .insert(serviceOverrides)
        .values({ square_variation_id: squareVariationId, category, sort_order })
        .onConflictDoUpdate({
          target: serviceOverrides.square_variation_id,
          set: { category, sort_order, updated_at: new Date() },
        })
    )
  )

  return NextResponse.json({ ok: true })
}
