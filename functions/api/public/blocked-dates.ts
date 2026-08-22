import { json, d1ListBlockedDates, type AdminEnv } from '../../_lib/admin'

type PagesContext = { request: Request; env: AdminEnv }

export const onRequestGet = async ({ env }: PagesContext): Promise<Response> => {
  const dates = await d1ListBlockedDates(env.DB)
  return json(dates)
}
