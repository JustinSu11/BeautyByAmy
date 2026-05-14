import { auth } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  message:    z.string().min(1),
  active:     z.boolean().default(false),
  expires_at: z.string().datetime().nullable().optional(),
})

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = createServerClient()
  const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false })
  return NextResponse.json(data ?? [])
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const supabase = createServerClient()
  // Deactivate all others if this one is active
  if (parsed.data.active) {
    await supabase.from('announcements').update({ active: false }).neq('id', '00000000-0000-0000-0000-000000000000')
  }
  const { data, error } = await supabase.from('announcements').insert(parsed.data).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
