import Image from 'next/image'
import { Star } from 'lucide-react'
import { SearchBar } from './booking/search-bar'

export function Hero() {
  return (
    <section id="top" className="relative min-h-[92vh] w-full overflow-hidden">
      <Image
        src="/images/hero-villa.png"
        alt="Crooked House village apartment near Lake Como at golden hour with mountain backdrop"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-foreground/50 via-foreground/20 to-foreground/60" />

      <div className="relative mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-end px-5 pb-10 pt-32 md:px-8 md:pb-16">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-background/15 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-background backdrop-blur">
            <Star className="h-3.5 w-3.5 fill-background text-background" />
            Exceptional 9.7 · Grandola ed Uniti, Lake Como
          </span>
          <h1 className="mt-5 text-balance font-serif text-5xl font-medium leading-[1.05] text-background md:text-7xl">
            Your own corner of Lake Como
          </h1>
          <p className="mt-4 max-w-lg text-pretty text-base leading-relaxed text-background/90 md:text-lg">
            Crooked House is a characterful one-bedroom apartment above
            Menaggio, with a private entrance, a garden framed by mountains, and
            a kitchen that&apos;s all yours. Warmly hosted by Mara &amp; Beppe.
          </p>
        </div>

        <div className="mt-8 md:mt-10">
          <SearchBar />
        </div>
      </div>
    </section>
  )
}
