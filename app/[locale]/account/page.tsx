import { GuestAccount } from '@/components/guest-account'
import { getLocaleFromPathname, locales, type Locale } from '@/lib/i18n'

export function generateStaticParams() {
 return locales.map((locale) => ({ locale }))
}

export default async function AccountPage({
 params,
}: {
 params: Promise<{ locale: string }>
}) {
 const { locale } = await params
 const safeLocale = getLocaleFromPathname(`/${locale}`) as Locale
 return <GuestAccount locale={safeLocale} />
}
