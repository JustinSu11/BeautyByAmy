import { auth } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase'
import { uploadImage, deleteImage } from '@/lib/cloudinary'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = createServerClient()
  const { data, error } = await supabase.from('site_images').select('*').order('slot')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await req.formData()
  const slot = form.get('slot') as string | null
  const file = form.get('file') as File | null
  const alt  = form.get('alt') as string | null

  if (!slot || !file) return NextResponse.json({ error: 'slot and file required' }, { status: 400 })

  const supabase = createServerClient()

  // Fetch current slot to clean up old Cloudinary asset (if not a seed placeholder)
  const { data: existing } = await supabase
    .from('site_images')
    .select('cloudinary_id')
    .eq('slot', slot)
    .single()

  const buffer = Buffer.from(await file.arrayBuffer())
  const { cloudinary_id, url, blur_data_url } = await uploadImage(buffer, `beautybyamy/site/${slot}`)

  // Delete old Cloudinary asset if it was a real upload
  if (existing?.cloudinary_id && !existing.cloudinary_id.startsWith('local-')) {
    try { await deleteImage(existing.cloudinary_id) } catch { /* ignore — old asset cleanup is best-effort */ }
  }

  const { data, error } = await supabase
    .from('site_images')
    .update({ cloudinary_id, url, blur_data_url, alt: alt || slot })
    .eq('slot', slot)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
