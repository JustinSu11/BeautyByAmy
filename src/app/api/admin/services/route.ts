import { auth } from '@/lib/auth'
import { db } from '@/db'
import { adminServices } from '@/db/schema'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const serviceSchema = z.object({
  category:      z.enum(['lashes', 'brows', 'pmu', 'addons']),
  group_label:   z.string().nullable(),
  name:          z.string().min(1),
  duration:      z.string().min(1),
  price:         z.string().min(1),
  display_order: z.number().int().default(0),
})

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const data = await db
    .select()
    .from(adminServices)
    .orderBy(adminServices.category, adminServices.display_order)

  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = serviceSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const [row] = await db
    .insert(adminServices)
    .values({ ...parsed.data, enabled: true })
    .returning()

  return NextResponse.json(row, { status: 201 })
}
