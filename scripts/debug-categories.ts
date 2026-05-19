/**
 * Debug: print how every Square service is being categorized.
 * Usage: npx tsx --env-file=.env scripts/debug-categories.ts
 */
import { db } from '../src/db'
import { serviceOverrides } from '../src/db/schema'
import { fetchSquareServices } from '../src/lib/square'
import { inferPublicCategory } from '../src/lib/services-data'

async function run() {
  const [services, overrides] = await Promise.all([
    fetchSquareServices(),
    db.select().from(serviceOverrides),
  ])

  const overrideMap = new Map(overrides.map((o) => [o.square_variation_id, o.category]))
  const VALID = new Set(['lashes', 'signature', 'beauty-bar'])

  console.log(`\n${'Service Name'.padEnd(55)} ${'DB Override'.padEnd(18)} ${'inferred'.padEnd(14)} ${'FINAL'}\n${'─'.repeat(110)}`)

  for (const svc of services.sort((a, b) => a.name.localeCompare(b.name))) {
    const dbVal = overrideMap.get(svc.id) ?? '(none)'
    const dbValid = dbVal !== '(none)' && VALID.has(dbVal)
    const inferred = inferPublicCategory(svc.name)
    const final = dbValid ? dbVal : inferred
    const flag = dbVal !== '(none)' && !dbValid ? ' ← STALE' : ''
    console.log(`${svc.name.padEnd(55)} ${dbVal.padEnd(18)} ${inferred.padEnd(14)} ${final}${flag}`)
  }

  console.log(`\nTotal services: ${services.length}`)
  console.log(`Total overrides: ${overrides.length} (${overrides.filter(o => !VALID.has(o.category)).length} stale)`)
}

run().catch(console.error)
