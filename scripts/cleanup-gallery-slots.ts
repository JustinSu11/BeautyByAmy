import 'dotenv/config'
import { db } from '../src/db'
import { siteImages } from '../src/db/schema'
import { like } from 'drizzle-orm'

async function main() {
  const deleted = await db
    .delete(siteImages)
    .where(like(siteImages.slot, 'gallery-%'))
    .returning({ slot: siteImages.slot })

  if (deleted.length === 0) {
    console.log('No gallery-* rows in site_images — already clean.')
  } else {
    console.log('Deleted from site_images:', deleted.map((r) => r.slot).join(', '))
  }
  process.exit(0)
}

main().catch((err) => { console.error(err); process.exit(1) })
