/**
 * Mengubah teks bebas menjadi slug URL yang bersih, contoh:
 * "Wisuda & Yudisium 2026" -> "wisuda-dan-yudisium-2026".
 */
export function toSlug(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const slug = value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' dan ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '')
  return slug || undefined
}
