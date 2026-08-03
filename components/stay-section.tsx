import Image from 'next/image'
import { BedDouble, Bath, Maximize, Users } from 'lucide-react'
import { ReserveCard } from './booking/reserve-card'

const SPECS = [
  { icon: Users, label: 'Up to 2 guests' },
  { icon: BedDouble, label: '1 bedroom + living room' },
  { icon: Bath, label: '1 bathroom' },
  { icon: Maximize, label: 'Private entrance' },
]

export function StaySection() {
  return (
    <section id="stay" className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
      <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
        <div>
          <span className="text-xs font-medium uppercase tracking-widest text-accent">
            The apartment
          </span>
          <h2 className="mt-3 text-balance font-serif text-4xl font-medium text-foreground md:text-5xl">
            The whole place is yours
          </h2>

          <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 border-y border-border py-5">
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

          <p className="mt-6 text-pretty leading-relaxed text-muted-foreground">
            Crooked House is a self-contained one-bedroom apartment with its own
            private entrance. Inside you&apos;ll find a comfortable double
            bedroom, a bright living room with a sofa and smart TV, a modern
            bathroom with a walk-in shower, and a fully equipped kitchen.
          </p>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            Step outside to a private garden with outdoor seating and mountain
            views — and a welcome basket of local treats waiting on arrival.
            Pets are welcome, and parking is free.
          </p>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <ReserveCard />
        </div>
      </div>
    </section>
  )
}
