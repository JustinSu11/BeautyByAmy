/**
 * seed-waiver-test.mjs
 *
 * Creates a fake customer + booking + waiver token so you can preview
 * the waiver wizard in the browser without needing a real Square booking.
 *
 * Usage (run from repo root):
 *   node apps/web/seed-waiver-test.mjs [lash|pmu|reconsent]
 *
 * Defaults to "lash" if no argument is given.
 * Prints a clickable waiver URL when done.
 */

import fs from 'fs'
import crypto from 'crypto'

// ── Read .env ─────────────────────────────────────────────────────────────────
const env = fs.readFileSync('.env', 'utf8')
const vars = {}
env.split('\n').forEach((line) => {
  const m = line.match(/^([^#=]+)=(.*)$/)
  if (m) vars[m[1].trim()] = m[2].trim()
})

const { neon } = await import('@neondatabase/serverless')
const sql = neon(vars.DATABASE_URL)

// ── Args ──────────────────────────────────────────────────────────────────────
const type = process.argv[2] ?? 'lash'
if (!['lash', 'pmu', 'reconsent'].includes(type)) {
  console.error('Usage: node apps/web/seed-waiver-test.mjs [lash|pmu|reconsent]')
  process.exit(1)
}

// Service IDs mapped to each waiver type (from services-data.ts / CATEGORY_MAP)
const SERVICE_MAP = {
  lash:      'service2',  // Volume Set — eyelashes category
  pmu:       'service8',  // Ombré Powder — permanent-makeup category
  reconsent: 'service8',  // Same PMU service; prior waiver triggers re-consent
}
const serviceId = SERVICE_MAP[type]

// ── Helpers ───────────────────────────────────────────────────────────────────
const uuid = () => crypto.randomUUID()

// ── Create test records ───────────────────────────────────────────────────────

// 1. Customer — upsert by email so re-running the script is safe
const TEST_EMAIL = 'test-waiver@beautybyamy.dev'
const existing = await sql`SELECT id FROM customers WHERE email = ${TEST_EMAIL}`

let customerId
if (existing.length > 0) {
  customerId = existing[0].id
  console.log('✓ Reusing existing test customer:', customerId)
} else {
  customerId = uuid()
  const squareId = 'test-sq-' + customerId.slice(0, 8)
  await sql`
    INSERT INTO customers (id, square_customer_id, email, name, phone)
    VALUES (${customerId}, ${squareId}, ${TEST_EMAIL}, 'Jane Testclient', '(555) 867-5309')
  `
  console.log('✓ Created test customer:', customerId)
}

// 2. For reconsent — ensure a prior signed PMU waiver exists for this customer
if (type === 'reconsent') {
  const prior = await sql`SELECT id FROM waivers WHERE customer_id = ${customerId} LIMIT 1`
  if (prior.length === 0) {
    const priorId = uuid()
    const expiry  = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    await sql`
      INSERT INTO waivers (id, customer_id, waiver_version, waiver_type, expires_at)
      VALUES (${priorId}, ${customerId}, '2025-01-01', 'pmu', ${expiry}::timestamptz)
    `
    console.log('✓ Created prior PMU waiver → will show re-consent form')
  } else {
    console.log('✓ Prior waiver already exists → will show re-consent form')
  }
}

// 3. Booking — one week from now
const bookingId  = uuid()
const squareBkId = 'test-bk-' + bookingId.slice(0, 8)
const startsAt   = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
await sql`
  INSERT INTO bookings (id, square_booking_id, customer_id, service_id, starts_at, requires_waiver)
  VALUES (${bookingId}, ${squareBkId}, ${customerId}, ${serviceId}, ${startsAt}::timestamptz, true)
`
console.log('✓ Created test booking:', bookingId)

// 4. Waiver token — expires in 7 days
const token     = uuid()
const tokenId   = uuid()
const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
await sql`
  INSERT INTO waiver_tokens (id, token, customer_id, booking_id, expires_at)
  VALUES (${tokenId}, ${token}, ${customerId}, ${bookingId}, ${expiresAt}::timestamptz)
`
console.log('✓ Created waiver token')

// ── Print the URL ─────────────────────────────────────────────────────────────
const baseUrl = vars.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') ?? 'http://localhost:3000'
const url = `${baseUrl}/waiver?token=${token}`

console.log('\n─────────────────────────────────────────────────')
console.log(`Form type : ${type.toUpperCase()}`)
console.log(`Client    : Jane Testclient`)
console.log(`Service   : ${type === 'lash' ? 'Volume Lash Set' : 'Ombré Powder Brows'}`)
console.log(`\nOpen in your browser:\n`)
console.log(`  ${url}`)
console.log('\n─────────────────────────────────────────────────')
console.log('Token is valid for 7 days.\n')
