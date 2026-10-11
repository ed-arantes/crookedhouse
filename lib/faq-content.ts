export type FaqItem = {
  question: string
  answer: string
}

export const DEFAULT_FAQ_ITEMS: FaqItem[] = [
  {
    question: 'Quali sono gli orari di check-in e check-out a Crooked House?',
    answer: 'Il check-in a Crooked House è disponibile dalle 15:30; il check-out è previsto entro le 10:00.',
  },
  {
    question: 'Quanto costa soggiornare a Crooked House?',
    answer: 'Il prezzo può variare in base al soggiorno, ad esempio alle date e alle condizioni applicabili. Per conoscere il prezzo, inserisci le date del soggiorno.',
  },
  {
    question: 'Quali attività si possono praticare a Crooked House?',
    answer: 'A Crooked House sono disponibili le seguenti attività e servizi (alcuni potrebbero essere a pagamento):\n- Ciclismo\n- Escursionismo\n- Campo da tennis\n- Windsurf\n- Campo da golf (entro 2 miglia)',
  },
  {
    question: 'Quanto dista Crooked House dal centro di Grandola ed Uniti?',
    answer: 'Crooked House dista 1,9 km dal centro di Grandola ed Uniti.',
  },
  {
    question: 'Crooked House è una struttura adatta alle famiglie?',
    answer: 'Sì, Crooked House è apprezzata dagli ospiti che prenotano soggiorni in famiglia.',
  },
]
