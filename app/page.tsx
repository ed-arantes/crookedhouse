import type { Metadata } from 'next'
import { getHomeMetadata } from '@/lib/seo'
import LocalePage from './[locale]/page'

export function generateMetadata(): Metadata {
 return {
  ...getHomeMetadata('it'),
  title: 'Casa vacanze sul Lago di Como | Crooked House',
 }
}

export default function Page() {
 return <LocalePage params={Promise.resolve({ locale: 'it' })} />
}
