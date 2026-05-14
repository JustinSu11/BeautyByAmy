import { auth } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase'
import { deleteImage } from '@/lib/cloudinary'
import { NextResponse } from 'next/server'

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const supabase = createServerClient()
  const { data: image, error: fetchErr } = await supabase
    .from('gallery_images')
    .select('cloudinary_id')
    .eq('id', id)
    .single()

  if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 404 })

  // Only delete from Cloudinary if it's a real upload (not a local seed placeholder)
  if (!image.cloudinary_id.startsWith('local-')) {
    try {
      await deleteImage(image.cloudinary_id)
    } catch {
      return NextResponse.json({ error: 'Cloudinary delete failed' }, { status: 500 })
    }
  }

  const { error } = await supabase.from('gallery_images').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return new NextResponse(null, { status: 204 })
}
