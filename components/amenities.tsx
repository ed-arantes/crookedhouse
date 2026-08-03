import {
  Mountain,
  Wifi,
  Coffee,
  Tv,
  Trees,
  Car,
  UtensilsCrossed,
  Dog,
} from 'lucide-react'

const AMENITIES = [
  {
    icon: UtensilsCrossed,
    title: 'Fully equipped kitchen',
    desc: 'Oven, dishwasher, microwave, and coffee machine — cook like a local.',
  },
  {
    icon: Trees,
    title: 'Private garden',
    desc: 'A quiet garden with an outdoor seating area to relax in the sun.',
  },
  {
    icon: Mountain,
    title: 'Mountain views',
    desc: 'Wake up to the forested peaks that rise above the village.',
  },
  {
    icon: Wifi,
    title: 'Free Wi-Fi',
    desc: 'Fast, reliable Wi-Fi throughout the apartment, at no extra cost.',
  },
  {
    icon: Tv,
    title: 'TV & streaming',
    desc: 'A flat-screen TV with your favourite streaming services ready to go.',
  },
  {
    icon: Coffee,
    title: 'Welcome basket',
    desc: 'Fresh local treats and coffee waiting for you on arrival.',
  },
  {
    icon: Dog,
    title: 'Pet friendly',
    desc: 'Travelling with a furry companion? They are warmly welcome here.',
  },
  {
    icon: Car,
    title: 'Free parking',
    desc: 'Private parking right by the apartment with easy access to town.',
  },
]

export function Amenities() {
  return (
    <section id="amenities" className="bg-secondary/60 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="max-w-2xl">
          <span className="text-xs font-medium uppercase tracking-widest text-accent">
            What&apos;s included
          </span>
          <h2 className="mt-3 text-balance font-serif text-4xl font-medium text-foreground md:text-5xl">
            Everything you need to unwind
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {AMENITIES.map((item) => (
            <div key={item.title}>
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <item.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-serif text-xl text-foreground">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
