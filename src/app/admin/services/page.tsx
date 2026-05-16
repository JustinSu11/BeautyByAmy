import { db } from '@/db'
import { adminServices } from '@/db/schema'
import { ServiceTable } from '@/components/admin/service-table'
import type { Service, ServiceCategory } from '@/types/service'

const VALID_CATEGORIES: ServiceCategory[] = ['lashes', 'brows', 'pmu', 'addons']

export default async function ServicesPage() {
  const data = await db
    .select()
    .from(adminServices)
    .orderBy(adminServices.category, adminServices.display_order)

  const services: Service[] = data
    .filter((row) => VALID_CATEGORIES.includes(row.category as ServiceCategory))
    .map((row) => ({
      id:          row.id,
      category:    row.category as ServiceCategory,
      group_label: row.group_label ?? null,
      name:        row.name,
      duration:    row.duration,
      price:       row.price,
      enabled:     row.enabled,
    }))

  return (
    <div className="p-8">
      <ServiceTable services={services} />
    </div>
  )
}
