export const dynamic = 'force-dynamic'

import { db } from '@/db'
import { adminServices } from '@/db/schema'
import { ServiceTable } from '@/components/admin/service-table'
import type { Service } from '@/types/service'

export default async function ServicesPage() {
  const rows = await db
    .select()
    .from(adminServices)
    .orderBy(adminServices.category, adminServices.display_order)

  // Drizzle infers `category` as `string`; cast to the narrower Service type
  // which the table components and API routes expect.
  const services = rows as Service[]

  return (
    <div className="p-7">
      <ServiceTable services={services} />
    </div>
  )
}
