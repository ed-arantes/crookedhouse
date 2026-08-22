import { json, type AdminEnv } from '../../_lib/admin'

type PagesContext = {
  request: Request
  env: AdminEnv
}

export const onRequestGet = async ({ env }: PagesContext): Promise<Response> => {
  const { results } = await (env.DB as any)
    .prepare('SELECT * FROM pricing_rules ORDER BY start_date, priority DESC')
    .all()

  return json(results ?? [])
}
