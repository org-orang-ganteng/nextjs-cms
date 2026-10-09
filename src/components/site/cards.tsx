import { ArrowRight, CalendarDays, Images, MapPin, Pin } from 'lucide-react'
import Link from 'next/link'

import type { Announcement, Event, Gallery, Post, Program, Staff } from '@/payload-types'
import { dateBadge, formatDate, formatEventRange, getInitials } from '@/lib/format'
import { ACADEMIC_RANKS, labelFor, POST_CATEGORIES, STAFF_TYPES } from '@/lib/options'
import { pathFor } from '@/lib/site'

import { MediaImage } from './MediaImage'

function CoverPlaceholder({ label }: { label: string }) {
  return (
    <div
      aria-hidden
      className="bg-pattern flex size-full items-center justify-center bg-brand-700 text-3xl font-extrabold text-white/90"
    >
      {label}
    </div>
  )
}

export function PostCard({ post }: { post: Post }) {
  return (
    <article className="card group relative flex flex-col overflow-hidden transition-shadow hover:shadow-md">
      <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
        {post.coverImage ? (
          <MediaImage
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            fill
            resource={post.coverImage}
            size="card"
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
        ) : (
          <CoverPlaceholder label="Berita" />
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="flex flex-wrap items-center gap-x-2 text-xs font-medium text-stone-500">
          <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-brand-800">
            {labelFor(POST_CATEGORIES, post.category)}
          </span>
          {post.publishedAt && (
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          )}
        </p>
        <h3 className="mt-3 text-lg leading-snug font-bold text-stone-900">
          <Link
            className="after:absolute after:inset-0 hover:text-brand-800"
            href={pathFor('posts', post.slug)}
          >
            {post.title}
          </Link>
        </h3>
        {post.excerpt && <p className="mt-2 line-clamp-3 text-sm text-stone-600">{post.excerpt}</p>}
      </div>
    </article>
  )
}

export function AnnouncementItem({ announcement }: { announcement: Announcement }) {
  return (
    <li>
      <Link
        className="group flex items-start gap-4 rounded-xl px-4 py-4 transition-colors hover:bg-brand-50"
        href={pathFor('announcements', announcement.slug)}
      >
        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-gold-100 text-gold-700">
          {announcement.pinned ? (
            <Pin aria-label="Disematkan" className="size-4" />
          ) : (
            <CalendarDays aria-hidden className="size-4" />
          )}
        </span>
        <span className="min-w-0">
          <span className="block font-semibold text-stone-900 group-hover:text-brand-800">
            {announcement.title}
          </span>
          {announcement.publishedAt && (
            <time className="mt-1 block text-xs text-stone-500" dateTime={announcement.publishedAt}>
              {formatDate(announcement.publishedAt)}
            </time>
          )}
        </span>
      </Link>
    </li>
  )
}

export function EventCard({ event }: { event: Event }) {
  const badge = dateBadge(event.startDate)
  return (
    <article className="card relative flex gap-4 p-5 transition-shadow hover:shadow-md">
      <div className="flex size-16 shrink-0 flex-col items-center justify-center rounded-xl bg-brand-700 text-white">
        <span className="text-2xl leading-none font-extrabold">{badge.day}</span>
        <span className="mt-1 text-xs font-semibold tracking-wide text-gold-300 uppercase">
          {badge.month}
        </span>
      </div>
      <div className="min-w-0">
        <h3 className="leading-snug font-bold text-stone-900">
          <Link
            className="after:absolute after:inset-0 hover:text-brand-800"
            href={pathFor('events', event.slug)}
          >
            {event.title}
          </Link>
        </h3>
        <p className="mt-1.5 text-sm text-stone-600">
          {formatEventRange(event.startDate, event.endDate)}
        </p>
        {event.location && (
          <p className="mt-1 flex items-center gap-1.5 text-sm text-stone-500">
            <MapPin aria-hidden className="size-3.5" />
            {event.location}
          </p>
        )}
      </div>
    </article>
  )
}

export function ProgramCard({ program }: { program: Program }) {
  return (
    <article className="card group relative flex flex-col overflow-hidden transition-shadow hover:shadow-md">
      <div className="relative aspect-[16/9] overflow-hidden">
        {program.coverImage ? (
          <MediaImage
            className="object-cover"
            fill
            resource={program.coverImage}
            size="card"
            sizes="(min-width: 1024px) 25vw, 50vw"
          />
        ) : (
          <CoverPlaceholder label={program.code} />
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="eyebrow">
          {program.degree} · {program.code}
        </p>
        <h3 className="mt-2 text-lg leading-snug font-bold text-stone-900">
          <Link
            className="after:absolute after:inset-0 hover:text-brand-800"
            href={pathFor('programs', program.slug)}
          >
            {program.name}
          </Link>
        </h3>
        {program.summary && <p className="mt-2 text-sm text-stone-600">{program.summary}</p>}
        <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-brand-700">
          Lihat program studi{' '}
          <ArrowRight
            aria-hidden
            className="size-4 transition-transform group-hover:translate-x-0.5"
          />
        </span>
      </div>
    </article>
  )
}

export function StaffCard({ person }: { person: Staff }) {
  const program = typeof person.program === 'object' ? person.program : null
  return (
    <article className="card flex h-full flex-col items-center p-6 text-center">
      <div className="relative size-28 overflow-hidden rounded-full bg-brand-50 ring-4 ring-brand-50">
        {person.photo ? (
          <MediaImage
            className="object-cover"
            fill
            resource={person.photo}
            size="thumbnail"
            sizes="112px"
          />
        ) : (
          <span
            aria-hidden
            className="flex size-full items-center justify-center text-2xl font-bold text-brand-700"
          >
            {getInitials(person.name)}
          </span>
        )}
      </div>
      <h3 className="mt-4 leading-snug font-bold text-stone-900">{person.name}</h3>
      <p className="mt-1 text-sm text-brand-700">
        {person.position || labelFor(STAFF_TYPES, person.type)}
      </p>
      <dl className="mt-3 space-y-1 text-xs text-stone-600">
        {program && (
          <div>
            <dt className="sr-only">Program studi</dt>
            <dd>{program.name}</dd>
          </div>
        )}
        {person.nidn && (
          <div>
            <dt className="inline">NIDN: </dt>
            <dd className="inline">{person.nidn}</dd>
          </div>
        )}
        {person.academicRank && (
          <div>
            <dt className="sr-only">Jabatan fungsional</dt>
            <dd>{labelFor(ACADEMIC_RANKS, person.academicRank)}</dd>
          </div>
        )}
        {person.expertise && (
          <div>
            <dt className="inline">Keahlian: </dt>
            <dd className="inline">{person.expertise}</dd>
          </div>
        )}
      </dl>
      {(person.sintaUrl || person.scholarUrl || person.email) && (
        <div className="mt-auto flex flex-wrap justify-center gap-2 pt-4 text-xs font-semibold">
          {person.sintaUrl && (
            <a
              className="rounded-full bg-stone-100 px-3 py-1 hover:bg-brand-50 hover:text-brand-800"
              href={person.sintaUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              SINTA
            </a>
          )}
          {person.scholarUrl && (
            <a
              className="rounded-full bg-stone-100 px-3 py-1 hover:bg-brand-50 hover:text-brand-800"
              href={person.scholarUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              Scholar
            </a>
          )}
          {person.email && (
            <a
              className="rounded-full bg-stone-100 px-3 py-1 hover:bg-brand-50 hover:text-brand-800"
              href={`mailto:${person.email}`}
            >
              Email
            </a>
          )}
        </div>
      )}
    </article>
  )
}

export function GalleryCard({ gallery }: { gallery: Gallery }) {
  const photoCount = gallery.photos?.length ?? 0
  const videoCount = gallery.videos?.length ?? 0
  const firstPhoto = gallery.photos?.[0]
  return (
    <article className="card group relative overflow-hidden">
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
        {gallery.coverImage || firstPhoto ? (
          <MediaImage
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            fill
            resource={gallery.coverImage || firstPhoto}
            size="card"
            sizes="(min-width: 1024px) 33vw, 50vw"
          />
        ) : (
          <CoverPlaceholder label="Galeri" />
        )}
      </div>
      <div className="p-5">
        <h3 className="leading-snug font-bold text-stone-900">
          <Link
            className="after:absolute after:inset-0 hover:text-brand-800"
            href={pathFor('galleries', gallery.slug)}
          >
            {gallery.title}
          </Link>
        </h3>
        <p className="mt-2 flex items-center gap-2 text-xs text-stone-500">
          <Images aria-hidden className="size-3.5" />
          {photoCount} foto{videoCount > 0 ? ` · ${videoCount} video` : ''}
          {gallery.date && <span>· {formatDate(gallery.date)}</span>}
        </p>
      </div>
    </article>
  )
}
