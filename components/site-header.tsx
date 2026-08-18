'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { locales, t, type Locale } from '@/lib/i18n'

const LANGUAGE_LABELS: Record<Locale, string> = {
 en: 'English',
 it: 'Italiano',
 fr: 'Français',
 de: 'Deutsch',
 es: 'Español',
}

export function SiteHeader({ locale = 'en' }: { locale?: Locale }) {
 const router = useRouter()
 const NAV = [
  { label: t(locale, 'nav.apartment'), href: '#about' },
  { label: t(locale, 'nav.gallery'), href: '#gallery' },
  { label: t(locale, 'nav.amenities'), href: '#amenities' },
  { label: t(locale, 'nav.reviews'), href: '#reviews' },
  { label: t(locale, 'nav.location'), href: '#location' },
 ]

 const [scrolled, setScrolled] = useState(false)
 const [open, setOpen] = useState(false)
 const [loginOpen, setLoginOpen] = useState(false)
 const loginRef = useRef<HTMLDivElement>(null)

 useEffect(() => {
  function onScroll() {
   setScrolled(window.scrollY > 24)
  }
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  return () => window.removeEventListener('scroll', onScroll)
 }, [])

 useEffect(() => {
  function handleClickOutside(e: MouseEvent) {
   if (loginRef.current && !loginRef.current.contains(e.target as Node)) {
    setLoginOpen(false)
   }
  }
  if (loginOpen) {
   document.addEventListener('mousedown', handleClickOutside)
   return () => document.removeEventListener('mousedown', handleClickOutside)
  }
 }, [loginOpen])

 function handleNav() {
  setOpen(false)
 }

 return (
  <header
   className={cn(
    'fixed inset-x-0 top-0 z-50 transition-all duration-300',
    scrolled
     ? 'border-b border-border/80 bg-background/80 backdrop-blur-xl'
     : 'border-b border-transparent bg-background/60 backdrop-blur-md',
   )}
  >
   <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
    <a
     href="#top"
     onClick={(e) => {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: 'smooth' })
     }}
     className="type-heading font-serif font-semibold tracking-tight text-foreground transition-colors"
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
     <div className="hidden md:block">
      <label className="sr-only" htmlFor="language-switcher">
       Select language
      </label>
      <select
       id="language-switcher"
       aria-label="Select language"
       value={locale}
       onChange={(event) => {
        const nextLocale = event.target.value as Locale
        router.push(`/${nextLocale}`, { scroll: false })
       }}
       className="cursor-pointer rounded-full bg-card/95 px-5 py-2.5 text-sm font-medium text-foreground outline-none transition-colors hover:bg-muted/80 focus:outline-none focus:ring-0"
      >
       {locales.map((item) => (
        <option key={item} value={item}>
         {LANGUAGE_LABELS[item]}
        </option>
       ))}
      </select>
     </div>
     <div className="relative hidden md:block" ref={loginRef}>
      <button
       type="button"
       onClick={() => setLoginOpen((v) => !v)}
       className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90"
      >
       {t(locale, 'nav.book')}
      </button>
      {loginOpen && (
       <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl border border-border bg-card p-5 shadow-lg">
        <h3 className="font-serif font-medium text-foreground">
         {t(locale, 'nav.login')}
        </h3>
        <form className="mt-4 flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
         <input
          type="text"
          placeholder={t(locale, 'nav.surname')}
          className="rounded-full border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary"
         />
         <input
          type="email"
          placeholder={t(locale, 'nav.email')}
          className="rounded-full border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary"
         />
         <button
          type="submit"
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90"
         >
          {t(locale, 'nav.loginButton')}
         </button>
        </form>
       </div>
      )}
     </div>
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
    <div className="border-t border-border/80 bg-background/95 md:hidden backdrop-blur-md">
     <nav className="flex flex-col px-5 py-2">
      {NAV.map((item) => (
       <a
        key={item.href}
        href={item.href}
        onClick={handleNav}
        className="border-b border-border/80 py-3 text-left text-base text-foreground last:border-0"
       >
        {item.label}
       </a>
      ))}
      <div className="border-t border-border/80 py-3">
       <label className="sr-only" htmlFor="language-switcher-mobile">
        Select language
       </label>
       <select
        id="language-switcher-mobile"
        aria-label="Select language"
        value={locale}
        onChange={(event) => {
         const nextLocale = event.target.value as Locale
         setOpen(false)
         router.push(`/${nextLocale}`, { scroll: false })
        }}
        className="w-full cursor-pointer rounded-full bg-card/95 px-5 py-3 text-sm font-medium text-foreground outline-none transition-colors hover:bg-muted/80 focus:outline-none focus:ring-0"
       >
        {locales.map((item) => (
         <option key={item} value={item}>
          {LANGUAGE_LABELS[item]}
         </option>
        ))}
       </select>
      </div>
      <div className="my-3">
       <form className="flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
        <input
         type="text"
         placeholder={t(locale, 'nav.surname')}
         className="rounded-full border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary"
        />
        <input
         type="email"
         placeholder={t(locale, 'nav.email')}
         className="rounded-full border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary"
        />
        <button
         type="submit"
         className="rounded-full bg-accent px-5 py-3 text-sm font-medium text-accent-foreground"
        >
         {t(locale, 'nav.loginButton')}
        </button>
       </form>
      </div>
     </nav>
    </div>
   )}
  </header>
 )
}
