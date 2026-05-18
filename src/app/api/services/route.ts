import { NextResponse } from 'next/server'
import { fetchSquareServices } from '@/lib/square'

export const revalidate = 3600 // re-fetch from Square at most once per hour

export async function GET() {
  try {
    const services = await fetchSquareServices()
    return NextResponse.json(services)
  } catch (err) {
    console.error('[api/services] Failed to fetch from Square:', err)
    return NextResponse.json({ error: 'Failed to load services' }, { status: 500 })
  }
}
