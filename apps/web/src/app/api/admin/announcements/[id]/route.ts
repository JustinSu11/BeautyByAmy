import { auth } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await req.json()
  const supabase = createServerClient()
  // Only one announcement active at a time
  if (body.active) {
    await supabase.from('announcements').update({ active: false }).neq('id', id)
  }
  const { data, error } = await supabase.from('announcements').update(body).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const supabase = createServerClient()
  await supabase.from('announcements').delete().eq('id', id)
  return new NextResponse(null, { status: 204 })
}
