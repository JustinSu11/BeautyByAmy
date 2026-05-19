/**
 * One-off migration: remap stale service_overrides category values to the new
 * 3-category system introduced when the categories were restructured.
 *
 * Old names  → New name
 * 'brows'    → 'signature'   (brow services are in Signature Brows & Lips)
 * 'pmu'      → 'signature'   (PMU is in Signature Brows & Lips)
 * 'addons'   → deleted       (ambiguous — inferPublicCategory() re-derives correctly)
 *
 * Safe to run more than once (idempotent).
 *
 * Usage:
 *   npx tsx scripts/migrate-service-categories.ts
 */

import { db } from '../src/db'
import { serviceOverrides } from '../src/db/schema'
import { eq, inArray } from 'drizzle-orm'

async function run() {
  // Remap 'brows' → 'signature'
  const browsResult = await db
    .update(serviceOverrides)
    .set({ category: 'signature', updated_at: new Date() })
    .where(eq(serviceOverrides.category, 'brows'))

  // Remap 'pmu' → 'signature'
  const pmuResult = await db
    .update(serviceOverrides)
    .set({ category: 'signature', updated_at: new Date() })
    .where(eq(serviceOverrides.category, 'pmu'))

  // Delete 'addons' — inferPublicCategory() will re-derive the right category
  const addonsResult = await db
    .delete(serviceOverrides)
    .where(eq(serviceOverrides.category, 'addons'))

  console.log('Migration complete:')
  console.log(`  brows → signature: ${JSON.stringify(browsResult)}`)
  console.log(`  pmu   → signature: ${JSON.stringify(pmuResult)}`)
  console.log(`  addons deleted:    ${JSON.stringify(addonsResult)}`)
}

run().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
