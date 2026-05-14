import { auth } from '@/lib/auth'
import { db } from '@/db'
import { waivers, manualWaivers, customers } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { uploadFile, deleteFile } from '@/lib/cloudinary'
import { NextResponse } from 'next/server'

// Shape returned to the frontend for both digital and manual waivers
type WaiverRow = {
  id:               string
  client_name:      string
  service:          string
  appointment_date: string | null
  method:           'digital' | 'manual'
  signed_at:        string | null
  notes:            string | null
}

// GET /api/admin/waivers?search=jane&method=manual
export async function GET(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const search = (searchParams.get('search') ?? '').toLowerCase()
  const method = searchParams.get('method') ?? 'all'

  // Digital waivers — join customers to get the client name
  const digitalRows = await db
    .select({
      id:        waivers.id,
      name:      customers.name,
      version:   waivers.waiverVersion,
      signed_at: waivers.signedAt,
    })
    .from(waivers)
    .innerJoin(customers, eq(customers.id, waivers.customerId))

  // Admin-uploaded manual waivers
  const manualRows = await db.select().from(manualWaivers)

  // Merge into unified shape
  const merged: WaiverRow[] = [
    ...digitalRows.map((r) => ({
      id:               r.id,
      client_name:      r.name,
      service:          `Waiver ${r.version}`,
      appointment_date: null as string | null,
      method:           'digital' as const,
      signed_at:        r.signed_at?.toISOString() ?? null,
      notes:            null as string | null,
    })),
    ...manualRows.map((r) => ({
      id:               r.id,
      client_name:      r.client_name,
      service:          r.service,
      appointment_date: r.appointment_date?.toISOString().split('T')[0] ?? null,
      method:           'manual' as const,
      signed_at:        r.signed_at?.toISOString() ?? null,
      notes:            r.notes ?? null,
    })),
  ]

  // Filter
  const filtered = merged.filter((w) => {
    if (search && !w.client_name.toLowerCase().includes(search)) return false
    if (method && method !== 'all' && w.method !== method) return false
    return true
  })

  // Sort newest first
  filtered.sort((a, b) => (b.signed_at ?? '').localeCompare(a.signed_at ?? ''))

  return NextResponse.json(filtered)
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

  let cloudinary_id:  string | null = null
  let cloudinary_url: string | null = null

  if (file && file.size > 0) {
    const buffer    = Buffer.from(await file.arrayBuffer())
    const ext       = file.name.split('.').pop() ?? 'pdf'
    const timestamp = Date.now()
    const safeName  = clientName.toLowerCase().replace(/\s+/g, '-')
    const filename  = `waivers/${safeName}-${timestamp}.${ext}`

    try {
      const result    = await uploadFile(buffer, 'beautybyamy', filename)
      cloudinary_id   = result.cloudinary_id
      cloudinary_url  = result.url
    } catch {
      return NextResponse.json({ error: 'File upload failed' }, { status: 500 })
    }
  }

  const [row] = await db
    .insert(manualWaivers)
    .values({
      client_name:      clientName,
      service,
      appointment_date: appointmentDate ? new Date(appointmentDate) : null,
      cloudinary_id,
      cloudinary_url,
      notes:            notes || null,
    })
    .returning()

  if (!row) {
    // Clean up uploaded file if DB insert fails
    if (cloudinary_id) await deleteFile(cloudinary_id).catch(() => null)
    return NextResponse.json({ error: 'Failed to save waiver record' }, { status: 500 })
  }
  return NextResponse.json(row, { status: 201 })
}
