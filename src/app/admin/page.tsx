import Link from 'next/link'
import { db } from '@/db'
import { adminServices, galleryImages, announcements } from '@/db/schema'
import { Scissors, ImageIcon, Megaphone, ToggleRight } from 'lucide-react'

async function getStats() {
  const [services, gallery, announcementRows] = await Promise.all([
    db.select({ id: adminServices.id, enabled: adminServices.enabled }).from(adminServices),
    db.select({ id: galleryImages.id }).from(galleryImages),
    db.select({ id: announcements.id, active: announcements.active }).from(announcements),
  ])

  return {
    totalServices:      services.length,
    activeServices:     services.filter((s) => s.enabled).length,
    galleryImages:      gallery.length,
    activeAnnouncement: announcementRows.some((a) => a.active),
  }
}

export default async function AdminDashboard() {
  const stats = await getStats()

  const cards = [
    { label: 'Total Services',    value: stats.totalServices,                     icon: Scissors,    href: '/admin/services'      },
    { label: 'Active Services',   value: stats.activeServices,                    icon: ToggleRight, href: '/admin/services'      },
    { label: 'Gallery Images',    value: stats.galleryImages,                     icon: ImageIcon,   href: '/admin/gallery'       },
    { label: 'Announcement Live', value: stats.activeAnnouncement ? 'Yes' : 'No', icon: Megaphone,  href: '/admin/announcements' },
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
