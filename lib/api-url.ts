const configuredApiBase = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ?? ''

export function apiUrl(path: string): string {
  return `${configuredApiBase}${path}`
}

export const usesRemoteApi = configuredApiBase.length > 0

