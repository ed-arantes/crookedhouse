import Link from 'next/link'
import type { Locale } from '@/lib/i18n'

export function ServicesDetailsPage({ locale }: { locale: Locale }) {
 return (
  <main className="flex min-h-screen items-center bg-accent py-20 text-accent-foreground">
   <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
    <Link
     href={`/${locale}`}
     className="text-sm font-medium underline underline-offset-4 transition-opacity hover:opacity-80"
    >
     Torna alla pagina principale
    </Link>
    <h1 className="type-heading mt-10 font-serif font-medium">
     Colazioni e pasti
    </h1>
   </div>
  </main>
 )
}