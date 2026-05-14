import { auth } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase'
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

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('services')
    .update(parsed.data)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const supabase = createServerClient()
  const { error } = await supabase.from('services').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  // Idempotent: deleting a non-existent ID returns 204 (no content) — correct REST behaviour
  return new NextResponse(null, { status: 204 })
}
