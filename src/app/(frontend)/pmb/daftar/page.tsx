import type { Metadata } from 'next'
import Link from 'next/link'

import { FormAlert } from '@/components/forms/fields'
import { PmbForm } from '@/components/forms/PmbForm'
import { PageHeader } from '@/components/site/PageHeader'
import { getPmbInfo, getPrograms } from '@/lib/queries'

export const metadata: Metadata = {
  alternates: { canonical: '/pmb/daftar' },
  description: 'Formulir pendaftaran awal calon mahasiswa baru STAI Morowali.',
  title: 'Formulir Pendaftaran PMB',
}

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export default async function PmbRegistrationPage({ searchParams }: Props) {
  const prodi = (await searchParams).prodi
  const [pmb, programs] = await Promise.all([getPmbInfo(), getPrograms()])
  const preselected = programs.find(
    (program) => program.slug === (Array.isArray(prodi) ? prodi[0] : prodi),
  )

  return (
    <>
      <PageHeader
        breadcrumbs={[{ href: '/pmb', label: 'PMB' }, { label: 'Formulir Pendaftaran' }]}
        description={
          pmb.isOpen
            ? `Pendaftaran awal${pmb.wave ? ` ${pmb.wave}` : ''}${pmb.academicYear ? `, tahun akademik ${pmb.academicYear}` : ''}.`
            : undefined
        }
        eyebrow="Penerimaan Mahasiswa Baru"
        title="Formulir Pendaftaran Awal"
      />
      <div className="container-site py-12 md:py-16">
        <div className="mx-auto max-w-3xl">
          {pmb.isOpen ? (
            <PmbForm
              defaultProgramId={preselected?.id}
              programs={programs.map((program) => ({ id: program.id, name: program.name }))}
            />
          ) : (
            <div className="space-y-6">
              <FormAlert tone="info">{pmb.closedMessage || 'Pendaftaran belum dibuka.'}</FormAlert>
              <Link className="btn btn-outline" href="/pmb">
                Lihat informasi PMB
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
