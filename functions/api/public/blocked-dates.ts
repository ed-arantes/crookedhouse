import { json, kvGet, type AdminEnv } from '../../_lib/admin'

type BlockedDate = { date: string; reason?: string }

const BLOCKED_DATES_KEY = 'blocked_dates'

type PagesContext = { request: Request; env: AdminEnv }

export const onRequestGet = async ({ env }: PagesContext): Promise<Response> => {
  const dates = await kvGet<BlockedDate[]>(env.KV, BLOCKED_DATES_KEY, [])
  return json(dates)
}
