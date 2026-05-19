export interface Service {
  id: string
  name: string
  /** Booking-page category: maps to one of the three top-level tabs on /booking */
  category: 'lashes' | 'signature' | 'beauty-bar'
  duration: number // in minutes
  price: number
  /** Square catalog object version — required by the Bookings API for optimistic locking.
   *  Serialized as a string because JSON cannot represent BigInt. */
  variationVersion: string
  /** True for high-investment services (PMU + full lash sets) that require a booking deposit */
  requiresDeposit?: boolean
  /** True for PMU and first-time lash services that require a signed consent waiver */
  requiresWaiver?: boolean
  /** Days a signed waiver remains valid for this service. Only set when requiresWaiver is true. */
  waiverValidityDays?: number
}

export const categories = [
  { id: 'lashes' as const,     label: 'Lash Extensions', icon: 'eye'      },
  { id: 'signature' as const,  label: 'Brows & Lips',    icon: 'sparkles' },
  { id: 'beauty-bar' as const, label: 'Beauty Bar',      icon: 'pencil'   },
]

/**
 * Infer app-specific metadata (category, waiver, deposit) from a service name.
 * Used at runtime in place of the old ID-keyed lookup tables.
 */
export function inferMetadata(
  name: string
): Pick<Service, 'category' | 'requiresWaiver' | 'requiresDeposit' | 'waiverValidityDays'> {
  const n = name.toLowerCase()

  // Beauty Bar: quick treatments — waxes, tints, threading, henna, consultations, patch tests,
  // and correction/add-on services (e.g. "Additional Correction/Touch Up")
  const isBeautyBar = /wax|tint|threading|henna|consultation|patch test|correction/.test(n)

  // Signature Brows & Lips: all PMU services + touch-up appointments, lamination
  const isSignature =
    !isBeautyBar &&
    /ombr[eé]|microblad|microshad|lip blush|brow color refresh|cover.up|touch.?up|lamination/.test(n)

  const category: Service['category'] = isBeautyBar
    ? 'beauty-bar'
    : isSignature
    ? 'signature'
    : 'lashes'

  const isLashSet = category === 'lashes' && !n.includes('removal') && !n.includes('splash')
  const isPMUProcedure = isSignature && !/consultation|patch test/.test(n)
  const requiresWaiver = isLashSet || isPMUProcedure
  const waiverValidityDays = isPMUProcedure ? 730 : isLashSet ? 365 : undefined

  const isFullSet = /\bset\b|microblad|microshad|ombr[eé]|lip blush|cover.up/.test(n)
  const requiresDeposit = (isSignature && isPMUProcedure) || isFullSet

  return { category, requiresWaiver, requiresDeposit, waiverValidityDays }
}

export function getServicesByCategory(services: Service[], category: string): Service[] {
  return services.filter((s) => s.category === category)
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins}min`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}min`
}

export function formatPrice(price: number): string {
  if (price === 0) return 'Varies'
  return `$${price}`
}

// ── Public services page helpers ──────────────────────────────────────────────
// These use the 3-bucket category system the public /services menu uses.

export type PublicCategory = 'lashes' | 'signature' | 'beauty-bar'

/**
 * Map a Square service name to one of the three public menu categories.
 * Amy can override any individual service from the admin panel.
 */
export function inferPublicCategory(name: string): PublicCategory {
  const n = name.toLowerCase()
  // Beauty Bar: quick treatments — waxes, tints, threading, henna, consultations,
  // and correction/add-on services (e.g. "Additional Correction/Touch Up")
  if (/wax|tint|threading|henna|consultation|patch test|correction/.test(n)) return 'beauty-bar'
  // Signature: all PMU brows and lips, touch-up appointments, lamination
  if (/ombr[eé]|microblad|microshad|lip blush|brow color refresh|cover.up|touch.?up|lamination/.test(n)) return 'signature'
  // Default: lash extensions
  return 'lashes'
}

/**
 * Infer the sub-group label shown within a category section (e.g. "Classic",
 * "Volume", "Hybrid" within Lashes). Returns null when no sub-grouping needed.
 */
export function inferGroupLabel(name: string, category: PublicCategory): string | null {
  const n = name.toLowerCase()
  if (category === 'lashes') {
    if (n.startsWith('classic')) return 'Classic'
    if (n.startsWith('volume')) return 'Volume'
    if (n.startsWith('hybrid')) return 'Hybrid'
    return null
  }
  if (category === 'signature') {
    if (/lip blush/.test(n)) return 'Lips'
    if (/brow color refresh|cover.up|touch.?up/.test(n)) return 'Touchups'
    return 'Brows'
  }
  if (category === 'beauty-bar') {
    if (/wax/.test(n)) return 'Waxing'
    if (/tint/.test(n)) return 'Tinting'
    return null
  }
  return null
}

/** Format a duration in minutes as a human-readable string: "2 hrs 30 mins" */
export function formatDurationLong(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins} mins`
  if (mins === 0) return `${hours} ${hours === 1 ? 'hr' : 'hrs'}`
  return `${hours} ${hours === 1 ? 'hr' : 'hrs'} ${mins} mins`
}

/** Format a price in dollars as "$185" or "Price varies" for $0 services */
export function formatPriceDisplay(price: number): string {
  if (price === 0) return 'Price varies'
  return `$${price}`
}

// Simulated availability data
export function getAvailableDates(month: number, year: number): number[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()
  const available: number[] = []

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    // No Sundays, no past dates, simulate some random unavailability
    if (
      date.getDay() !== 0 &&
      date >= new Date(today.getFullYear(), today.getMonth(), today.getDate())
    ) {
      if (date.getDate() % 7 !== 3) {
        available.push(day)
      }
    }
  }
  return available
}

export interface TimeSlot {
  time: string
  label: string
  period: 'morning' | 'afternoon' | 'evening'
}

export function getTimeSlots(): TimeSlot[] {
  return [
    { time: '09:00', label: '9:00 AM', period: 'morning' },
    { time: '09:30', label: '9:30 AM', period: 'morning' },
    { time: '10:00', label: '10:00 AM', period: 'morning' },
    { time: '10:30', label: '10:30 AM', period: 'morning' },
    { time: '11:00', label: '11:00 AM', period: 'morning' },
    { time: '11:30', label: '11:30 AM', period: 'morning' },
    { time: '12:00', label: '12:00 PM', period: 'afternoon' },
    { time: '12:30', label: '12:30 PM', period: 'afternoon' },
    { time: '13:00', label: '1:00 PM', period: 'afternoon' },
    { time: '13:30', label: '1:30 PM', period: 'afternoon' },
    { time: '14:00', label: '2:00 PM', period: 'afternoon' },
    { time: '14:30', label: '2:30 PM', period: 'afternoon' },
    { time: '15:00', label: '3:00 PM', period: 'afternoon' },
    { time: '15:30', label: '3:30 PM', period: 'afternoon' },
    { time: '16:00', label: '4:00 PM', period: 'afternoon' },
    { time: '17:00', label: '5:00 PM', period: 'evening' },
    { time: '17:30', label: '5:30 PM', period: 'evening' },
    { time: '18:00', label: '6:00 PM', period: 'evening' },
    { time: '18:30', label: '6:30 PM', period: 'evening' },
    { time: '19:00', label: '7:00 PM', period: 'evening' },
  ]
}
