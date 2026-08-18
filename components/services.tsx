import Image from 'next/image'
import { t, type Locale } from '@/lib/i18n'
import { RichText } from '@/components/rich-text'

export function Services({ locale = 'en' }: { locale?: Locale }) {
 return (
  <section className="bg-accent py-20 text-accent-foreground md:py-28">
   <div className="mx-auto max-w-7xl px-5 md:px-8">
    <div className="grid gap-8 md:grid-cols-2 md:gap-16">
     <div className="order-2 grid auto-rows-[180px] grid-cols-1 gap-4 md:order-1 md:auto-rows-[220px]">
      <div className="relative overflow-hidden rounded-2xl">
       <Image
        src="/images/picnic.png"
        alt="Outdoor picnic area"
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover"
       />
      </div>
      <div className="relative overflow-hidden rounded-2xl">
       <Image
        src="/images/table.png"
        alt="Table set for a meal"
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover"
       />
      </div>
     </div>

      <div className="order-1 flex flex-col md:order-2">
      <h2 className="type-heading text-balance font-serif font-medium">
       {t(locale, 'services.headline')}
      </h2>
      <p className="type-body mt-6 text-pretty">
       <RichText text={t(locale, 'services.body')} />
      </p>
     </div>
    </div>
   </div>
  </section>
 )
}
