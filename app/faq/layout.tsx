import type { Metadata } from 'next'
import { getFaqMetadata } from '@/lib/seo'

export const metadata: Metadata = getFaqMetadata()

export default function FaqLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children
}
