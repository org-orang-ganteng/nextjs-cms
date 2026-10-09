import type { Metadata } from 'next'

import { EmptyState } from '@/components/site/EmptyState'
import { MediaImage } from '@/components/site/MediaImage'
import { PageHeader } from '@/components/site/PageHeader'
import { RichText } from '@/components/site/RichText'
import { asMedia, isImage } from '@/lib/media'
import { getCampusProfile, getSiteSettings } from '@/lib/queries'
import { metaFromSeo } from '@/lib/seo'

const SECTIONS = [
  { id: 'sejarah', label: 'Sejarah' },
  { id: 'visi-misi', label: 'Visi & Misi' },
  { id: 'sambutan', label: 'Sambutan Ketua' },
  { id: 'struktur-organisasi', label: 'Struktur Organisasi' },
]

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getCampusProfile()
  return metaFromSeo(profile.meta, {
    description: 'Sejarah, visi dan misi, sambutan ketua, serta struktur organisasi STAI Morowali.',
    path: '/profil',
    title: 'Profil Kampus',
  })
}

export default async function ProfilePage() {
  const [profile, settings] = await Promise.all([getCampusProfile(), getSiteSettings()])
  const leaderPhoto = asMedia(profile.leaderPhoto)
  const structureImage = asMedia(profile.structureImage)

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: 'Profil' }]}
        description={`Mengenal lebih dekat ${settings.fullName || settings.siteName}.`}
        title="Profil Kampus"
      />

      <div className="container-site grid gap-10 py-12 md:py-16 lg:grid-cols-[14rem_1fr]">
        <nav aria-label="Bagian profil" className="lg:sticky lg:top-32 lg:self-start">
          <ul className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">
            {SECTIONS.map((section) => (
              <li className="shrink-0" key={section.id}>
                <a
                  className="block rounded-lg px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-brand-50 hover:text-brand-800"
                  href={`#${section.id}`}
                >
                  {section.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0 space-y-16">
          <section aria-labelledby="judul-sejarah" id="sejarah">
            <h2 className="mb-6 text-2xl font-extrabold text-brand-950" id="judul-sejarah">
              Sejarah
            </h2>
            {profile.history ? (
              <RichText data={profile.history} />
            ) : (
              <EmptyState title="Sejarah kampus belum diisi." />
            )}
          </section>

          <section aria-labelledby="judul-visi" id="visi-misi">
            <h2 className="mb-6 text-2xl font-extrabold text-brand-950" id="judul-visi">
              Visi &amp; Misi
            </h2>
            {profile.vision && (
              <div className="bg-pattern rounded-2xl bg-brand-800 p-8 text-white">
                <p className="text-sm font-semibold tracking-wide text-gold-300 uppercase">Visi</p>
                <p className="mt-3 text-lg leading-relaxed font-semibold md:text-xl">
                  {profile.vision}
                </p>
              </div>
            )}
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {(profile.missions ?? []).length > 0 && (
                <div className="card p-6">
                  <h3 className="font-bold text-brand-900">Misi</h3>
                  <ol className="mt-4 list-decimal space-y-2 pl-5 text-stone-700 marker:font-semibold marker:text-brand-700">
                    {profile.missions!.map((item, index) => (
                      <li key={item.id ?? index}>{item.text}</li>
                    ))}
                  </ol>
                </div>
              )}
              {(profile.goals ?? []).length > 0 && (
                <div className="card p-6">
                  <h3 className="font-bold text-brand-900">Tujuan</h3>
                  <ol className="mt-4 list-decimal space-y-2 pl-5 text-stone-700 marker:font-semibold marker:text-brand-700">
                    {profile.goals!.map((item, index) => (
                      <li key={item.id ?? index}>{item.text}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </section>

          <section aria-labelledby="judul-sambutan" id="sambutan">
            <h2 className="mb-6 text-2xl font-extrabold text-brand-950" id="judul-sambutan">
              Sambutan Ketua
            </h2>
            <div className="card grid gap-8 p-6 md:grid-cols-[12rem_1fr] md:p-8">
              <div>
                <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-brand-50">
                  {isImage(leaderPhoto) && (
                    <MediaImage
                      className="object-cover"
                      fill
                      resource={leaderPhoto}
                      sizes="192px"
                    />
                  )}
                </div>
                {profile.leaderName && (
                  <p className="mt-4 font-bold text-stone-900">{profile.leaderName}</p>
                )}
                {profile.leaderTitle && (
                  <p className="text-sm text-stone-600">{profile.leaderTitle}</p>
                )}
              </div>
              {profile.greeting ? (
                <RichText data={profile.greeting} />
              ) : (
                <p className="text-stone-500">Sambutan belum diisi.</p>
              )}
            </div>
          </section>

          <section aria-labelledby="judul-struktur" id="struktur-organisasi">
            <h2 className="mb-6 text-2xl font-extrabold text-brand-950" id="judul-struktur">
              Struktur Organisasi
            </h2>
            {isImage(structureImage) && (
              <a className="block" href={structureImage.url!} rel="noopener" target="_blank">
                <MediaImage
                  className="h-auto w-full rounded-2xl border border-stone-200 bg-white"
                  resource={structureImage}
                />
              </a>
            )}
            {(profile.officials ?? []).length > 0 ? (
              <div className="card mt-6 overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-brand-50 text-brand-900">
                    <tr>
                      <th className="px-5 py-3 font-semibold" scope="col">
                        Jabatan
                      </th>
                      <th className="px-5 py-3 font-semibold" scope="col">
                        Nama
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {profile.officials!.map((official, index) => (
                      <tr key={official.id ?? index}>
                        <td className="px-5 py-3 text-stone-600">{official.position}</td>
                        <td className="px-5 py-3 font-medium text-stone-900">{official.name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              !isImage(structureImage) && <EmptyState title="Struktur organisasi belum diisi." />
            )}
          </section>
        </div>
      </div>
    </>
  )
}
