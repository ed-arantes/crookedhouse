import { Mail, Phone, MapPin } from 'lucide-react'

const SOCIALS = [
  { label: 'Instagram', href: '#' },
  { label: 'Journal', href: '#' },
]

const LINKS = [
  { label: 'The Apartment', href: '#about' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Amenities', href: '#amenities' },
  { label: 'Reviews', href: '#reviews' },
  { label: 'Location', href: '#location' },
  { label: 'Book a stay', href: '#booking' },
]

export function SiteFooter() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-5 py-16 md:px-8">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <p className="font-serif text-3xl font-semibold">Crooked House</p>
            <p className="mt-4 max-w-xs text-pretty text-sm leading-relaxed text-primary-foreground/70">
              A characterful one-bedroom apartment in Grandola ed Uniti, above
              Menaggio on Lake Como.
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
              Explore
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
              Get in touch
            </p>
            <ul className="mt-4 space-y-3 text-sm text-primary-foreground/80">
              <li className="flex items-center gap-3">
                <MapPin className="h-4 w-4 shrink-0" />
                Via Dante Alighieri 2, 22010 Grandola ed Uniti, Italy
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
          <p>© {new Date().getFullYear()} Crooked House. All rights reserved.</p>
          <p className="flex gap-5">
            <a href="#" className="transition-colors hover:text-primary-foreground">
              Privacy
            </a>
            <a href="#" className="transition-colors hover:text-primary-foreground">
              Terms
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
