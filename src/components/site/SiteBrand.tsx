import Image from 'next/image'
import Link from 'next/link'

import type { SiteSetting } from '@/payload-types'
import { cn } from '@/lib/cn'
import { asMedia } from '@/lib/media'

const FALLBACK_LOGO = '/images/logo-stai-morowali.jpg'

/** Logo + nama kampus yang menaut ke beranda. */
export function SiteBrand({
  inverted = false,
  settings,
}: {
  inverted?: boolean
  settings: SiteSetting
}) {
  const logo = asMedia(settings.logo)
  return (
    <Link className="flex min-w-0 items-center gap-3" href="/">
      <Image
        alt={`Logo ${settings.siteName}`}
        className="size-12 shrink-0 rounded-full bg-white object-contain p-0.5"
        height={48}
        preload
        src={logo?.url || FALLBACK_LOGO}
        width={48}
      />
      <span className="min-w-0 leading-tight">
        <span
          className={cn('block text-lg font-extrabold', inverted ? 'text-white' : 'text-brand-900')}
        >
          {settings.siteName}
        </span>
        <span
          className={cn(
            'hidden truncate text-xs sm:block',
            inverted ? 'text-brand-200' : 'text-stone-500',
          )}
        >
          Sekolah Tinggi Agama Islam
        </span>
      </span>
    </Link>
  )
}
