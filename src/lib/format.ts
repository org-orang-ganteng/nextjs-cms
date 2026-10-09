import { SITE_TIME_ZONE } from './site'

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'long',
  timeZone: SITE_TIME_ZONE,
})

const timeFormatter = new Intl.DateTimeFormat('id-ID', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: SITE_TIME_ZONE,
})

const dayFormatter = new Intl.DateTimeFormat('id-ID', { day: '2-digit', timeZone: SITE_TIME_ZONE })
const monthFormatter = new Intl.DateTimeFormat('id-ID', {
  month: 'short',
  timeZone: SITE_TIME_ZONE,
})

type DateInput = Date | null | string | undefined

const toDate = (value: DateInput) => (value ? new Date(value) : null)

/** "9 Oktober 2026" */
export function formatDate(value: DateInput): string {
  const date = toDate(value)
  return date ? dateFormatter.format(date) : ''
}

/** "9 Oktober 2026, 08.00 WITA" */
export function formatDateTime(value: DateInput): string {
  const date = toDate(value)
  return date ? `${dateFormatter.format(date)}, ${timeFormatter.format(date)} WITA` : ''
}

/** Rentang waktu agenda; hari yang sama cukup menampilkan jam selesai. */
export function formatEventRange(start: DateInput, end?: DateInput): string {
  const startDate = toDate(start)
  const endDate = toDate(end)
  if (!startDate) return ''
  if (!endDate) return formatDateTime(startDate)
  if (dateFormatter.format(startDate) === dateFormatter.format(endDate)) {
    return `${dateFormatter.format(startDate)}, ${timeFormatter.format(startDate)}–${timeFormatter.format(endDate)} WITA`
  }
  return `${formatDateTime(startDate)} – ${formatDateTime(endDate)}`
}

/** Bagian tanggal untuk lencana kalender: { day: "09", month: "Okt" } */
export function dateBadge(value: DateInput): { day: string; month: string } {
  const date = toDate(value)
  if (!date) return { day: '', month: '' }
  return { day: dayFormatter.format(date), month: monthFormatter.format(date).replace('.', '') }
}

export function getInitials(name: string): string {
  return name
    .replace(/,.*$/, '')
    .split(/\s+/)
    .filter((part) => /^[A-Za-z]/.test(part) && !/\.$/.test(part))
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

/** Nomor WhatsApp lokal (08xx) menjadi format wa.me (628xx). */
export function toWhatsAppNumber(value: null | string | undefined): string {
  const digits = (value ?? '').replace(/\D/g, '')
  if (digits.startsWith('0')) return `62${digits.slice(1)}`
  return digits
}
