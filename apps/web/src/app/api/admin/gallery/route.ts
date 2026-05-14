import { auth } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase'
import { uploadImage, deleteImage } from '@/lib/cloudinary'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('gallery_images')
    .select('*')
    .order('display_order')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const form     = await req.formData()
  const file     = form.get('file') as File | null
  const category = form.get('category') as string | null
  const label    = form.get('label') as string | null

  if (!file || !category || !label) {
    return NextResponse.json({ error: 'file, category, and label are required' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const { cloudinary_id, url, blur_data_url } = await uploadImage(buffer, 'beautybyamy/gallery')

  const supabase = createServerClient()
  const { data: maxOrderRow } = await supabase
    .from('gallery_images')
    .select('display_order')
    .order('display_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { data, error } = await supabase
    .from('gallery_images')
    .insert({
      cloudinary_id,
      url,
      blur_data_url,
      category,
      label,
      display_order: (maxOrderRow?.display_order ?? 0) + 1,
    })
    .select()
    .single()

  if (error) {
    // Clean up the Cloudinary upload to avoid orphaned assets
    await deleteImage(cloudinary_id)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data, { status: 201 })
}
