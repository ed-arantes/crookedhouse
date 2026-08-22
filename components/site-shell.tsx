'use client'

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
import type { Locale } from '@/lib/i18n'

function SiteContent({ locale }: { locale: Locale }) {
  return (
    <>
      <SiteHeader locale={locale} />
      <main>
        <Hero locale={locale} />
        <Apartment locale={locale} />
        <Layout locale={locale} />
        <Gallery locale={locale} />
        <Services locale={locale} />
        <Amenities locale={locale} />
        <Explore locale={locale} />
        <Reviews locale={locale} />
        <Location locale={locale} />
        <BookingForm locale={locale} />
      </main>
      <SiteFooter locale={locale} />
    </>
  )
}

export function SiteShell({ locale }: { locale: Locale }) {
  return (
    <SiteDataProvider locale={locale}>
      <SiteContent locale={locale} />
    </SiteDataProvider>
  )
}

