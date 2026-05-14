import { auth } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const supabase = createServerClient()

  const { data: waiver, error: fetchErr } = await supabase
    .from('waivers')
    .select('storage_path, client_name')
    .eq('id', id)
    .single()

  if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 404 })

  if (!waiver.storage_path) {
    return NextResponse.json({ error: 'No file attached to this waiver' }, { status: 404 })
  }

  // Signed URL valid for 60 seconds — enough time to open the file, short enough to limit exposure
  const { data, error } = await supabase.storage
    .from('waivers')
    .createSignedUrl(waiver.storage_path, 60)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ url: data.signedUrl, client: waiver.client_name })
}
