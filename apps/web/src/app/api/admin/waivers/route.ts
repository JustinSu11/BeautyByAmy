import { auth } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// GET /api/admin/waivers?search=jane&method=manual
export async function GET(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') ?? ''
  const method = searchParams.get('method') ?? ''

  const supabase = createServerClient()
  let query = supabase
    .from('waivers')
    .select('id, client_name, service, appointment_date, method, signed_at, notes')
    .order('created_at', { ascending: false })

  if (search) query = query.ilike('client_name', `%${search}%`)
  if (method && method !== 'all') query = query.eq('method', method)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

// POST /api/admin/waivers — manual upload by admin
export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const form            = await req.formData()
  const clientName      = form.get('client_name') as string | null
  const service         = form.get('service') as string | null
  const appointmentDate = form.get('appointment_date') as string | null
  const notes           = form.get('notes') as string | null
  const file            = form.get('file') as File | null

  if (!clientName || !service) {
    return NextResponse.json({ error: 'client_name and service are required' }, { status: 400 })
  }

  const supabase = createServerClient()
  let storagePath: string | null = null

  if (file && file.size > 0) {
    const buffer    = Buffer.from(await file.arrayBuffer())
    const ext       = file.name.split('.').pop() ?? 'pdf'
    const timestamp = Date.now()
    const safeName  = clientName.toLowerCase().replace(/\s+/g, '-')
    storagePath     = `${safeName}-${timestamp}.${ext}`

    const { error: uploadErr } = await supabase.storage
      .from('waivers')
      .upload(storagePath, buffer, { contentType: file.type, upsert: false })

    if (uploadErr) return NextResponse.json({ error: uploadErr.message }, { status: 500 })
  }

  const { data, error } = await supabase
    .from('waivers')
    .insert({
      client_name:      clientName,
      service,
      appointment_date: appointmentDate || null,
      method:           'manual',
      signed_at:        new Date().toISOString(),
      storage_path:     storagePath,
      notes:            notes || null,
    })
    .select()
    .single()

  if (error) {
    // Clean up uploaded file if DB insert fails
    if (storagePath) {
      await supabase.storage.from('waivers').remove([storagePath])
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data, { status: 201 })
}
