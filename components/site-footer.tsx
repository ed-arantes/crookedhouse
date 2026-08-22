import { Mail, Phone, MapPin } from 'lucide-react'
import { t, type Locale } from '@/lib/i18n'
import { RichText } from '@/components/rich-text'

const SOCIALS = [
 { label: 'Instagram', href: '#' },
 { label: 'Journal', href: '#' },
]

export function SiteFooter({ locale = 'en' }: { locale?: Locale }) {
 const LINKS = [
  { label: t(locale, 'nav.apartment'), href: '#about' },
  { label: t(locale, 'nav.gallery'), href: '#gallery' },
  { label: t(locale, 'nav.amenities'), href: '#amenities' },
  { label: t(locale, 'nav.reviews'), href: '#reviews' },
  { label: t(locale, 'nav.location'), href: '#location' },
  { label: t(locale, 'nav.book'), href: '#booking' },
 ]

 return (
  <footer className="bg-primary text-primary-foreground">
   <div className="mx-auto max-w-7xl px-5 py-16 md:px-8">
    <div className="grid gap-10 md:grid-cols-3">
     <div>
      <p className="type-heading font-serif font-semibold">Crooked House</p>
      <p className="type-body mt-4 max-w-xs text-pretty text-primary-foreground/70">
        <RichText text={t(locale, 'footer.description')} />
       </p>
      <div className="mt-6 flex gap-3">
       {SOCIALS.map((social) => (
        <a
         key={social.label}
         href={social.href}
         className="rounded-full border border-primary-foreground/20 px-4 py-2 text-xs font-medium text-primary-foreground/80 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
        >
         {social.label}
        </a>
       ))}
      </div>
     </div>

     <nav aria-label="Footer">
      <p className="text-xs font-medium uppercase tracking-widest text-primary-foreground/60">
       {t(locale, 'footer.explore')}
      </p>
      <ul className="mt-4 grid grid-cols-2 gap-y-3 text-sm">
       {LINKS.map((link) => (
        <li key={link.href}>
         <a
          href={link.href}
          className="text-primary-foreground/80 transition-colors hover:text-primary-foreground"
         >
          {link.label}
         </a>
        </li>
       ))}
      </ul>
     </nav>

     <div>
      <p className="text-xs font-medium uppercase tracking-widest text-primary-foreground/60">
       {t(locale, 'footer.contact')}
      </p>
      <ul className="mt-4 space-y-3 text-sm text-primary-foreground/80">
       <li className="flex items-center gap-3">
        <MapPin className="h-4 w-4 shrink-0" />
        Via Dante Alighieri 2, Grandola ed Uniti, Como, 22010
       </li>
       <li className="flex items-center gap-3">
        <Phone className="h-4 w-4 shrink-0" />
        +39 0344 000 000
       </li>
       <li className="flex items-center gap-3">
        <Mail className="h-4 w-4 shrink-0" />
        stay@crookedhouse.it
       </li>
      </ul>
     </div>
    </div>

    <div className="mt-14 flex flex-col gap-3 border-t border-primary-foreground/15 pt-6 text-xs text-primary-foreground/60 sm:flex-row sm:items-center sm:justify-between">
     <p>{t(locale, 'footer.allRights').replace('{year}', String(new Date().getFullYear()))}</p>
     <p className="flex gap-5">
      <a href="#" className="transition-colors hover:text-primary-foreground">
       {t(locale, 'footer.privacy')}
      </a>
      <a href="#" className="transition-colors hover:text-primary-foreground">
       {t(locale, 'footer.terms')}
      </a>
     </p>
    </div>
   </div>
  </footer>
 )
}
