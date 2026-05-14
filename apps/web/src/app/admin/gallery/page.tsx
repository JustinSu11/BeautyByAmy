import { createServerClient } from '@/lib/supabase'
import { GalleryGrid } from '@/components/admin/gallery-grid'

export default async function GalleryAdminPage() {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('gallery_images')
    .select('id, url, category, label')
    .order('display_order')

  if (error) throw new Error(`Failed to load gallery: ${error.message}`)

  return (
    <div className="p-8">
      <GalleryGrid images={data} />
    </div>
  )
}
