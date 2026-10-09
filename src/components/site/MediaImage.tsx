import Image from 'next/image'

import { asMedia, isImage } from '@/lib/media'

type Props = {
  alt?: string
  className?: string
  /** Isi penuh kontainer induk (induk wajib `relative` dan punya ukuran). */
  fill?: boolean
  preload?: boolean
  resource: unknown
  size?: 'card' | 'hero' | 'thumbnail'
  sizes?: string
}

/** Gambar dari koleksi Media; tidak merender apa pun bila bukan gambar. */
export function MediaImage({ alt, className, fill, preload, resource, size, sizes }: Props) {
  const media = asMedia(resource)
  if (!isImage(media) || !media.url) return null

  const variant = size ? media.sizes?.[size] : undefined
  const src = variant?.url || media.url
  const altText = alt ?? media.alt ?? ''

  if (fill) {
    return (
      <Image
        alt={altText}
        className={className}
        fill
        preload={preload}
        sizes={sizes ?? '100vw'}
        src={src}
        style={{ objectPosition: `${media.focalX ?? 50}% ${media.focalY ?? 50}%` }}
      />
    )
  }

  return (
    <Image
      alt={altText}
      className={className}
      height={variant?.height || media.height || 800}
      preload={preload}
      sizes={sizes}
      src={src}
      width={variant?.width || media.width || 1200}
    />
  )
}
