'use client'

import Image from 'next/image'
import { MapPin, Plane, Wine, Landmark, LocateFixed } from 'lucide-react'
import { t, type Locale } from '@/lib/i18n'
import { useSiteData } from '@/components/site-data-provider'
import { RichText } from '@/components/rich-text'
import { PhotoLightbox } from '@/components/photo-lightbox'

const NEARBY = [
 {
  icon: Landmark,
  labelKey: 'location.nearby.lakefront',
  detailKey: 'location.nearby.lakefrontDetail',
 },
 {
  icon: Wine,
  labelKey: 'location.nearby.villa',
  detailKey: 'location.nearby.villaDetail',
 },
 {
  icon: Plane,
  labelKey: 'location.nearby.airport',
  detailKey: 'location.nearby.airportDetail',
 },
 {
  icon: Plane,
  labelKey: 'location.nearby.malpensa',
  detailKey: 'location.nearby.malpensaDetail',
 },
]

export function Location({ locale = 'en' }: { locale?: Locale }) {
 const { images } = useSiteData()
 const villageImg = images.location?.[0]

 return (
  <section id="location" className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
   <div className="max-w-2xl">
    <h2 className="type-heading text-balance font-serif font-medium text-foreground">
     <RichText text={t(locale, 'location.headline')} />
    </h2>
    <p className="type-body mt-4 flex items-center gap-2 text-muted-foreground">
     <MapPin className="h-4 w-4 text-primary" />
     <RichText text={t(locale, 'location.address')} />
    </p>
    <p className="type-body mt-2 flex items-center gap-2 text-muted-foreground">
     <LocateFixed className="h-4 w-4 text-primary" />
     46.0411° N, 9.20166° E
    </p>
   </div>

   <div className="mt-10 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
    <div className="h-full min-h-[300px] overflow-hidden rounded-2xl border border-border md:min-h-[440px]">
     <iframe
      title={t(locale, 'aria.map')}
      src="https://www.openstreetmap.org/export/embed.html?bbox=9.1818080%2C46.0211577%2C9.2218080%2C46.0611577&layer=mapnik&marker=46.0411577%2C9.2018080"
      className="pointer-events-none block h-full min-h-[300px] w-full rounded-2xl border-0 md:min-h-[440px]"
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
     />
    </div>

    <div className="flex flex-col gap-6">
     <PhotoLightbox photos={villageImg ? [villageImg] : []} locale={locale}>
     {(openPhoto) => <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
      {villageImg ? (
       <button
        type="button"
        onClick={() => openPhoto(0)}
        aria-label={t(locale, 'gallery.openPhoto', { index: 1 })}
        className="group absolute inset-0"
       >
        <Image
         src={villageImg.url}
         alt={villageImg.alt}
         fill
         sizes="(max-width: 1024px) 100vw, 33vw"
         className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span className="absolute inset-0 bg-foreground/0 transition-colors group-hover:bg-foreground/10" />
       </button>
      ) : (
       <Image
        src="/images/image.webp"
        alt=""
        fill
        sizes="(max-width: 1024px) 100vw, 33vw"
        className="object-cover"
       />
      )}
     </div>}
     </PhotoLightbox>
     <div className="rounded-2xl border border-border bg-card p-6">
      <h3 className="type-body font-serif font-medium text-foreground">
       <RichText text={t(locale, 'location.gettingAround')} />
      </h3>
      <ul className="mt-4 space-y-4">
       {NEARBY.map((item) => (
        <li key={item.labelKey} className="flex items-center gap-3">
         <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <item.icon className="h-4 w-4" />
         </span>
         <span className="flex flex-1 items-center justify-between">
          <span className="text-sm text-foreground">
           {t(locale, item.labelKey)}
          </span>
          <span className="text-sm text-muted-foreground">
           {t(locale, item.detailKey)}
          </span>
         </span>
        </li>
       ))}
      </ul>
     </div>
    </div>
   </div>
  </section>
 )
}
