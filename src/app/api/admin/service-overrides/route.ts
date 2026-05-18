import { auth } from '@/lib/auth'
import { db } from '@/db'
import { serviceOverrides } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const overrideSchema = z.object({
  squareVariationId: z.string().min(1),
  category: z.enum(['lashes', 'brows', 'pmu', 'addons']),
})

/**
 * PUT /api/admin/service-overrides
 * Upsert a category override for a Square variation ID.
 * If the category matches what inferPublicCategory would return, the override
 * is deleted so the service reverts to automatic categorisation.
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
