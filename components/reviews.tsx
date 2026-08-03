import { Star } from 'lucide-react'

const REVIEWS = [
  {
    name: 'Anastasiia',
    location: 'Ukraine',
    text: 'The hosts are just the best I ever had! Mara and Beppe took care of me and my sister fully. The apartment was spotless and so cosy — we felt completely at home.',
    initial: 'A',
  },
  {
    name: 'Thomas & Lena',
    location: 'Munich, Germany',
    text: 'A perfect base for exploring Lake Como. Quiet village, mountain views from the garden, and everything you need in the kitchen. Menaggio is a short drive away.',
    initial: 'T',
  },
  {
    name: 'Giulia R.',
    location: 'Milan, Italy',
    text: 'Charming, immaculate, and warmly hosted. Having our own private entrance and garden made it feel like a little home. Our dog was made to feel welcome too.',
    initial: 'G',
  },
]

export function Reviews() {
  return (
    <section id="reviews" className="bg-primary py-20 text-primary-foreground md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <span className="text-xs font-medium uppercase tracking-widest text-primary-foreground/70">
              Guest stories
            </span>
            <h2 className="mt-3 text-balance font-serif text-4xl font-medium md:text-5xl">
              Rated exceptional by every guest
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="h-5 w-5 fill-accent text-accent"
                />
              ))}
            </div>
            <span className="text-lg">
              <strong className="font-serif text-2xl">9.7</strong>{' '}
              <span className="text-primary-foreground/70">
                Exceptional · 3 reviews
              </span>
            </span>
          </div>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {REVIEWS.map((review) => (
            <figure
              key={review.name}
              className="flex flex-col rounded-2xl bg-primary-foreground/10 p-6 backdrop-blur-sm"
            >
              <div className="mb-4 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                ))}
              </div>
              <blockquote className="flex-1 text-pretty text-sm leading-relaxed text-primary-foreground/90">
                &ldquo;{review.text}&rdquo;
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent font-serif text-lg text-accent-foreground">
                  {review.initial}
                </span>
                <span>
                  <span className="block text-sm font-medium">
                    {review.name}
                  </span>
                  <span className="block text-xs text-primary-foreground/60">
                    {review.location}
                  </span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
