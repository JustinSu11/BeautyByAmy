// apps/web/src/tests/auth.test.ts
import { describe, it, expect } from 'vitest'
import { generateOtp, isOtpExpired, CURRENT_WAIVER_VERSION } from '@/lib/auth'

describe('generateOtp', () => {
  it('generates a 6-digit numeric string', () => {
    expect(generateOtp()).toMatch(/^\d{6}$/)
  })

  it('produces different values on successive calls', () => {
    const results = new Set(Array.from({ length: 10 }, () => generateOtp()))
    expect(results.size).toBeGreaterThan(1)
  })
})

describe('isOtpExpired', () => {
  it('returns false when expiry is in the future', () => {
    expect(isOtpExpired(new Date(Date.now() + 60_000))).toBe(false)
  })

  it('returns true when expiry has already passed', () => {
    expect(isOtpExpired(new Date(Date.now() - 1))).toBe(true)
  })
})

describe('CURRENT_WAIVER_VERSION', () => {
  it('matches YYYY-MM-DD format', () => {
    expect(CURRENT_WAIVER_VERSION).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
