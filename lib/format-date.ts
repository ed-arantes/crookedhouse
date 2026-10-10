export function formatEU(iso: string): string {
  if (!iso || iso.length < 10) return iso
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export function formatDateTimeEU(value: string): string {
  if (!value) return value
  const [date, time] = value.replace('T', ' ').split(' ')
  const formattedDate = formatEU(date)
  return time ? `${formattedDate} ${time.slice(0, 5)}` : formattedDate
}

export function parseEUDate(value: string): string | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim())
  if (!match) return null
  const [, day, month, year] = match
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)))
  if (date.getUTCDate() !== Number(day) ||
    date.getUTCMonth() !== Number(month) - 1 ||
    date.getUTCFullYear() !== Number(year)) return null
  return `${year}-${month}-${day}`
}
