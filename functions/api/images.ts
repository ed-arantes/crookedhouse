import { json, d1ListImages, type AdminEnv } from '../_lib/admin'
import { IMAGE_SECTIONS, type ImageSection } from '../../lib/images'

type PagesContext = { request: Request; env: AdminEnv }

export const onRequestGet = async ({ env }: PagesContext): Promise<Response> => {
  const all = await d1ListImages(env.DB)

  const grouped: Record<string, typeof all> = {}
  for (const section of IMAGE_SECTIONS) {
    grouped[section] = all
      .filter((img) => img.section === section)
      .sort((a, b) => a.sort_order - b.sort_order)
  }

  return json(grouped)
}
