export type ImageItem = {
  id: string
  section: string
  url: string
  alt: string
  span: string
  sort_order: number
}

export const IMAGE_SECTIONS = ['hero', 'gallery', 'apartment', 'layout', 'services', 'location', 'explore'] as const
export type ImageSection = (typeof IMAGE_SECTIONS)[number]
