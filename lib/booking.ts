export const NIGHTLY_RATE = 95
export const COUNCIL_TAX_PER_PERSON_PER_NIGHT = 2

export const MONTHS = [
 'January',
 'February',
 'March',
 'April',
 'May',
 'June',
 'July',
 'August',
 'September',
 'October',
 'November',
 'December',
]

export const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

/** Strip time so day comparisons are stable. */
export function startOfDay(date: Date): Date {
 const d = new Date(date)
 d.setHours(0, 0, 0, 0)
 return d
}

export function isSameDay(a: Date | null, b: Date | null): boolean {
 if (!a || !b) return false
 return (
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate()
 )
}

export function isBefore(a: Date, b: Date): boolean {
 return startOfDay(a).getTime() < startOfDay(b).getTime()
}

export function isBetween(day: Date, start: Date | null, end: Date | null): boolean {
 if (!start || !end) return false
 const t = startOfDay(day).getTime()
 return t > startOfDay(start).getTime() && t < startOfDay(end).getTime()
}

export function addMonths(date: Date, count: number): Date {
 const d = new Date(date)
 d.setMonth(d.getMonth() + count)
 return d
}

export function nightsBetween(start: Date | null, end: Date | null): number {
 if (!start || !end) return 0
 const ms = startOfDay(end).getTime() - startOfDay(start).getTime()
 return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)))
}

export function formatShort(date: Date | null, locale: string = 'en'): string {
 if (!date) return ''
 return date.toLocaleDateString(locale, {
  month: 'short',
  day: 'numeric',
 })
}

export function formatLong(date: Date | null, locale: string = 'en'): string {
 if (!date) return ''
 return date.toLocaleDateString(locale, {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  year: 'numeric',
 })
}

export function formatCurrency(amount: number): string {
 return amount.toLocaleString('en-IE', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
 })
}

export type PriceBreakdown = {
 nights: number
 subtotal: number
 councilTax: number
 total: number
}

export function priceBreakdown(nights: number, guests: number): PriceBreakdown {
 const subtotal = nights * NIGHTLY_RATE
 const councilTax = nights * guests * COUNCIL_TAX_PER_PERSON_PER_NIGHT
 return {
  nights,
  subtotal,
  councilTax,
  total: subtotal + councilTax,
 }
}

/** Build the grid of days for a given month, padded with nulls for alignment. */
export function buildMonthGrid(year: number, month: number): (Date | null)[] {
 const first = new Date(year, month, 1)
 // JavaScript returns Sunday as 0; convert to a Monday-first index.
 const startWeekday = (first.getDay() + 6) % 7
 const daysInMonth = new Date(year, month + 1, 0).getDate()
 const cells: (Date | null)[] = []
 for (let i = 0; i < startWeekday; i++) cells.push(null)
 for (let day = 1; day <= daysInMonth; day++) {
  cells.push(new Date(year, month, day))
 }
 return cells
}
