import {
 IconCooker,
 IconBowlSpoon,
 IconMicrowave,
 IconCoffee,
 IconBread,
 IconTeapot,
 IconDeviceTv,
 IconWifi,
 IconHanger,
 IconHorseToy,
 IconBed,
 IconWind,
 IconIroning,
 IconPicnicTable,
 IconWashDry1,
 IconCarGarage,
 type TablerIcon,
} from '@tabler/icons-react'
import { t, tArray, type Locale } from '@/lib/i18n'
import { Highlight } from '@/components/highlight'

const ICONS: TablerIcon[] = [
 IconCooker,      // Forno
 IconBowlSpoon,   // Lavastoviglie
 IconMicrowave,   // Microonde
 IconCoffee,      // Macchine da caffè
 IconBread,       // Tostapane
 IconTeapot,      // Bollitore
 IconDeviceTv,    // TV a schermo piatto
 IconWifi,        // Wi-Fi
 IconHanger,      // Armadio e cassettiera
 IconHorseToy,    // Culla
 IconBed,         // Biancheria da letto e da bagno
 IconWind,        // Asciugacapelli
 IconIroning,     // Ferro da stiro
 IconPicnicTable, // Giardino privato
 IconWashDry1,    // Locale lavanderia
 IconCarGarage,   // Garage
]

export function Amenities({ locale = 'en' }: { locale?: Locale }) {
 const items = tArray(locale, 'amenities.list')

 return (
  <section id="amenities" className="scroll-mt-0 bg-secondary/60 py-12 md:py-16">
   <div className="mx-auto max-w-7xl px-5 md:px-8">
    <div>
     <h2 className="type-heading text-balance font-serif font-medium text-foreground">
      {t(locale, 'amenities.headline')}
     </h2>
      <p className="type-body mt-3 text-muted-foreground">
        <Highlight text={t(locale, 'amenities.body')} phrases={[{ phrase: 'Crooked House', className: 'font-serif text-accent' }]} />
      </p>
    </div>

    <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
     {items.map((item, i) => {
      const Icon = ICONS[i] ?? IconCooker
      return (
       <div key={item}>
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
         <Icon size={20} stroke={1.5} />
        </span>
        <p className="type-body mt-2 text-muted-foreground">{item}</p>
       </div>
      )
     })}
    </div>
   </div>
  </section>
 )
}
