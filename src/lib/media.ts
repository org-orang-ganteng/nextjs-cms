import type { Media } from '@/payload-types'

/** Relasi upload bisa berupa ID (depth 0) atau dokumen; ini memastikan dokumennya ada. */
export function asMedia(value: unknown): Media | null {
  if (value && typeof value === 'object' && 'url' in value && typeof value.url === 'string') {
    return value as Media
  }
  return null
}

export function isImage(media: Media | null): media is Media {
  return Boolean(media?.url && media.mimeType?.startsWith('image/'))
}

export function asDocs<T extends object>(values: Array<number | T> | null | undefined): T[] {
  return (values ?? []).filter((value): value is T => typeof value === 'object' && value !== null)
}

export function formatFileSize(bytes: null | number | undefined): string {
  if (!bytes) return ''
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
