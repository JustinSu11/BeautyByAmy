import { createServerClient } from '@/lib/supabase'
import { ServiceTable } from '@/components/admin/service-table'
import type { Service, ServiceCategory } from '@/types/service'

const VALID_CATEGORIES: ServiceCategory[] = ['lashes', 'brows', 'pmu', 'addons']

export default async function ServicesPage() {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('category')
    .order('display_order')

  if (error) throw new Error(`Failed to load services: ${error.message}`)

  const services: Service[] = (data ?? [])
    .filter((row: { category: string }) => VALID_CATEGORIES.includes(row.category as ServiceCategory))
    .map((row: Record<string, unknown>) => ({
      id:          row.id          as string,
      category:    row.category    as ServiceCategory,
      group_label: row.group_label as string | null,
      name:        row.name        as string,
      duration:    row.duration    as string,
      price:       row.price       as string,
      enabled:     row.enabled     as boolean,
    }))

  return (
    <div className="p-8">
      <ServiceTable services={services} />
    </div>
  )
}
