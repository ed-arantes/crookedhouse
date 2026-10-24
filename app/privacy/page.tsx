import type { Metadata } from 'next'
import { PolicyPage } from '@/components/policy-page'
import { defaultLocale } from '@/lib/i18n'
import { getLocalizedPageMetadata } from '@/lib/seo'

export function generateMetadata(): Metadata {
 return getLocalizedPageMetadata(defaultLocale, 'privacy')
}

export default function PrivacyPage() {
 return <PolicyPage locale={defaultLocale} kind="privacy" />
}
