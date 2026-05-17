export interface Service {
  id: string
  name: string
  category: 'eyelashes' | 'brows' | 'permanent-makeup'
  duration: number // in minutes
  price: number
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

/**
 * Infer app-specific metadata (category, waiver, deposit) from a service name.
 * Used at runtime in place of the old ID-keyed lookup tables.
 */
export function inferMetadata(
  name: string
): Pick<Service, 'category' | 'requiresWaiver' | 'requiresDeposit' | 'waiverValidityDays'> {
  const n = name.toLowerCase()

  const isPMU =
    /ombr[eé]|microblad|microshad|lip blush|pmu|brow color refresh|cover.up|correction|consultation|patch test/.test(n)
  const isBrows = /brow (tint|wax)|chin wax/.test(n)
  const category: Service['category'] = isPMU ? 'permanent-makeup' : isBrows ? 'brows' : 'eyelashes'

  const isLash = category === 'eyelashes' && !n.includes('removal') && !n.includes('splash')
  const isPMUProcedure = isPMU && !/consultation|patch test/.test(n)
  const requiresWaiver = isLash || isPMUProcedure
  const waiverValidityDays = isPMUProcedure ? 730 : isLash ? 365 : undefined

  const isFullSet = /\bset\b|microblad|microshad|ombr[eé]|lip blush|cover.up/.test(n)
  const requiresDeposit = isPMU || isFullSet

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
