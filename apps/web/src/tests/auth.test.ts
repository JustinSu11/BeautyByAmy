import { describe, it, expect } from 'vitest'
import { CURRENT_WAIVER_VERSION } from '@/lib/auth'

describe('CURRENT_WAIVER_VERSION', () => {
  it('matches YYYY-MM-DD format', () => {
    expect(CURRENT_WAIVER_VERSION).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
