import { SiteHeader } from '@/components/site-header'
import { Hero } from '@/components/hero'
import { Apartment } from '@/components/apartment'
import { Layout } from '@/components/layout'
import { Amenities } from '@/components/amenities'
import { Explore } from '@/components/explore'
import { Gallery } from '@/components/gallery'
import { Services } from '@/components/services'
import { Reviews } from '@/components/reviews'
import { Location } from '@/components/location'
import { BookingForm } from '@/components/booking-form'
import { SiteFooter } from '@/components/site-footer'
import { SiteDataProvider } from '@/components/site-data-provider'
import { getLocaleFromPathname, locales, type Locale } from '@/lib/i18n'

export function generateStaticParams() {
 return locales.map((locale) => ({ locale }))
}

export default async function LocalePage({
 params,
}: {
 params: Promise<{ locale: string }>
}) {
 const { locale } = await params
 const safeLocale = getLocaleFromPathname(`/${locale}`) as Locale

 return (
  <SiteDataProvider locale={safeLocale}>
   <SiteHeader locale={safeLocale} />
   <main>
    <Hero locale={safeLocale} />
    <Apartment locale={safeLocale} />
     <Layout locale={safeLocale} />
     <Gallery locale={safeLocale} />
     <Services locale={safeLocale} />
     <Amenities locale={safeLocale} />
     <Explore locale={safeLocale} />
     <Reviews locale={safeLocale} />
    <Location locale={safeLocale} />
    <BookingForm locale={safeLocale} />
   </main>
   <SiteFooter locale={safeLocale} />
  </SiteDataProvider>
 )
}
