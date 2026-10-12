'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ChevronDown, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { locales, t, type Locale } from '@/lib/i18n'
import { apiUrl } from '@/lib/api-url'

const LANGUAGE_LABELS: Record<Locale, string> = {
 en: 'English',
 it: 'Italiano',
 fr: 'Français',
 de: 'Deutsch',
 es: 'Español',
 ru: 'Русский',
}

export function SiteHeader({ locale = 'en' }: { locale?: Locale }) {
 const router = useRouter()
 const pathname = usePathname()
 const isHomePage = pathname === '/' || pathname === `/${locale}`
 const actionPillClass = 'w-[7rem] justify-center'
 const NAV = [
  { label: t(locale, 'nav.apartment'), href: isHomePage ? '#about' : `/${locale}#about` },
  { label: t(locale, 'nav.amenities'), href: isHomePage ? '#amenities' : `/${locale}#amenities` },
  { label: t(locale, 'nav.reviews'), href: isHomePage ? '#reviews' : `/${locale}#reviews` },
  { label: t(locale, 'nav.location'), href: isHomePage ? '#location' : `/${locale}#location` },
  { label: 'FAQ', href: '/faq' },
 ]

  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [surname, setSurname] = useState('')
  const [email, setEmail] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
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
  function handleClickOutside(event: MouseEvent) {
   if (loginRef.current && !loginRef.current.contains(event.target as Node)) {
    setLoginOpen(false)
   }
  }
  if (!loginOpen) return
  document.addEventListener('mousedown', handleClickOutside)
  return () => document.removeEventListener('mousedown', handleClickOutside)
 }, [loginOpen])

  function handleNav() {
   setOpen(false)
  }

  function selectLanguage(nextLocale: Locale) {
   const secure = window.location.protocol === 'https:' ? '; Secure' : ''
   document.cookie = `crookedhouse_locale=${nextLocale}; Max-Age=31536000; Path=/; SameSite=Lax${secure}`
   router.push(`/${nextLocale}`, { scroll: false })
  }

  async function handleGuestLogin(event: React.FormEvent<HTMLFormElement>) {
   event.preventDefault()
   setLoginError('')
   if (surname.trim().toLocaleLowerCase() === 'admin') {
    setLoginOpen(false)
    router.push('/admin')
    return
   }
   setLoginLoading(true)
   try {
    const response = await fetch(apiUrl('/api/guest/auth'), {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ surname, email }),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data?.error || t(locale, 'nav.login'))
    setLoginOpen(false)
    router.push(`/${locale}/account`)
   } catch (error) {
    setLoginError(error instanceof Error ? error.message : t(locale, 'nav.login'))
   } finally {
    setLoginLoading(false)
   }
  }

 const isAdminShortcut = surname.trim().toLocaleLowerCase() === 'admin'

 return (
  <header
   className={cn(
    'fixed inset-x-0 top-0 z-50 transition-all duration-300',
    scrolled
     ? 'border-b border-border/30 bg-background/30 backdrop-blur-lg'
     : 'border-b border-transparent bg-background/20 backdrop-blur-sm',
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
     <div className="relative hidden md:block">
      <label className="sr-only" htmlFor="language-switcher">
       Select language
      </label>
      <select
       id="language-switcher"
       aria-label={t(locale, 'aria.selectLanguage')}
       value={locale}
       onChange={(event) => {
        const nextLocale = event.target.value as Locale
        selectLanguage(nextLocale)
       }}
       className={cn(
        actionPillClass,
        'appearance-none cursor-pointer rounded-full bg-card/95 px-5 py-2.5 text-sm font-medium text-foreground outline-none transition-colors hover:bg-muted/80 focus:outline-none focus:ring-0',
       )}
      >
       {locales.map((item) => (
        <option key={item} value={item}>
         {LANGUAGE_LABELS[item]}
        </option>
       ))}
      </select>
      <ChevronDown
       aria-hidden="true"
       className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground"
      />
     </div>
     <div className="relative hidden md:block" ref={loginRef}>
      <button
       type="button"
       onClick={() => setLoginOpen((value) => !value)}
       className={cn(
        actionPillClass,
        'inline-flex items-center rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90',
       )}
      >
       {t(locale, 'nav.login')}
      </button>
      {loginOpen && (
       <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl border border-border bg-card p-5 shadow-lg">
        <h3 className="font-serif font-medium text-foreground">
         {t(locale, 'nav.login')}
        </h3>
        <form className="mt-4 flex flex-col gap-3" onSubmit={handleGuestLogin}>
         <input
          type="text"
          autoComplete="family-name"
          placeholder={t(locale, 'nav.surname')}
          value={surname}
          onChange={(event) => setSurname(event.target.value)}
          required
          className="rounded-full border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary"
         />
         <input
          type="email"
          autoComplete="email"
          placeholder={t(locale, 'nav.email')}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required={!isAdminShortcut}
          className="rounded-full border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary"
         />
         {loginError && <p role="alert" className="text-sm text-destructive">{loginError}</p>}
         <button
          type="submit"
          disabled={loginLoading}
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90 disabled:opacity-60"
         >
          {loginLoading ? '...' : t(locale, 'nav.loginButton')}
         </button>
        </form>
       </div>
      )}
     </div>
     <button
      type="button"
      onClick={() => setOpen((v) => !v)}
      aria-label={t(locale, 'aria.toggleMenu')}
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
        aria-label={t(locale, 'aria.selectLanguage')}
        value={locale}
        onChange={(event) => {
         const nextLocale = event.target.value as Locale
         setOpen(false)
         selectLanguage(nextLocale)
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
      <Link
       href={`/${locale}/account`}
       onClick={handleNav}
       className="my-3 rounded-full bg-accent px-5 py-3 text-center text-sm font-medium text-accent-foreground"
      >
       {t(locale, 'nav.login')}
      </Link>
     </nav>
    </div>
   )}
  </header>
 )
}
