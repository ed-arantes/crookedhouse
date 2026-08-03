import Image from 'next/image'
import { MapPin, Plane, Wine, Landmark } from 'lucide-react'

const NEARBY = [
  { icon: Landmark, label: 'Menaggio lakefront', detail: '5 min drive' },
  { icon: Wine, label: 'Villa Carlotta', detail: '12 km away' },
  { icon: Plane, label: 'Orio al Serio airport', detail: '72 km away' },
]

export function Location() {
  return (
    <section id="location" className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
      <div className="max-w-2xl">
        <span className="text-xs font-medium uppercase tracking-widest text-accent">
          Where you&apos;ll be
        </span>
        <h2 className="mt-3 text-balance font-serif text-4xl font-medium text-foreground md:text-5xl">
          In the hills above Menaggio
        </h2>
        <p className="mt-4 flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-4 w-4 text-primary" />
          Via Dante Alighieri 2, 22010 Grandola ed Uniti, Lake Como, Italy
        </p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="overflow-hidden rounded-2xl border border-border">
          <iframe
            title="Map showing Crooked House in Grandola ed Uniti, Lake Como"
            src="https://www.openstreetmap.org/export/embed.html?bbox=9.18%2C45.97%2C9.31%2C46.06&layer=mapnik&marker=46.0186%2C9.2377"
            className="h-[300px] w-full md:h-[440px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <div className="flex flex-col gap-6">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
            <Image
              src="/images/village.png"
              alt="Lakeside town of Menaggio near Crooked House at golden hour"
              fill
              sizes="(max-width: 1024px) 100vw, 33vw"
              className="object-cover"
            />
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-serif text-xl text-foreground">
              Getting around
            </h3>
            <ul className="mt-4 space-y-4">
              {NEARBY.map((item) => (
                <li key={item.label} className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <item.icon className="h-4 w-4" />
                  </span>
                  <span className="flex flex-1 items-center justify-between">
                    <span className="text-sm text-foreground">
                      {item.label}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {item.detail}
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
