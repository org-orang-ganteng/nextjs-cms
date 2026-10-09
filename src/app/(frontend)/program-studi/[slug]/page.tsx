import { BookOpen, Download, GraduationCap, Mail } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { MediaImage } from '@/components/site/MediaImage'
import { PageHeader } from '@/components/site/PageHeader'
import { RichText } from '@/components/site/RichText'
import { getInitials } from '@/lib/format'
import { asMedia, formatFileSize } from '@/lib/media'
import { getProgramBySlug } from '@/lib/queries'
import { richTextToPlain } from '@/lib/richtext'
import { metaFromSeo } from '@/lib/seo'
import { pathFor } from '@/lib/site'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const program = await getProgramBySlug(slug)
  if (!program) return {}
  return metaFromSeo(program.meta, {
    description: program.summary || richTextToPlain(program.description, 160),
    image: program.coverImage,
    path: pathFor('programs', program.slug),
    title: `Program Studi ${program.name}`,
  })
}

function List({
  items,
  ordered = false,
}: {
  items: Array<{ id?: null | string; text: string }>
  ordered?: boolean
}) {
  const Tag = ordered ? 'ol' : 'ul'
  return (
    <Tag
      className={`${ordered ? 'list-decimal' : 'list-disc'} space-y-2 pl-5 text-stone-700 marker:text-brand-700`}
    >
      {items.map((item, index) => (
        <li key={item.id ?? index}>{item.text}</li>
      ))}
    </Tag>
  )
}

export default async function ProgramDetailPage({ params }: Props) {
  const { slug } = await params
  const program = await getProgramBySlug(slug)
  if (!program) notFound()

  const head = typeof program.head === 'object' ? program.head : null
  const curriculumFile = asMedia(program.curriculumFile)
  const missions = program.missions ?? []
  const objectives = program.objectives ?? []
  const profiles = program.graduateProfiles ?? []
  const careers = program.careers ?? []

  return (
    <>
      <PageHeader
        breadcrumbs={[{ href: '/program-studi', label: 'Program Studi' }, { label: program.code }]}
        description={program.summary}
        eyebrow={[program.degree, program.department].filter(Boolean).join(' · ')}
        title={program.name}
      >
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          {program.accreditation && (
            <span className="rounded-full bg-gold-400 px-3 py-1 font-semibold text-brand-950">
              Akreditasi: {program.accreditation}
            </span>
          )}
          <Link className="btn btn-outline-light" href={`/pmb/daftar?prodi=${program.slug}`}>
            Daftar ke prodi ini
          </Link>
        </div>
      </PageHeader>

      <div className="container-site grid gap-10 py-12 md:py-16 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0 space-y-12">
          {program.coverImage && (
            <div className="relative aspect-[16/8] overflow-hidden rounded-2xl">
              <MediaImage
                className="object-cover"
                fill
                preload
                resource={program.coverImage}
                size="hero"
                sizes="(min-width: 1024px) 60vw, 100vw"
              />
            </div>
          )}

          {program.description && (
            <section>
              <h2 className="mb-4 text-2xl font-extrabold text-brand-950">Tentang Program Studi</h2>
              <RichText data={program.description} />
            </section>
          )}

          {(program.vision || missions.length > 0 || objectives.length > 0) && (
            <section>
              <h2 className="mb-4 text-2xl font-extrabold text-brand-950">
                Visi, Misi, dan Tujuan
              </h2>
              {program.vision && (
                <blockquote className="rounded-xl border-l-4 border-gold-400 bg-white p-5 text-lg font-semibold text-brand-900">
                  {program.vision}
                </blockquote>
              )}
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                {missions.length > 0 && (
                  <div>
                    <h3 className="mb-3 font-bold text-stone-900">Misi</h3>
                    <List items={missions} ordered />
                  </div>
                )}
                {objectives.length > 0 && (
                  <div>
                    <h3 className="mb-3 font-bold text-stone-900">Tujuan</h3>
                    <List items={objectives} ordered />
                  </div>
                )}
              </div>
            </section>
          )}

          {(profiles.length > 0 || careers.length > 0) && (
            <section>
              <h2 className="mb-4 text-2xl font-extrabold text-brand-950">
                Profil Lulusan &amp; Prospek Karier
              </h2>
              {profiles.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {profiles.map((profile, index) => (
                    <div className="card p-5" key={profile.id ?? index}>
                      <GraduationCap aria-hidden className="size-6 text-brand-700" />
                      <h3 className="mt-3 font-bold text-stone-900">{profile.title}</h3>
                      {profile.description && (
                        <p className="mt-1.5 text-sm text-stone-600">{profile.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {careers.length > 0 && (
                <div className="mt-6">
                  <h3 className="mb-3 font-bold text-stone-900">Prospek karier</h3>
                  <List items={careers} />
                </div>
              )}
            </section>
          )}

          {(program.curriculum || curriculumFile) && (
            <section>
              <h2 className="mb-4 text-2xl font-extrabold text-brand-950">Kurikulum</h2>
              {program.curriculum && <RichText data={program.curriculum} />}
              {curriculumFile?.url && (
                <a
                  className="btn btn-outline mt-6"
                  href={curriculumFile.url}
                  rel="noopener"
                  target="_blank"
                >
                  <Download aria-hidden className="size-4" />
                  Unduh dokumen kurikulum{' '}
                  {curriculumFile.filesize ? `(${formatFileSize(curriculumFile.filesize)})` : ''}
                </a>
              )}
            </section>
          )}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-32 lg:self-start">
          {head && (
            <div className="card p-6 text-center">
              <p className="eyebrow">Ketua Program Studi</p>
              <div className="relative mx-auto mt-4 size-24 overflow-hidden rounded-full bg-brand-50">
                {head.photo ? (
                  <MediaImage className="object-cover" fill resource={head.photo} sizes="96px" />
                ) : (
                  <span className="flex size-full items-center justify-center text-xl font-bold text-brand-700">
                    {getInitials(head.name)}
                  </span>
                )}
              </div>
              <p className="mt-3 font-bold text-stone-900">{head.name}</p>
              {head.nidn && <p className="text-xs text-stone-500">NIDN {head.nidn}</p>}
            </div>
          )}
          <div className="card space-y-3 p-6 text-sm">
            {program.email && (
              <a
                className="flex items-center gap-2 font-medium text-brand-800 hover:underline"
                href={`mailto:${program.email}`}
              >
                <Mail aria-hidden className="size-4" />
                {program.email}
              </a>
            )}
            {program.journalUrl && (
              <a
                className="flex items-center gap-2 font-medium text-brand-800 hover:underline"
                href={program.journalUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                <BookOpen aria-hidden className="size-4" />
                Jurnal program studi
              </a>
            )}
            <Link className="btn btn-primary w-full" href={`/pmb/daftar?prodi=${program.slug}`}>
              Daftar sekarang
            </Link>
            <Link className="btn btn-outline w-full" href="/dosen-staf">
              Dosen &amp; staf
            </Link>
          </div>
        </aside>
      </div>
    </>
  )
}
