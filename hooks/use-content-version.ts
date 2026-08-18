'use client'

import { useSyncExternalStore } from 'react'
import { subscribeToContentChanges, getContentVersion } from '@/lib/i18n'

export function useContentVersion(): number {
  return useSyncExternalStore(subscribeToContentChanges, getContentVersion, getContentVersion)
}
