import { NextRequest, NextResponse } from 'next/server'
import { fetchAvailableSlotsForDay } from '@/lib/square'

/**
 * GET /api/booking/slots
 * ?serviceVariationId=<id>&year=<YYYY>&month=<0-11>&day=<1-31>
 *
 * Returns time slots available for the given service on the requested date.
 * Each slot has a `time` (HH:mm in business timezone) and `startAt` (UTC ISO
 * string from Square, used directly as the booking startAt payload).
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const serviceVariationId = searchParams.get('serviceVariationId')
  const year = Number(searchParams.get('year'))
  const month = Number(searchParams.get('month'))
  const day = Number(searchParams.get('day'))

  if (
    !serviceVariationId ||
    isNaN(year) || isNaN(month) || isNaN(day) ||
    month < 0 || month > 11 ||
    day < 1 || day > 31
  ) {
    return NextResponse.json({ error: 'Missing or invalid parameters' }, { status: 400 })
  }

  try {
    const slots = await fetchAvailableSlotsForDay(serviceVariationId, year, month, day)
    return NextResponse.json({ slots })
  } catch (err) {
    console.error('[slots] fetchAvailableSlotsForDay failed', err)
    return NextResponse.json({ error: 'Failed to fetch time slots' }, { status: 502 })
  }
}
