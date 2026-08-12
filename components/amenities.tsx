import {
  Mountain,
  Wifi,
  Coffee,
  Tv,
  Trees,
  Car,
  UtensilsCrossed,
  Dog,
} from 'lucide-react'
import { t, type Locale } from '@/lib/i18n'

const AMENITIES = [
  {
    icon: UtensilsCrossed,
    titleKey: 'amenities.kitchenTitle',
    descKey: 'amenities.kitchenDesc',
  },
  {
    icon: Trees,
    titleKey: 'amenities.gardenTitle',
    descKey: 'amenities.gardenDesc',
  },
  {
    icon: Mountain,
    titleKey: 'amenities.viewsTitle',
    descKey: 'amenities.viewsDesc',
  },
  {
    icon: Wifi,
    titleKey: 'amenities.wifiTitle',
    descKey: 'amenities.wifiDesc',
  },
  {
    icon: Tv,
    titleKey: 'amenities.tvTitle',
    descKey: 'amenities.tvDesc',
  },
  {
    icon: Coffee,
    titleKey: 'amenities.welcomeTitle',
    descKey: 'amenities.welcomeDesc',
  },
  {
    icon: Dog,
    titleKey: 'amenities.petTitle',
    descKey: 'amenities.petDesc',
  },
  {
    icon: Car,
    titleKey: 'amenities.parkingTitle',
    descKey: 'amenities.parkingDesc',
  },
]

export function Amenities({ locale = 'en' }: { locale?: Locale }) {
  return (
    <section id="amenities" className="scroll-mt-0 bg-secondary/60 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="max-w-2xl">
          <h2 className="type-heading text-balance font-serif font-medium text-foreground">
            {t(locale, 'amenities.headline')}
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {AMENITIES.map((item) => (
            <div key={item.titleKey}>
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <item.icon className="h-5 w-5" />
              </span>
              <h3 className="type-body mt-4 font-serif font-medium text-foreground">
                {t(locale, item.titleKey)}
              </h3>
              <p className="type-body mt-2 text-muted-foreground">
                {t(locale, item.descKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
