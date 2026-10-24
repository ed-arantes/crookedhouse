import type { Metadata } from 'next'
import { getLocaleFromPathname, locales, type Locale } from '@/lib/i18n'
import { PolicyPage } from '@/components/policy-page'
import { getLocalizedPageMetadata } from '@/lib/seo'

export function generateStaticParams() {
 return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
 params,
}: {
 params: Promise<{ locale: string }>
}): Promise<Metadata> {
 const { locale } = await params
 return getLocalizedPageMetadata(getLocaleFromPathname(`/${locale}`), 'privacy')
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
