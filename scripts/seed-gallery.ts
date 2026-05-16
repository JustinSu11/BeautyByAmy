import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const rows = [
  { cloudinary_id: 'local-1', url: '/images/gallery-1.jpg', blur_data_url: null, category: 'Lash Extensions',  label: 'Classic Set',        display_order: 1 },
  { cloudinary_id: 'local-2', url: '/images/gallery-2.jpg', blur_data_url: null, category: 'Brow Services',    label: 'Brow Lamination',    display_order: 2 },
  { cloudinary_id: 'local-3', url: '/images/gallery-3.jpg', blur_data_url: null, category: 'Lash Extensions',  label: 'Volume Set',         display_order: 3 },
  { cloudinary_id: 'local-4', url: '/images/gallery-4.jpg', blur_data_url: null, category: 'Permanent Makeup', label: 'Lip Blush',          display_order: 4 },
  { cloudinary_id: 'local-5', url: '/images/gallery-5.jpg', blur_data_url: null, category: 'Permanent Makeup', label: 'Microblading',       display_order: 5 },
  { cloudinary_id: 'local-6', url: '/images/gallery-6.jpg', blur_data_url: null, category: 'Our Studio',       label: 'BeautyByAmy Studio', display_order: 6 },
]

async function seed() {
  const { error } = await supabase.from('gallery_images').insert(rows)
  if (error) { console.error(error); process.exit(1) }
  console.log(`Seeded ${rows.length} gallery images.`)
}

seed()
