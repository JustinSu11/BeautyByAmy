/**
 * Uploads the existing static site images to Cloudinary and seeds the
 * site_images table so the admin panel reflects them correctly.
 *
 * Run once:
 *   npx tsx scripts/seed-site-images.ts
 *
 * Safe to re-run — uses upsert so existing rows are updated, not duplicated.
 */

import * as fs from 'fs'
import * as path from 'path'
import { db } from '../src/db'
import { siteImages } from '../src/db/schema'
import { uploadImage } from '../src/lib/cloudinary'

const SLOTS: Array<{ slot: string; file: string; alt: string }> = [
  { slot: 'hero',      file: 'hero-bg.jpg',      alt: 'Hero background'          },
  { slot: 'meet-amy',  file: 'amy-portrait.jpg',  alt: "Amy's portrait"           },
  { slot: 'gallery-1', file: 'gallery-1.jpg',     alt: 'Gallery image 1'          },
  { slot: 'gallery-2', file: 'gallery-2.jpg',     alt: 'Gallery image 2'          },
  { slot: 'gallery-3', file: 'gallery-3.jpg',     alt: 'Gallery image 3'          },
  { slot: 'gallery-4', file: 'gallery-4.jpg',     alt: 'Gallery image 4'          },
  { slot: 'gallery-5', file: 'gallery-5.jpg',     alt: 'Gallery image 5'          },
  { slot: 'gallery-6', file: 'gallery-6.jpg',     alt: 'Gallery image 6'          },
]

const IMAGES_DIR = path.join(process.cwd(), 'public', 'images')

async function main() {
  console.log('Seeding site images...\n')

  for (const { slot, file, alt } of SLOTS) {
    const filePath = path.join(IMAGES_DIR, file)

    if (!fs.existsSync(filePath)) {
      console.warn(`  ⚠  Skipping ${slot} — file not found: ${filePath}`)
      continue
    }

    process.stdout.write(`  Uploading ${slot} (${file})... `)
    const buffer = fs.readFileSync(filePath)
    const { cloudinary_id, url, blur_data_url } = await uploadImage(buffer, `beautybyamy/site/${slot}`)

    await db
      .insert(siteImages)
      .values({ slot, cloudinary_id, url, blur_data_url, alt })
      .onConflictDoUpdate({
        target: siteImages.slot,
        set: { cloudinary_id, url, blur_data_url, alt },
      })

    console.log(`✓  ${url}`)
  }

  console.log('\nDone.')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
