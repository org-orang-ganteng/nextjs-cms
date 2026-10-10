import {
  CalendarDays,
  ClipboardList,
  Download,
  FileText,
  MessageCircle,
  Wallet,
} from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { FormAlert } from '@/components/forms/fields'
import { PageHeader } from '@/components/site/PageHeader'
import { RichText } from '@/components/site/RichText'
import { toWhatsAppNumber } from '@/lib/format'
import { asDocs, formatFileSize } from '@/lib/media'
import { getPmbInfo } from '@/lib/queries'
import { metaFromSeo } from '@/lib/seo'
import type { Media } from '@/payload-types'

export async function generateMetadata(): Promise<Metadata> {
  const pmb = await getPmbInfo()
  return metaFromSeo(pmb.meta, {
    description:
      'Informasi Penerimaan Mahasiswa Baru (PMB) STAI Morowali: jadwal, persyaratan, biaya, dan pendaftaran online.',
    path: '/pmb',
    title: 'Penerimaan Mahasiswa Baru',
  })
}

export default async function PmbPage() {
  const pmb = await getPmbInfo()
  const downloads = asDocs<Media>(pmb.downloads).filter((file) => file.url)
  const requirements = pmb.requirements ?? []
  const schedule = pmb.schedule ?? []
  const fees = pmb.fees ?? []
  const contacts = pmb.contacts ?? []

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: 'PMB' }]}
        description="Informasi pendaftaran dan formulir pendaftaran awal calon mahasiswa STAI Morowali."
        eyebrow={pmb.academicYear ? `Tahun Akademik ${pmb.academicYear}` : 'PMB'}
        title="Penerimaan Mahasiswa Baru"
      >
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span
            className={
              pmb.isOpen
                ? 'rounded-full bg-gold-400 px-3 py-1 text-sm font-semibold text-brand-950'
                : 'rounded-full bg-white/15 px-3 py-1 text-sm font-semibold text-white'
            }
          >
            {pmb.isOpen
              ? `Pendaftaran dibuka${pmb.wave ? ` · ${pmb.wave}` : ''}`
              : 'Pendaftaran belum dibuka'}
          </span>
          {pmb.isOpen && (
            <Link className="btn btn-gold" href="/pmb/daftar">
              Isi formulir pendaftaran
            </Link>
          )}
        </div>
      </PageHeader>

      <div className="container-site grid gap-10 py-12 md:py-16 lg:grid-cols-[1fr_22rem]">
        <div className="min-w-0 space-y-12">
          {!pmb.isOpen && pmb.closedMessage && (
            <FormAlert tone="info">{pmb.closedMessage}</FormAlert>
          )}

          {pmb.intro && <RichText data={pmb.intro} />}

          {requirements.length > 0 && (
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-2xl font-extrabold text-brand-950">
                <ClipboardList aria-hidden className="size-6 text-brand-700" /> Persyaratan
              </h2>
              <ul className="card divide-y divide-stone-100">
                {requirements.map((item, index) => (
                  <li className="flex gap-3 px-5 py-3.5 text-stone-700" key={item.id ?? index}>
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-800">
                      {index + 1}
                    </span>
                    {item.text}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {schedule.length > 0 && (
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-2xl font-extrabold text-brand-950">
                <CalendarDays aria-hidden className="size-6 text-brand-700" /> Jadwal
              </h2>
              <ol className="relative space-y-4 border-l-2 border-brand-100 pl-6">
                {schedule.map((item, index) => (
                  <li className="relative" key={item.id ?? index}>
                    <span
                      aria-hidden
                      className="absolute top-1.5 left-[-1.95rem] size-3.5 rounded-full border-2 border-white bg-brand-600"
                    />
                    <p className="font-semibold text-stone-900">{item.stage}</p>
                    <p className="text-sm text-stone-600">{item.date}</p>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {fees.length > 0 && (
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-2xl font-extrabold text-brand-950">
                <Wallet aria-hidden className="size-6 text-brand-700" /> Rincian Biaya
              </h2>
              <div className="card overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-brand-50 text-brand-900">
                    <tr>
                      <th className="px-5 py-3 font-semibold" scope="col">
                        Komponen
                      </th>
                      <th className="px-5 py-3 text-right font-semibold" scope="col">
                        Nominal
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {fees.map((fee, index) => (
                      <tr key={fee.id ?? index}>
                        <td className="px-5 py-3 text-stone-700">{fee.item}</td>
                        <td className="px-5 py-3 text-right font-semibold whitespace-nowrap text-stone-900">
                          {fee.amount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {pmb.guide && (
            <section>
              <h2 className="mb-4 text-2xl font-extrabold text-brand-950">Petunjuk Teknis</h2>
              <RichText data={pmb.guide} />
            </section>
          )}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-32 lg:self-start">
          <div className="bg-pattern rounded-2xl bg-brand-800 p-6 text-white">
            <p className="text-sm font-semibold text-gold-300">Pendaftaran awal online</p>
            <p className="mt-2 text-brand-100">
              {pmb.isOpen
                ? 'Isi data diri dan pilihan program studi. Panitia akan menghubungi Anda untuk tahap berikutnya.'
                : 'Formulir akan tersedia saat pendaftaran dibuka.'}
            </p>
            {pmb.isOpen && (
              <Link className="btn btn-gold mt-5 w-full" href="/pmb/daftar">
                Daftar sekarang
              </Link>
            )}
          </div>

          {downloads.length > 0 && (
            <div className="card p-6">
              <h2 className="font-bold text-stone-900">Unduhan</h2>
              <ul className="mt-3 space-y-2">
                {downloads.map((file) => (
                  <li key={file.id}>
                    <a
                      className="flex items-center gap-3 rounded-lg p-2 text-sm hover:bg-brand-50"
                      download
                      href={file.url!}
                    >
                      <FileText aria-hidden className="size-5 shrink-0 text-brand-700" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium text-stone-900">
                          {file.alt || file.filename}
                        </span>
                        <span className="text-xs text-stone-500">
                          {formatFileSize(file.filesize)}
                        </span>
                      </span>
                      <Download aria-hidden className="size-4 text-stone-400" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {contacts.length > 0 && (
            <div className="card p-6">
              <h2 className="font-bold text-stone-900">Narahubung Panitia</h2>
              <ul className="mt-3 space-y-2">
                {contacts.map((contact, index) => (
                  <li key={contact.id ?? index}>
                    <a
                      className="flex items-center gap-3 rounded-lg p-2 text-sm hover:bg-brand-50"
                      href={`https://wa.me/${toWhatsAppNumber(contact.whatsapp)}`}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <MessageCircle aria-hidden className="size-5 text-brand-700" />
                      <span>
                        <span className="block font-medium text-stone-900">{contact.name}</span>
                        <span className="text-xs text-stone-500">WhatsApp {contact.whatsapp}</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </>
  )
}
