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
import { RichText } from '@/components/rich-text'

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
  <section id="amenities" className="bg-secondary/60 py-12 md:py-16">
   <div className="mx-auto max-w-7xl px-5 md:px-8">
    <div>
      <h2 className="type-heading text-balance font-serif font-medium text-foreground">
       <RichText text={t(locale, 'amenities.headline')} />
      </h2>
      <p className="type-body mt-3 text-muted-foreground">
        <RichText text={t(locale, 'amenities.body')} />
      </p>
    </div>

    <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-4 lg:grid-cols-4">
     {items.map((item, i) => {
      const Icon = ICONS[i] ?? IconCooker
       return (
        <div key={item} className="flex items-center gap-3">
         <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon size={18} stroke={1.5} />
         </span>
         <p className="type-body text-muted-foreground">{item}</p>
        </div>
      )
     })}
    </div>
   </div>
  </section>
 )
}
