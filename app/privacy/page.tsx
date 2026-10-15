import { PolicyPage } from '@/components/policy-page'
import { defaultLocale } from '@/lib/i18n'

export default function PrivacyPage() {
 return <PolicyPage locale={defaultLocale} kind="privacy" />
}
