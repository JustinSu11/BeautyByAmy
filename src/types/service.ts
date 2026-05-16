export type ServiceCategory = 'lashes' | 'brows' | 'pmu' | 'addons'

export type Service = {
  id: string
  category: ServiceCategory
  group_label: string | null
  name: string
  duration: string
  price: string
  enabled: boolean
}
