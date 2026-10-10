import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'

const faqs = [
  {
    question: 'Quali sono gli orari di check-in e check-out a Crooked House?',
    answer: (
      <p>
        Il check-in a Crooked House è disponibile dalle 15:30; il check-out è previsto entro le 10:00.
      </p>
    ),
  },
  {
    question: 'Quanto costa soggiornare a Crooked House?',
    answer: (
      <p>
        Il prezzo può variare in base al soggiorno, ad esempio alle date e alle condizioni applicabili.
        Per conoscere il prezzo, inserisci le date del soggiorno.
      </p>
    ),
  },
  {
    question: 'Quali attività si possono praticare a Crooked House?',
    answer: (
      <>
        <p>A Crooked House sono disponibili le seguenti attività e servizi (alcuni potrebbero essere a pagamento):</p>
        <ul className="mt-3 list-disc space-y-1 pl-5">
          <li>Ciclismo</li>
          <li>Escursionismo</li>
          <li>Campo da tennis</li>
          <li>Windsurf</li>
          <li>Campo da golf (entro 2 miglia)</li>
        </ul>
      </>
    ),
  },
  {
    question: 'Quanto dista Crooked House dal centro di Grandola ed Uniti?',
    answer: <p>Crooked House dista 1,9 km dal centro di Grandola ed Uniti.</p>,
  },
  {
    question: 'Crooked House è una struttura adatta alle famiglie?',
    answer: <p>Sì, Crooked House è apprezzata dagli ospiti che prenotano soggiorni in famiglia.</p>,
  },
]

export default function FaqPage() {
  return (
    <>
      <SiteHeader locale="it" />
      <main className="min-h-screen bg-background px-5 pb-20 pt-32 md:px-8">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-widest text-accent">Crooked House</p>
          <h1 className="type-heading mt-3 font-serif text-4xl font-medium text-foreground">
            Domande frequenti
          </h1>
          <div className="mt-10 divide-y divide-border border-y border-border">
            {faqs.map(({ question, answer }) => (
              <details key={question} className="group py-5">
                <summary className="cursor-pointer list-none pr-8 text-lg font-medium text-foreground marker:hidden">
                  <span className="flex items-center justify-between gap-4">
                    {question}
                    <span aria-hidden="true" className="text-accent transition-transform group-open:rotate-45">
                      +
                    </span>
                  </span>
                </summary>
                <div className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                  {answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter locale="it" />
    </>
  )
}
