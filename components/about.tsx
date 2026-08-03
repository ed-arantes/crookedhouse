import Image from 'next/image'

const STATS = [
  { value: '9.7', label: 'Guest rating' },
  { value: '2', label: 'Guests' },
  { value: 'Pets', label: 'Welcome' },
]

export function About() {
  return (
    <section id="about" className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
      <div className="grid gap-12 md:grid-cols-2 md:gap-16">
        <div className="flex flex-col justify-center">
          <span className="text-xs font-medium uppercase tracking-widest text-accent">
            Welcome to Crooked House
          </span>
          <h2 className="mt-4 text-balance font-serif text-4xl font-medium leading-tight text-foreground md:text-5xl">
            A characterful village home for slow, sunlit days
          </h2>
          <p className="mt-6 text-pretty leading-relaxed text-muted-foreground">
            Tucked into the quiet village of Grandola ed Uniti, just above
            Menaggio on Lake Como, Crooked House is a lovingly restored
            one-bedroom apartment. White plaster walls, exposed wooden beams,
            and cool tile floors keep it calm even on the warmest afternoons.
          </p>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            You&apos;ll have the whole place to yourself — a private entrance, a
            comfortable living room, a fully equipped kitchen, and a garden
            framed by mountains. Mara &amp; Beppe live nearby and look after
            every guest as if they were family.
          </p>

          <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-border pt-8">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <dt className="font-serif text-3xl text-foreground md:text-4xl">
                  {stat.value}
                </dt>
                <dd className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="relative mt-10 aspect-[3/4] overflow-hidden rounded-2xl">
            <Image
              src="/images/lounge.png"
              alt="Cosy living room with linen sofa and wood-beamed ceiling"
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover"
            />
          </div>
          <div className="relative aspect-[3/4] overflow-hidden rounded-2xl">
            <Image
              src="/images/garden.png"
              alt="Terraced lakeside garden with stone pathway and lavender"
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
