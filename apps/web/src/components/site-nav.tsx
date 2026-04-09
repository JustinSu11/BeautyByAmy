'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/#services', label: 'Services' },
  { href: '/#gallery', label: 'Gallery' },
  { href: '/#contact', label: 'Contact' },
]

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isHome = pathname === '/'

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled || !isHome
          ? 'border-b border-border bg-card/95 backdrop-blur-sm shadow-sm'
          : 'bg-transparent'
      )}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 lg:px-8">
        {/* Left links - desktop */}
        <div className="hidden flex-1 items-center gap-8 md:flex">
          {navLinks.slice(0, 2).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'text-sm tracking-wide transition-colors',
                scrolled || !isHome
                  ? 'text-foreground hover:text-gold'
                  : 'text-card hover:text-gold-light'
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Logo - center */}
        <Link href="/" className="flex flex-col items-center">
          <span
            className={cn(
              'font-serif text-2xl tracking-tight transition-colors lg:text-3xl',
              scrolled || !isHome ? 'text-charcoal' : 'text-card'
            )}
          >
            BeautyByAmy
          </span>
          <span
            className={cn(
              'text-[10px] uppercase tracking-[0.25em] transition-colors',
              scrolled || !isHome
                ? 'text-muted-foreground'
                : 'text-card/70'
            )}
          >
            Luxury Beauty Studio
          </span>
        </Link>

        {/* Right links - desktop */}
        <div className="hidden flex-1 items-center justify-end gap-8 md:flex">
          {navLinks.slice(2).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'text-sm tracking-wide transition-colors',
                scrolled || !isHome
                  ? 'text-foreground hover:text-gold'
                  : 'text-card hover:text-gold-light'
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/booking"
            className={cn(
              'rounded-full px-5 py-2 text-sm font-medium transition-all',
              scrolled || !isHome
                ? 'bg-charcoal text-card hover:bg-charcoal-light'
                : 'bg-card/20 text-card backdrop-blur-sm hover:bg-card/30'
            )}
          >
            Book Now
          </Link>
        </div>

        {/* Mobile menu */}
        <div className="md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full transition-colors',
                  scrolled || !isHome
                    ? 'text-charcoal hover:bg-secondary'
                    : 'text-card hover:bg-card/10'
                )}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-card">
              <SheetHeader>
                <SheetTitle className="font-serif text-xl text-charcoal">
                  BeautyByAmy
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-8 flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="my-4 h-px bg-border" />
                <Link
                  href="/booking"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center rounded-lg bg-gold px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-gold-dark"
                >
                  Book Appointment
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  )
}
