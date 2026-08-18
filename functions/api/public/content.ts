import { json, d1GetTranslations, type AdminEnv } from '../../_lib/admin'

type PagesContext = { request: Request; env: AdminEnv }

export const onRequestGet = async ({ request, env }: PagesContext): Promise<Response> => {
  const url = new URL(request.url)
  const locale = url.searchParams.get('locale') || 'it'

  const translations = await d1GetTranslations(env.DB, locale)
  return json(translations)
}
