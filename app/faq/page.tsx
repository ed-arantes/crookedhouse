import { FaqPage as FaqPageContent } from '@/components/faq-page'
import { defaultLocale } from '@/lib/i18n'

export default function FaqPage() {
  return <FaqPageContent locale={defaultLocale} />
}
