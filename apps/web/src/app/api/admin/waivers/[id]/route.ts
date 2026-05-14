import { auth } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const supabase = createServerClient()

  // Fetch storage_path before deleting the row
  const { data: waiver, error: fetchErr } = await supabase
    .from('waivers')
    .select('storage_path')
    .eq('id', id)
    .single()

  if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 404 })

  // Remove file from storage if it exists
  if (waiver.storage_path) {
    await supabase.storage.from('waivers').remove([waiver.storage_path])
  }

  const { error } = await supabase.from('waivers').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return new NextResponse(null, { status: 204 })
}
