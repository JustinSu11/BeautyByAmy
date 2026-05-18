'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  ImageIcon,
  Megaphone,
  MonitorPlay,
  FileText,
  LogOut,
} from 'lucide-react'

const navGroups = [
  {
    label: 'Content',
    items: [
      { href: '/admin',               label: 'Dashboard',     icon: LayoutDashboard },
      { href: '/admin/gallery',       label: 'Gallery',       icon: ImageIcon       },
      { href: '/admin/announcements', label: 'Announcements', icon: Megaphone       },
    ],
  },
  {
    label: 'Media',
    items: [
      { href: '/admin/images', label: 'Site Images', icon: MonitorPlay },
    ],
  },
  {
    label: 'Records',
    items: [
      { href: '/admin/waivers', label: 'Waivers', icon: FileText },
    ],
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-screen w-56 shrink-0 flex-col border-r border-[#E8E2DA] bg-white">
      {/* Brand */}
      <div className="border-b border-[#E8E2DA] px-5 py-5 flex items-center gap-2.5">
        <p className="font-serif text-[13px] font-semibold tracking-wide text-[#A68B4E]">BeautyByAmy</p>
        <span className="rounded-full border border-[#C9A96E]/35 bg-[#C9A96E]/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-[#C9A96E]">
          Admin
        </span>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col px-2.5 py-3 overflow-y-auto gap-0">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-2.5 pt-4 pb-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-[#6B6B6B]">
              {group.label}
            </p>
            {group.items.map((item) => {
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2.5 rounded-[7px] px-2.5 py-2 text-[13px] font-medium transition-colors mb-0.5',
                    active
                      ? 'bg-[#C9A96E]/10 text-[#A68B4E]'
                      : 'text-[#6B6B6B] hover:bg-[#F0EBE4] hover:text-[#2D2D2D]',
                  )}
                >
                  <item.icon className={cn('h-[17px] w-[17px] shrink-0', active ? 'text-[#C9A96E]' : '')} />
                  {item.label}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t border-[#E8E2DA] px-2.5 py-3">
        <div className="flex items-center gap-2.5 px-2.5 py-2 mb-1">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#C9A96E]/35 bg-[#C9A96E]/10 text-xs font-bold text-[#A68B4E]">
            A
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[#2D2D2D]">Amy Le</p>
            <p className="text-[11px] text-[#6B6B6B]">Administrator</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex w-full items-center gap-2.5 rounded-[7px] px-2.5 py-2 text-[13px] font-medium text-[#6B6B6B] transition-colors hover:bg-[#F0EBE4] hover:text-[#2D2D2D] cursor-pointer"
        >
          <LogOut className="h-[17px] w-[17px] shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
