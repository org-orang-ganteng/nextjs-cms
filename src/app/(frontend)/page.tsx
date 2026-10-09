import {
  ArrowRight,
  Award,
  BookOpen,
  ClipboardList,
  GraduationCap,
  Landmark,
  Quote,
  Users,
} from 'lucide-react'
import Link from 'next/link'

import { StatsView } from '@/components/blocks/RenderBlocks'
import { AnnouncementItem, EventCard, PostCard, ProgramCard } from '@/components/site/cards'
import { HeroCarousel, type HeroSlide } from '@/components/site/HeroCarousel'
import { MediaImage } from '@/components/site/MediaImage'
import { toNavLink } from '@/components/site/nav'
import { SectionHeading } from '@/components/site/SectionHeading'
import { SmartLink } from '@/components/site/SmartLink'
import { asMedia, isImage } from '@/lib/media'
import { richTextToPlain } from '@/lib/richtext'
import {
  getAnnouncements,
  getCampusProfile,
  getEvents,
  getHomepage,
  getPmbInfo,
  getPosts,
  getPrograms,
  getSiteSettings,
} from '@/lib/queries'

const HIGHLIGHT_ICONS = [GraduationCap, ClipboardList, BookOpen, Users, Award, Landmark]

export default async function HomePage() {
  const [home, settings, profile, pmb, programs] = await Promise.all([
    getHomepage(),
    getSiteSettings(),
    getCampusProfile(),
    getPmbInfo(),
    getPrograms(),
  ])
  const [posts, announcements, events] = await Promise.all([
    home.newsLimit === 0 ? null : getPosts({ limit: home.newsLimit ?? 3 }),
    home.announcementLimit === 0 ? null : getAnnouncements({ limit: home.announcementLimit ?? 5 }),
    home.eventLimit === 0 ? null : getEvents({ limit: home.eventLimit ?? 3, when: 'upcoming' }),
  ])

  const slides: HeroSlide[] = (home.slides ?? []).map((slide) => {
    const image = asMedia(slide.image)
    return {
      image: isImage(image)
        ? {
            alt: image.alt ?? '',
            position: `${image.focalX ?? 50}% ${image.focalY ?? 50}%`,
            src: image.sizes?.hero?.url || image.url!,
          }
        : null,
      primary: toNavLink(slide.primaryButton),
      secondary: toNavLink(slide.secondaryButton),
      subtitle: slide.subtitle ?? null,
      title: slide.title,
    }
  })
  if (slides.length === 0) {
    slides.push({
      image: null,
      primary: { label: 'Info PMB', newTab: false, url: '/pmb' },
      secondary: { label: 'Program Studi', newTab: false, url: '/program-studi' },
      subtitle: settings.tagline ?? null,
      title: `Selamat Datang di ${settings.siteName}`,
    })
  }

  const highlights = home.highlights ?? []
  const leaderPhoto = asMedia(profile.leaderPhoto)
  const greeting = richTextToPlain(profile.greeting, 320)

  return (
    <>
      <h1 className="sr-only">{settings.fullName || settings.siteName}</h1>
      <HeroCarousel slides={slides} />

      {highlights.length > 0 && (
        <section aria-label="Sorotan" className="relative z-10 -mt-16 md:-mt-20">
          <div className="container-site grid gap-4 md:grid-cols-3">
            {highlights.map((item, index) => {
              const Icon = HIGHLIGHT_ICONS[index % HIGHLIGHT_ICONS.length]!
              const body = (
                <>
                  <span className="flex size-11 items-center justify-center rounded-xl bg-brand-700 text-gold-300">
                    <Icon aria-hidden className="size-5" />
                  </span>
                  <span className="mt-4 block text-lg font-bold text-stone-900">{item.title}</span>
                  {item.description && (
                    <span className="mt-1.5 block text-sm text-stone-600">{item.description}</span>
                  )}
                  {item.url && (
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
                      Selengkapnya{' '}
                      <ArrowRight
                        aria-hidden
                        className="size-4 transition-transform group-hover:translate-x-0.5"
                      />
                    </span>
                  )}
                </>
              )
              return item.url ? (
                <SmartLink
                  className="card group block p-6 transition-shadow hover:shadow-lg"
                  href={item.url}
                  key={item.id ?? index}
                >
                  {body}
                </SmartLink>
              ) : (
                <div className="card p-6" key={item.id ?? index}>
                  {body}
                </div>
              )
            })}
          </div>
        </section>
      )}

      <StatsView items={home.stats} />

      {programs.length > 0 && (
        <section className="py-14 md:py-20">
          <div className="container-site">
            <SectionHeading
              action={
                <Link className="btn btn-outline" href="/program-studi">
                  Semua program studi
                </Link>
              }
              eyebrow="Akademik"
              title="Program Studi"
            />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {programs.map((program) => (
                <ProgramCard key={program.id} program={program} />
              ))}
            </div>
          </div>
        </section>
      )}

      {posts?.docs.length || announcements?.docs.length ? (
        <section className="bg-white py-14 md:py-20">
          <div className="container-site grid gap-10 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <SectionHeading
                action={
                  <Link className="btn btn-outline" href="/berita">
                    Semua berita
                  </Link>
                }
                eyebrow="Informasi"
                title="Berita Terbaru"
              />
              {posts?.docs.length ? (
                <div className="grid gap-6 sm:grid-cols-2">
                  {posts.docs.slice(0, 4).map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <p className="text-stone-500">Belum ada berita.</p>
              )}
            </div>
            <div>
              <SectionHeading eyebrow="Penting" title="Pengumuman" />
              <div className="card p-2">
                {announcements?.docs.length ? (
                  <ul className="divide-y divide-stone-100">
                    {announcements.docs.map((announcement) => (
                      <AnnouncementItem announcement={announcement} key={announcement.id} />
                    ))}
                  </ul>
                ) : (
                  <p className="p-4 text-sm text-stone-500">Belum ada pengumuman.</p>
                )}
                <Link
                  className="mt-1 flex items-center justify-center gap-1 rounded-lg px-4 py-3 text-sm font-semibold text-brand-700 hover:bg-brand-50"
                  href="/pengumuman"
                >
                  Lihat semua pengumuman <ArrowRight aria-hidden className="size-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {events?.docs.length ? (
        <section className="py-14 md:py-20">
          <div className="container-site">
            <SectionHeading
              action={
                <Link className="btn btn-outline" href="/agenda">
                  Semua agenda
                </Link>
              }
              eyebrow="Kalender kegiatan"
              title="Agenda Mendatang"
            />
            <div className="grid gap-4 md:grid-cols-3">
              {events.docs.map((event) => (
                <EventCard event={event} key={event.id} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {profile.leaderName && (
        <section className="bg-white py-14 md:py-20">
          <div className="container-site grid items-center gap-10 md:grid-cols-[auto_1fr]">
            <div className="relative mx-auto size-48 overflow-hidden rounded-full bg-brand-50 ring-8 ring-brand-50 md:size-56">
              {isImage(leaderPhoto) ? (
                <MediaImage className="object-cover" fill resource={leaderPhoto} sizes="224px" />
              ) : (
                <Quote aria-hidden className="absolute inset-0 m-auto size-16 text-brand-200" />
              )}
            </div>
            <div className="max-w-2xl">
              <p className="eyebrow">Sambutan Ketua</p>
              <h2 className="mt-3 text-2xl leading-snug font-bold text-brand-950 md:text-3xl">
                {profile.leaderTitle || `Ketua ${settings.siteName}`}
              </h2>
              {greeting && <p className="mt-4 text-stone-700">{greeting}</p>}
              <p className="mt-4 font-semibold text-stone-900">{profile.leaderName}</p>
              <Link className="btn btn-outline mt-6" href="/profil#sambutan">
                Baca sambutan lengkap
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="py-14 md:py-20">
        <div className="container-site grid gap-6 lg:grid-cols-2">
          <div className="bg-pattern flex flex-col rounded-2xl bg-brand-800 p-8 text-white md:p-10">
            <p className="text-sm font-semibold tracking-wide text-gold-300">
              {pmb.isOpen
                ? `Pendaftaran dibuka${pmb.wave ? ` · ${pmb.wave}` : ''}`
                : 'Penerimaan Mahasiswa Baru'}
            </p>
            <h2 className="mt-3 text-2xl font-extrabold md:text-3xl">
              PMB {pmb.academicYear ? `Tahun Akademik ${pmb.academicYear}` : settings.siteName}
            </h2>
            <p className="mt-3 text-brand-100">
              {pmb.isOpen
                ? 'Isi formulir pendaftaran awal secara online, lalu panitia akan menghubungi Anda.'
                : pmb.closedMessage}
            </p>
            <div className="mt-auto flex flex-wrap gap-3 pt-8">
              {pmb.isOpen && (
                <Link className="btn btn-gold" href="/pmb/daftar">
                  Daftar sekarang
                </Link>
              )}
              <Link className="btn btn-outline-light" href="/pmb">
                Info PMB
              </Link>
            </div>
          </div>
          <div className="flex flex-col rounded-2xl border border-gold-300 bg-gold-50 p-8 md:p-10">
            <p className="text-sm font-semibold tracking-wide text-gold-700">Publikasi ilmiah</p>
            <h2 className="mt-3 text-2xl font-extrabold text-brand-950 md:text-3xl">
              {home.journalCta?.title || 'Rumah Jurnal'}
            </h2>
            <p className="mt-3 text-stone-700">
              {home.journalCta?.text || settings.journalDescription}
            </p>
            <div className="mt-auto pt-8">
              <a className="btn btn-primary" href="/jurnal" rel="noopener" target="_blank">
                {home.journalCta?.buttonLabel || 'Kunjungi Rumah Jurnal'}
                <ArrowRight aria-hidden className="size-4" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
