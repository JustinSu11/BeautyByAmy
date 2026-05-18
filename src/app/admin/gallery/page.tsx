import { db } from '@/db'
import { galleryImages } from '@/db/schema'
import { GalleryGrid } from '@/components/admin/gallery-grid'

export default async function GalleryAdminPage() {
  const data = await db
    .select({ id: galleryImages.id, url: galleryImages.url, before_url: galleryImages.before_url, category: galleryImages.category, label: galleryImages.label })
    .from(galleryImages)
    .orderBy(galleryImages.display_order)

  return (
    <div className="p-7">
      <GalleryGrid images={data} />
    </div>
  )
}
