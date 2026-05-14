import Link from 'next/link'
import { createServerClient } from '@/lib/supabase'
import { Scissors, ImageIcon, Megaphone, ToggleRight } from 'lucide-react'

async function getStats() {
  const supabase = createServerClient()
  const [services, gallery, announcements] = await Promise.all([
    supabase.from('services').select('id, enabled'),
    supabase.from('gallery_images').select('id'),
    supabase.from('announcements').select('id, active'),
  ])
  if (services.error) throw new Error(`services query failed: ${services.error.message}`)
  if (gallery.error)  throw new Error(`gallery query failed: ${gallery.error.message}`)
  if (announcements.error) throw new Error(`announcements query failed: ${announcements.error.message}`)

  return {
    totalServices:      services.data.length,
    activeServices:     services.data.filter((s: { enabled: boolean }) => s.enabled).length,
    galleryImages:      gallery.data.length,
    activeAnnouncement: announcements.data.some((a: { active: boolean }) => a.active),
  }
}

export default async function AdminDashboard() {
  const stats = await getStats()

  const cards = [
    { label: 'Total Services',    value: stats.totalServices,                    icon: Scissors,    href: '/admin/services'       },
    { label: 'Active Services',   value: stats.activeServices,                   icon: ToggleRight, href: '/admin/services'       },
    { label: 'Gallery Images',    value: stats.galleryImages,                    icon: ImageIcon,   href: '/admin/gallery'        },
    { label: 'Announcement Live', value: stats.activeAnnouncement ? 'Yes' : 'No', icon: Megaphone,  href: '/admin/announcements'  },
  ]

  return (
    <div className="p-8">
      <h1 className="mb-1 font-serif text-2xl text-white">Dashboard</h1>
      <p className="mb-8 text-sm text-white/40">Welcome back, Amy.</p>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-xl border border-white/10 bg-white/5 p-5 transition hover:border-[#C9A96E]/40 cursor-pointer"
          >
            <card.icon className="mb-3 h-5 w-5 text-[#C9A96E]" />
            <p className="text-2xl font-semibold text-white">{card.value}</p>
            <p className="mt-1 text-xs text-white/40">{card.label}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
