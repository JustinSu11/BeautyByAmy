/**
 * Uploads the 5 site images to Cloudinary and seeds the site_images table
 * so the admin panel reflects them correctly.
 *
 * For local dev:
 *   npx tsx scripts/seed-site-images.ts
 *
 * For production (override only the DB URL; Cloudinary creds come from .env):
 *   DATABASE_URL="<production-neon-url>" npx tsx scripts/seed-site-images.ts
 *
 * Safe to re-run — upserts by slot so existing rows are updated, not duplicated.
 */

import 'dotenv/config'
import * as fs from 'fs'
import * as path from 'path'
import { db } from '../src/db'
import { siteImages } from '../src/db/schema'
import { uploadImage } from '../src/lib/cloudinary'

// Only the 5 slots actually used by the site (hero, meet-amy, and 3 service cards).
// Gallery images are managed separately through the admin panel.
const SLOTS: Array<{ slot: string; file: string; alt: string }> = [
  { slot: 'hero',           file: 'hero-bg.jpg',        alt: 'Hero background'         },
  { slot: 'meet-amy',       file: 'amy-portrait.jpg',   alt: "Amy Le portrait"         },
  { slot: 'service-lashes', file: 'service-lashes.jpg', alt: 'Lash extensions service' },
  { slot: 'service-brows',  file: 'service-brows.jpg',  alt: 'Brow services'           },
  { slot: 'service-pmu',    file: 'service-pmu.jpg',    alt: 'Permanent makeup service'},
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
