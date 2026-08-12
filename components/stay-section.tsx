import Image from 'next/image'
import { BedDouble, Bath, Maximize, Users, Sofa } from 'lucide-react'
import { t, type Locale } from '@/lib/i18n'

export function StaySection({ locale = 'en' }: { locale?: Locale }) {
 const SPECS = [
  { icon: Users, label: t(locale, 'stay.specs.guests') },
  { icon: BedDouble, label: t(locale, 'stay.specs.bedroom') },
  { icon: Sofa, label: t(locale, 'stay.specs.sofa') },
  { icon: Bath, label: t(locale, 'stay.specs.bathroom') },
  { icon: Maximize, label: t(locale, 'stay.specs.entrance') },
 ]

 return (
  <section id="stay" className="scroll-mt-0 mx-auto max-w-7xl px-5 pb-20 pt-10 md:px-8 md:pb-28 md:pt-16">
   <div className="mx-auto max-w-4xl text-center">
     <h2 className="type-heading text-balance font-serif font-medium text-foreground">
      {t(locale, 'stay.headline')}
     </h2>

     <div className="mt-6 flex flex-wrap justify-center gap-x-8 gap-y-3 border-y border-border py-5">
      {SPECS.map((spec) => (
       <span
        key={spec.label}
        className="flex items-center gap-2 text-sm text-foreground"
       >
        <spec.icon className="h-4 w-4 text-primary" />
        {spec.label}
       </span>
      ))}
     </div>

     <div className="relative mt-8 aspect-[16/10] overflow-hidden rounded-2xl">
      <Image
       src="/images/suite-bedroom.png"
       alt="The bedroom with a gold iron bed, wood-beamed ceiling and morning light"
       fill
       sizes="(max-width: 1024px) 100vw, 60vw"
       className="object-cover"
      />
     </div>

     <p className="type-body mt-6 text-pretty text-muted-foreground">
      {t(locale, 'stay.body1')}
     </p>
     <p className="type-body mt-4 text-pretty text-muted-foreground">
      {t(locale, 'stay.body2')}
     </p>
   </div>
  </section>
 )
}
