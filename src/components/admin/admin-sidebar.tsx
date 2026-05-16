'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Scissors,
  ImageIcon,
  Megaphone,
  MonitorPlay,
  FileText,
  LogOut,
} from 'lucide-react'

const navItems = [
  { href: '/admin',               label: 'Dashboard',     icon: LayoutDashboard },
  { href: '/admin/services',      label: 'Services',      icon: Scissors        },
  { href: '/admin/gallery',       label: 'Gallery',       icon: ImageIcon       },
  { href: '/admin/announcements', label: 'Announcements', icon: Megaphone       },
  { href: '/admin/images',        label: 'Site Images',   icon: MonitorPlay     },
  { href: '/admin/waivers',       label: 'Waivers',       icon: FileText        },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-screen w-56 shrink-0 flex-col border-r border-white/10 bg-[#111111]">
      {/* Brand */}
      <div className="border-b border-white/10 px-5 py-5">
        <p className="font-serif text-lg text-white">BeautyByAmy</p>
        <p className="text-[10px] uppercase tracking-widest text-white/30">Admin</p>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        {navItems.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors cursor-pointer',
                active
                  ? 'bg-[#C9A96E]/15 text-[#C9A96E]'
                  : 'text-white/50 hover:bg-white/5 hover:text-white/80',
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Sign out */}
      <div className="border-t border-white/10 px-3 py-4">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/40 transition-colors hover:bg-white/5 hover:text-white/70 cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
