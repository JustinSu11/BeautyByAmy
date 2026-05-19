import { NextRequest, NextResponse } from 'next/server'
import { fetchAvailableDaysInMonth } from '@/lib/square'

/**
 * GET /api/booking/availability
 * ?serviceVariationId=<id>&year=<YYYY>&month=<0-11>
 *
 * Returns the set of day numbers (1–31) that have at least one bookable slot
 * for the given service variation in the requested calendar month.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const serviceVariationId = searchParams.get('serviceVariationId')
  const year = Number(searchParams.get('year'))
  const month = Number(searchParams.get('month'))

  if (!serviceVariationId || isNaN(year) || isNaN(month) || month < 0 || month > 11) {
    return NextResponse.json({ error: 'Missing or invalid parameters' }, { status: 400 })
  }

  try {
    const availableDays = await fetchAvailableDaysInMonth(serviceVariationId, year, month)
    return NextResponse.json({ availableDays })
  } catch (err) {
    console.error('[availability] fetchAvailableDaysInMonth failed', err)
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 502 })
  }
}
