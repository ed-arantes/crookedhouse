import {
  json,
  requireAdmin,
  d1ListImages,
  d1ListImagesBySection,
  d1InsertImage,
  d1UpdateImage,
  d1DeleteImage,
  d1ReorderImages,
  d1GetSetting,
  d1SetSetting,
  type AdminEnv,
} from '../../_lib/admin'
import { IMAGE_SECTIONS, type ImageSection } from '../../../lib/images'

type PagesContext = {
  request: Request
  env: AdminEnv
}

// GET — list all images
export const onRequestGet = async ({ request, env }: PagesContext): Promise<Response> => {
  const unauthed = requireAdmin(env, request)
  if (unauthed) return unauthed

  const url = new URL(request.url)
  const section = url.searchParams.get('section')

  if (section && IMAGE_SECTIONS.includes(section as ImageSection)) {
    const images = await d1ListImagesBySection(env.DB, section)
    return json(images)
  }

  const all = await d1ListImages(env.DB)
  return json(all)
}

// POST — upload image to R2 + insert into D1
export const onRequestPost = async ({ request, env }: PagesContext): Promise<Response> => {
  const unauthed = requireAdmin(env, request)
  if (unauthed) return unauthed

  const contentType = request.headers.get('Content-Type') || ''
  if (!contentType.includes('multipart/form-data')) {
    return json({ error: 'Expected multipart/form-data' }, 400)
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const section = formData.get('section') as string | null
  const alt = (formData.get('alt') as string) || ''
  const span = (formData.get('span') as string) || ''

  if (!file || !section) {
    return json({ error: 'Missing file or section' }, 400)
  }

  if (!IMAGE_SECTIONS.includes(section as ImageSection)) {
    return json({ error: `Invalid section: ${section}` }, 400)
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    return json({ error: 'File must be an image' }, 400)
  }

  const id = crypto.randomUUID()
  const ext = file.name.split('.').pop() || 'webp'
  const key = `images/${section}/${id}.${ext}`

  // Upload to R2
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (env.IMAGES as any).put(key, file, {
    httpMetadata: { contentType: file.type },
  })

  // Build public URL from D1 setting (set in admin panel)
  let baseUrl = await d1GetSetting(env.DB, 'r2_base_url', 'https://images.crookedhouse.it')
  baseUrl = baseUrl.replace(/\/+$/, '')
  const url = `${baseUrl}/${key}`

  // Get next sort order for this section
  const existing = await d1ListImagesBySection(env.DB, section)
  const sort_order = existing.length

  await d1InsertImage(env.DB, { id, section, url, alt, span, sort_order })

  return json({ id, section, url, alt, span, sort_order }, 201)
}

// PUT — update image metadata (alt, span, section)
export const onRequestPut = async ({ request, env }: PagesContext): Promise<Response> => {
  const unauthed = requireAdmin(env, request)
  if (unauthed) return unauthed

  const body = await request.json().catch(() => null) as {
    id?: string
    alt?: string
    span?: string
    section?: string
  } | null

  if (!body?.id) {
    return json({ error: 'Missing id' }, 400)
  }

  if (body.section && !IMAGE_SECTIONS.includes(body.section as ImageSection)) {
    return json({ error: `Invalid section: ${body.section}` }, 400)
  }

  await d1UpdateImage(env.DB, body.id, {
    alt: body.alt,
    span: body.span,
    section: body.section,
  })

  return json({ ok: true })
}

// DELETE — remove image from R2 + D1
export const onRequestDelete = async ({ request, env }: PagesContext): Promise<Response> => {
  const unauthed = requireAdmin(env, request)
  if (unauthed) return unauthed

  const url = new URL(request.url)
  const id = url.searchParams.get('id')
  if (!id) return json({ error: 'Missing id' }, 400)

  const deleted = await d1DeleteImage(env.DB, id)
  if (!deleted) return json({ error: 'Image not found' }, 404)

  // Delete from R2 — extract key from URL
  try {
    const r2Url = new URL(deleted.url)
    const key = r2Url.pathname.slice(1) // remove leading /
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (env.IMAGES as any).delete(key)
  } catch {
    // R2 delete failed — image is orphaned in R2 but removed from D1
  }

  return json({ ok: true })
}

// PATCH — reorder images within a section
export const onRequestPatch = async ({ request, env }: PagesContext): Promise<Response> => {
  const unauthed = requireAdmin(env, request)
  if (unauthed) return unauthed

  const body = await request.json().catch(() => null) as {
    section?: string
    orderedIds?: string[]
  } | null

  if (!body?.section || !body?.orderedIds?.length) {
    return json({ error: 'Missing section or orderedIds' }, 400)
  }

  if (!IMAGE_SECTIONS.includes(body.section as ImageSection)) {
    return json({ error: `Invalid section: ${body.section}` }, 400)
  }

  await d1ReorderImages(env.DB, body.section, body.orderedIds)
  const reordered = await d1ListImagesBySection(env.DB, body.section)
  return json(reordered)
}
