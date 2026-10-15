import { getLocaleFromPathname, locales, type Locale } from '@/lib/i18n'
import { PolicyPage } from '@/components/policy-page'

export function generateStaticParams() {
 return locales.map((locale) => ({ locale }))
}

export default async function PrivacyPage({
 params,
}: {
 params: Promise<{ locale: string }>
}) {
 const { locale } = await params
 const safeLocale = getLocaleFromPathname(`/${locale}`) as Locale

 return <PolicyPage locale={safeLocale} kind="privacy" />
}
