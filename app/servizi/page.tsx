import type { Metadata } from 'next'
import { ServicesDetailsPage } from '@/components/services-details-page'
import { defaultLocale } from '@/lib/i18n'
import { getLocalizedPageMetadata } from '@/lib/seo'

export function generateMetadata(): Metadata {
 return getLocalizedPageMetadata(defaultLocale, 'services')
}

export default function ServicesPage() {
 return <ServicesDetailsPage locale={defaultLocale} />
}