import { json, type AdminEnv } from '../../_lib/admin'

type PagesContext = {
  request: Request
  env: AdminEnv
}

export const onRequestGet = async ({ env }: PagesContext): Promise<Response> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { results } = await (env.DB as any)
    .prepare('SELECT * FROM pricing_rules ORDER BY start_date, priority DESC')
    .all()

  return json((results ?? []).map((rule: Record<string, unknown>) => ({
    ...rule,
    price_per_night: Number(rule.price_per_night ?? 0) / 100,
  })))
}
