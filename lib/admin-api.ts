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
  const res = await fetch(apiUrl(path), {
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
    const res = await fetch(apiUrl('/api/admin/auth'), {
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

// ---------------------------------------------------------------------------
// Images
// ---------------------------------------------------------------------------

export type AdminImage = {
  id: string
  section: string
  url: string
  alt: string
  span: string
  sort_order: number
}

export function fetchAllImages(): Promise<AdminImage[]> {
  return adminFetch('/api/admin/images')
}

export function uploadImage(file: File, section: string, alt: string, span?: string): Promise<AdminImage> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('section', section)
  formData.append('alt', alt)
  if (span) formData.append('span', span)

  return adminFetch('/api/admin/images', {
    method: 'POST',
    body: formData,
  })
}

export function updateImage(id: string, fields: { alt?: string; span?: string; section?: string }): Promise<{ ok: boolean }> {
  return adminFetch('/api/admin/images', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...fields }),
  })
}

export function deleteImage(id: string): Promise<{ ok: boolean }> {
  return adminFetch(`/api/admin/images?id=${id}`, { method: 'DELETE' })
}

export function reorderImages(section: string, orderedIds: string[]): Promise<AdminImage[]> {
  return adminFetch('/api/admin/images', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ section, orderedIds }),
  })
}

export function fetchR2BaseUrl(): Promise<{ url: string }> {
  return adminFetch('/api/admin/images/settings')
}

export function saveR2BaseUrl(url: string): Promise<{ ok: boolean }> {
  return adminFetch('/api/admin/images/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  })
}

// ---------------------------------------------------------------------------
// Bookings
// ---------------------------------------------------------------------------

export type AdminBooking = {
  id: string
  session_id: string
  first_name: string
  last_name: string
  email: string
  check_in: string
  check_out: string
  nights: number
  adults: number
  children: number
  pets: number
  message: string
  total_price: number
  status: string
  created_at: string
}

export function fetchBookings(status?: string): Promise<AdminBooking[]> {
  const qs = status ? `?status=${status}` : ''
  return adminFetch(`/api/admin/bookings${qs}`)
}

export function updateBookingStatus(id: string, status: string): Promise<{ ok: boolean }> {
  return adminFetch('/api/admin/bookings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, status }),
  })
}

export function deleteBooking(id: string): Promise<{ ok: boolean }> {
  return adminFetch(`/api/admin/bookings?id=${id}`, { method: 'DELETE' })
}

// ---------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------

export type AnalyticsData = {
  byDay: { day: string; count: number }[]
  topPages: { path: string; count: number }[]
  topReferrers: { referrer: string; count: number }[]
  topCountries: { country: string; count: number }[]
  total: { total: number; unique_visitors: number }
}

export function fetchAnalytics(range = '30'): Promise<AnalyticsData> {
  return adminFetch(`/api/admin/analytics?range=${range}`)
}

import { apiUrl } from '@/lib/api-url'
