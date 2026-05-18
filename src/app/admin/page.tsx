export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { db } from '@/db'
import { galleryImages, announcements, siteImages } from '@/db/schema'
import { fetchSquareServices } from '@/lib/square'
import { ImageIcon, Megaphone, MonitorPlay, Scissors } from 'lucide-react'

async function getStats() {
  const now = new Date()

  const [services, gallery, siteImgs, announcementRows] = await Promise.all([
    fetchSquareServices().catch(() => [] as Awaited<ReturnType<typeof fetchSquareServices>>),
    db.select({ id: galleryImages.id }).from(galleryImages),
    db.select({ id: siteImages.id }).from(siteImages),
    db.select({ id: announcements.id, active: announcements.active, scheduled_for: announcements.scheduled_for })
      .from(announcements),
  ])

  const announcementLive = announcementRows.some(
    (a) => a.active || (a.scheduled_for && a.scheduled_for <= now),
  )

  return {
    services:         services.length,
    galleryImages:    gallery.length,
    siteImages:       siteImgs.length,
    announcementLive,
  }
}

export default async function AdminDashboard() {
  const stats = await getStats()

  const cards = [
    { label: 'Services',           value: stats.services,                         icon: Scissors,   href: '/admin/services'      },
    { label: 'Gallery Images',     value: stats.galleryImages,                    icon: ImageIcon,  href: '/admin/gallery'       },
    { label: 'Site Images Set',    value: `${stats.siteImages} / 5`,              icon: MonitorPlay, href: '/admin/images'       },
    { label: 'Announcement Live',  value: stats.announcementLive ? 'Yes' : 'No',  icon: Megaphone,  href: '/admin/announcements' },
  ]

  return (
    <div className="p-7">
      <h1 className="mb-1 font-serif text-xl font-semibold text-[#2D2D2D]">Dashboard</h1>
      <p className="mb-8 text-sm text-[#6B6B6B]">Welcome back, Amy.</p>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="block rounded-lg border border-[#E8E2DA] bg-white p-5 shadow-sm transition-colors hover:border-[#C9A96E]/40 hover:bg-[#FAF8F5] cursor-pointer"
          >
            <card.icon className="mb-3 h-5 w-5 text-[#C9A96E]" />
            <p className="text-2xl font-bold text-[#2D2D2D]">{card.value}</p>
            <p className="mt-1 text-xs text-[#6B6B6B]">{card.label}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
