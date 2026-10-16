import { d1GetSetting } from './admin'

export type ICalSource = 'airbnb' | 'booking'

export type ICalFeed = {
  source: ICalSource
  url: string
}

const ICAL_SETTINGS: Array<{ source: ICalSource; key: string }> = [
  { source: 'airbnb', key: 'airbnb_ical_url' },
  { source: 'booking', key: 'ical_url' },
]

export async function getICalFeeds(db: Record<string, unknown>): Promise<ICalFeed[]> {
  const urls = await Promise.all(
    ICAL_SETTINGS.map(({ key }) => d1GetSetting(db, key, '')),
  )

  return ICAL_SETTINGS.flatMap(({ source }, index) => {
    const url = urls[index].trim()
    return url ? [{ source, url }] : []
  })
}

export async function fetchICalFeed(url: string): Promise<string> {
  const response = await fetch(url, { signal: AbortSignal.timeout(8000) })
  if (!response.ok) throw new Error(`iCal feed returned HTTP ${response.status}`)
  return response.text()
}
