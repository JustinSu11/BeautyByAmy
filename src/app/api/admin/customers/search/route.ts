import { auth } from '@/lib/auth'
import { searchSquareCustomersByName } from '@/lib/square'
import { NextResponse } from 'next/server'

// GET /api/admin/customers/search?q=jane
// Returns Square customers whose name matches the query (partial, case-insensitive).
export async function GET(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const q = new URL(req.url).searchParams.get('q') ?? ''
  if (q.trim().length < 2) return NextResponse.json([])

  const results = await searchSquareCustomersByName(q).catch(() => [])
  return NextResponse.json(results)
}
