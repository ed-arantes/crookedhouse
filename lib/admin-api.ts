export type Review = {
  id: string
  name: string
  location: string
  text: string
  rating?: number
  source: 'booking' | 'agoda' | 'airbnb'
}

export type BlockedDate = {
  date: string
  reason?: string
}

function getPassword(): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('admin_password') || ''
}

export function setPassword(password: string) {
  localStorage.setItem('admin_password', password)
}

export function clearPassword() {
  localStorage.removeItem('admin_password')
}

function authHeaders(): Record<string, string> {
  return { Authorization: `Bearer ${getPassword()}` }
}

async function adminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { ...authHeaders(), ...init?.headers },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(body.error || res.statusText)
  }
  return res.json()
}

export async function adminLogin(password: string): Promise<boolean> {
  try {
    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (!res.ok) return false
    setPassword(password)
    return true
  } catch {
    return false
  }
}

export function fetchReviews(): Promise<Review[]> {
  return adminFetch('/api/admin/reviews')
}

export function createReview(review: Omit<Review, 'id'>): Promise<Review> {
  return adminFetch('/api/admin/reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(review),
  })
}

export function updateReview(review: Review): Promise<Review> {
  return adminFetch('/api/admin/reviews', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(review),
  })
}

export function deleteReview(id: string): Promise<{ ok: boolean }> {
  return adminFetch(`/api/admin/reviews?id=${id}`, { method: 'DELETE' })
}

export function reorderReviews(ids: string[]): Promise<Review[]> {
  return adminFetch('/api/admin/reviews', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  })
}

export function fetchBlockedDates(): Promise<BlockedDate[]> {
  return adminFetch('/api/admin/blocked-dates')
}

export function addBlockedDates(dates: string[], reason?: string): Promise<BlockedDate[]> {
  return adminFetch('/api/admin/blocked-dates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dates, reason }),
  })
}

export function removeBlockedDate(date: string): Promise<{ ok: boolean }> {
  return adminFetch(`/api/admin/blocked-dates?date=${date}`, { method: 'DELETE' })
}

export function fetchAllContent(): Promise<
  Record<string, Record<string, string | string[]>>
> {
  return adminFetch('/api/admin/content')
}

export function saveContent(locale: string, overrides: Record<string, string | string[]>): Promise<{ ok: boolean }> {
  return adminFetch('/api/admin/content', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ locale, overrides }),
  })
}

export function fetchIcalUrl(): Promise<{ url: string }> {
  return adminFetch('/api/admin/ical')
}

export function saveIcalUrl(url: string): Promise<{ ok: boolean }> {
  return adminFetch('/api/admin/ical', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  })
}
