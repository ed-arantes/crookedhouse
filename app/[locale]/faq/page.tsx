import { FaqPage as FaqPageContent } from '@/components/faq-page'
import { getLocaleFromPathname, locales, type Locale } from '@/lib/i18n'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const safeLocale = getLocaleFromPathname(`/${locale}`) as Locale

  return <FaqPageContent locale={safeLocale} />
}
