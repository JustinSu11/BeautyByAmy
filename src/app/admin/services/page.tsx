export const dynamic = 'force-dynamic'

import { db } from '@/db'
import { serviceOverrides } from '@/db/schema'
import { fetchSquareServices } from '@/lib/square'
import { ServiceCategoryTable } from '@/components/admin/service-category-table'
import type { PublicCategory } from '@/lib/services-data'

export default async function ServicesPage() {
  const [services, overrides] = await Promise.all([
    fetchSquareServices().catch(() => []),
    db.select().from(serviceOverrides).catch(() => []),
  ])

  // Build the override map the client component needs: variationId → category
  const overrideMap = Object.fromEntries(
    overrides.map((o) => [o.square_variation_id, o.category as PublicCategory]),
  )

  return (
    <div className="p-4 sm:p-7">
      <ServiceCategoryTable services={services} overrides={overrideMap} />
    </div>
  )
}
