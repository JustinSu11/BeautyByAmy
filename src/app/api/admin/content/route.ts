import { auth } from '@/lib/auth'
import { db } from '@/db'
import { siteContent } from '@/db/schema'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { CONTENT_DEFAULTS, CONTENT_LABELS, getAllSiteContent } from '@/lib/site-content'

/**
 * GET /api/admin/content
 * Returns all content keys with their current values (DB override or default).
 */
export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const merged = await getAllSiteContent()

  const result = Object.keys(CONTENT_DEFAULTS).map((key) => ({
    key,
    value: merged[key] ?? '',
    label: CONTENT_LABELS[key] ?? key,
    isDefault: merged[key] === CONTENT_DEFAULTS[key],
  }))

  return NextResponse.json(result)
}

const patchSchema = z.object({
  key:   z.string().min(1),
  value: z.string(),
})

/**
 * PATCH /api/admin/content
 * Upsert a single content value. Validates the key exists in CONTENT_DEFAULTS.
 */
export async function PATCH(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { key, value } = parsed.data

  if (!(key in CONTENT_DEFAULTS)) {
    return NextResponse.json({ error: 'Unknown content key' }, { status: 400 })
  }

  const label = CONTENT_LABELS[key] ?? key

  await db
    .insert(siteContent)
    .values({ content_key: key, value, label })
    .onConflictDoUpdate({
      target: siteContent.content_key,
      set: { value, updated_at: new Date() },
    })

  return NextResponse.json({ ok: true })
}
