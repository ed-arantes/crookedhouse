import { BookingProvider } from '@/components/booking/booking-context'
import { SiteHeader } from '@/components/site-header'
import { Hero } from '@/components/hero'
import { About } from '@/components/about'
import { Gallery } from '@/components/gallery'
import { Amenities } from '@/components/amenities'
import { StaySection } from '@/components/stay-section'
import { Reviews } from '@/components/reviews'
import { Location } from '@/components/location'
import { BookingForm } from '@/components/booking-form'
import { SiteFooter } from '@/components/site-footer'

export default function Page() {
  return (
    <BookingProvider>
      <SiteHeader />
      <main>
        <Hero />
        <About />
        <Gallery />
        <Amenities />
        <StaySection />
        <Reviews />
        <Location />
        <BookingForm />
      </main>
      <SiteFooter />
    </BookingProvider>
  )
}
