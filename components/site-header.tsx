'use client'

import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { label: 'The Apartment', href: '#about' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Amenities', href: '#amenities' },
  { label: 'Reviews', href: '#reviews' },
  { label: 'Location', href: '#location' },
]

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 24)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function handleNav() {
    setOpen(false)
  }

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'border-b border-[#d7cfc0] bg-[#f3eee4]/88 shadow-[0_10px_30px_rgba(31,41,55,0.08)] backdrop-blur-xl'
          : 'border-b border-transparent bg-[#f3eee4]/70 shadow-[0_8px_24px_rgba(31,41,55,0.04)] backdrop-blur-md',
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault()
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          className="font-serif text-2xl font-semibold tracking-tight text-foreground transition-colors"
        >
          Crooked House
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={handleNav}
              className="text-sm text-foreground transition-colors hover:opacity-70"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="#booking"
            onClick={handleNav}
            className="hidden rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90 md:block"
          >
            Book a stay
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            className="flex h-10 w-10 items-center justify-center rounded-full text-foreground md:hidden"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-[#d7cfc0] bg-[#f3eee4]/90 md:hidden backdrop-blur-md">
          <nav className="flex flex-col px-5 py-2">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={handleNav}
                className="border-b border-[#d7cfc0]/80 py-3 text-left text-base text-foreground last:border-0"
              >
                {item.label}
              </a>
            ))}
            <a
              href="#booking"
              onClick={handleNav}
              className="my-3 rounded-full bg-accent px-5 py-3 text-center text-sm font-medium text-accent-foreground"
            >
              Book a stay
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}
