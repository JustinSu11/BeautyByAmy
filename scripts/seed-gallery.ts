/**
 * Seeds the gallery_images table with the 6 existing static gallery photos.
 * Run once:  npx tsx --env-file=.env scripts/seed-gallery.ts
 * Safe to re-run — skips if rows already exist.
 */

import 'dotenv/config'
import * as fs from 'fs'
import * as path from 'path'
import { db } from '../src/db'
import { galleryImages } from '../src/db/schema'
import { uploadImage } from '../src/lib/cloudinary'

const GALLERY_ITEMS = [
  { file: 'gallery-1.jpg', category: 'lashes', label: 'Classic lash extensions',    display_order: 1 },
  { file: 'gallery-2.jpg', category: 'brows',  label: 'Brow lamination',            display_order: 2 },
  { file: 'gallery-3.jpg', category: 'lashes', label: 'Volume lash set',            display_order: 3 },
  { file: 'gallery-4.jpg', category: 'pmu',    label: 'Lip blush',                  display_order: 4 },
  { file: 'gallery-5.jpg', category: 'pmu',    label: 'Microblading healed result', display_order: 5 },
  { file: 'gallery-6.jpg', category: 'other',  label: 'Studio suite',               display_order: 6 },
]

const IMAGES_DIR = path.join(process.cwd(), 'public', 'images')

async function main() {
  const existing = await db.select({ id: galleryImages.id }).from(galleryImages)
  if (existing.length > 0) {
    console.log(`Gallery already has ${existing.length} image(s) — skipping seed.`)
    console.log('Delete rows manually if you want to re-seed.')
    process.exit(0)
  }

  console.log('Seeding gallery images...\n')

  for (const item of GALLERY_ITEMS) {
    const filePath = path.join(IMAGES_DIR, item.file)
    if (!fs.existsSync(filePath)) {
      console.warn(`  ⚠  Skipping ${item.file} — not found`)
      continue
    }

    process.stdout.write(`  Uploading ${item.label} (${item.file})... `)
    const buffer = fs.readFileSync(filePath)
    const { cloudinary_id, url, blur_data_url } = await uploadImage(buffer, 'beautybyamy/gallery')

    await db.insert(galleryImages).values({
      cloudinary_id,
      url,
      blur_data_url,
      category: item.category,
      label: item.label,
      display_order: item.display_order,
    })

    console.log('✓')
  }

  console.log('\nDone.')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
