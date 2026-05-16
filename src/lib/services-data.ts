import { SERVICES as RAW_SERVICES } from '@/data/services'

export interface Service {
  id: string
  name: string
  category: 'eyelashes' | 'brows' | 'permanent-makeup'
  duration: number // in minutes
  price: number
  description?: string
  /** True for high-investment services (PMU + full lash sets) that require a booking deposit */
  requiresDeposit?: boolean
  /** True for PMU and first-time lash services that require a signed consent waiver */
  requiresWaiver?: boolean
  /** Days a signed waiver remains valid for this service. Only set when requiresWaiver is true. */
  waiverValidityDays?: number
}

export const categories = [
  { id: 'eyelashes' as const, label: 'Eyelashes', icon: 'eye' },
  { id: 'brows' as const, label: 'Brows', icon: 'pencil' },
  { id: 'permanent-makeup' as const, label: 'Permanent Makeup', icon: 'sparkles' },
]

/** Parse duration strings like '1 hr 30 mins', '2 hrs', '45 mins' → minutes */
function parseDuration(time: string): number {
  const hrMatch = time.match(/(\d+)\s*hr/)
  const minMatch = time.match(/(\d+)\s*min/)
  const hours = hrMatch ? parseInt(hrMatch[1]) : 0
  const mins = minMatch ? parseInt(minMatch[1]) : 0
  return hours * 60 + mins
}

/** Map existing service IDs to the v0 category structure */
const CATEGORY_MAP: Record<string, Service['category']> = {
  service1: 'eyelashes',   // Touch Up
  service2: 'eyelashes',   // Volume Set
  service3: 'eyelashes',   // Volume 7-14 days
  service4: 'eyelashes',   // Volume 15-21 days
  service5: 'eyelashes',   // Volume 22-28 days
  service6: 'permanent-makeup', // PMU consultation
  service7: 'permanent-makeup', // Patch test
  service8: 'permanent-makeup', // Ombré
  service9: 'permanent-makeup', // Microshading Cover-Up
  service10: 'permanent-makeup', // Lip blush
  service11: 'eyelashes',   // Lash removal
  service12: 'permanent-makeup', // Microblading
  service13: 'permanent-makeup', // Microshading
  service14: 'permanent-makeup', // Ombré Cover-Up
  service15: 'eyelashes',   // Hybrid Set
  service16: 'eyelashes',   // Hybrid 7-14 days
  service17: 'eyelashes',   // Hybrid 15-21 days
  service18: 'eyelashes',   // Hybrid 22-28 days
  service19: 'permanent-makeup', // Cover-Up with Correction
  service20: 'eyelashes',   // Color Splash-Ins
  service21: 'permanent-makeup', // Brow Color Refresh 6mo–1yr
  service22: 'permanent-makeup', // Brow Color Refresh 12–20mo
  service23: 'permanent-makeup', // Brow Color Refresh 8wk–6mo
  service24: 'brows',        // Brow Tint
  service25: 'brows',        // Brow wax
  service26: 'brows',        // Chin wax
  service27: 'eyelashes',   // Classic Set
  service28: 'eyelashes',   // Classic 7-14 days
  service29: 'eyelashes',   // Classic 15-21 days
  service30: 'eyelashes',   // Classic 22-28 days
  service31: 'permanent-makeup', // Additional Correction/Touch Up
}

/**
 * Services that require a deposit to secure the booking.
 * - All permanent makeup (long, expensive, pigment/technique investment)
 * - Full initial lash sets (2h+ appointments; fills do not require a deposit)
 */
const DEPOSIT_REQUIRED = new Set([
  // Permanent Makeup — all PMU services
  'service6',  // PMU consultation
  'service7',  // Patch test
  'service8',  // Ombré
  'service9',  // Microshading Cover-Up
  'service10', // Lip blush
  'service12', // Microblading
  'service13', // Microshading
  'service14', // Ombré Cover-Up
  'service19', // Cover-Up with Correction
  'service21', // Brow Color Refresh 6mo–1yr
  'service22', // Brow Color Refresh 12–20mo
  'service23', // Brow Color Refresh 8wk–6mo
  'service31', // Additional Correction/Touch Up
  // Full initial lash sets
  'service2',  // Volume Set
  'service15', // Hybrid Set
  'service27', // Classic Set
])

/** Services that require a signed consent waiver before the appointment */
const WAIVER_REQUIRED = new Set([
  // Permanent Makeup — all pigment/technique services (not consultation or patch test)
  'service8',  // Ombré
  'service9',  // Microshading Cover-Up
  'service10', // Lip blush
  'service12', // Microblading
  'service13', // Microshading
  'service14', // Ombré Cover-Up
  'service19', // Cover-Up with Correction
  'service21', // Brow Color Refresh 6mo–1yr
  'service22', // Brow Color Refresh 12–20mo
  'service23', // Brow Color Refresh 8wk–6mo
  'service31', // Additional Correction/Touch Up
  // Lash extensions and lifts — all sets and fills
  'service1',  // Touch Up
  'service2',  // Volume Set
  'service3',  // Volume 7-14 days
  'service4',  // Volume 15-21 days
  'service5',  // Volume 22-28 days
  'service15', // Hybrid Set
  'service16', // Hybrid 7-14 days
  'service17', // Hybrid 15-21 days
  'service18', // Hybrid 22-28 days
  'service20', // Color Splash-Ins
  'service27', // Classic Set
  'service28', // Classic 7-14 days
  'service29', // Classic 15-21 days
  'service30', // Classic 22-28 days
])

/**
 * How long a signed waiver is valid for each service (in days).
 * Lash services renew annually; PMU waivers cover the full touch-up cycle.
 */
const WAIVER_VALIDITY_DAYS: Record<string, number> = {
  // Lash services — 1 year
  'service1': 365, 'service2': 365, 'service3': 365, 'service4': 365, 'service5': 365,
  'service15': 365, 'service16': 365, 'service17': 365, 'service18': 365,
  'service20': 365, 'service27': 365, 'service28': 365, 'service29': 365, 'service30': 365,
  // PMU services — 2 years
  'service8': 730, 'service9': 730, 'service10': 730, 'service12': 730, 'service13': 730,
  'service14': 730, 'service19': 730, 'service21': 730, 'service22': 730,
  'service23': 730, 'service31': 730,
}

export const services: Service[] = RAW_SERVICES.map((s) => ({
  id: s.id,
  name: s.name,
  category: CATEGORY_MAP[s.id] ?? 'eyelashes',
  duration: parseDuration(s.time),
  price: typeof s.price === 'string' ? 0 : s.price,
  requiresDeposit: DEPOSIT_REQUIRED.has(s.id),
  requiresWaiver: WAIVER_REQUIRED.has(s.id),
  waiverValidityDays: WAIVER_VALIDITY_DAYS[s.id],
}))

export function getServicesByCategory(category: string): Service[] {
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
