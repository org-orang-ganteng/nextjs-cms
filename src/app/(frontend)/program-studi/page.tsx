import type { Metadata } from 'next'

import { ProgramCard } from '@/components/site/cards'
import { EmptyState } from '@/components/site/EmptyState'
import { PageHeader } from '@/components/site/PageHeader'
import { getPrograms } from '@/lib/queries'

export const metadata: Metadata = {
  alternates: { canonical: '/program-studi' },
  description: 'Program studi di STAI Morowali: PAI, PGMI, PIAUD, dan HKI.',
  title: 'Program Studi',
}

export default async function ProgramsPage() {
  const programs = await getPrograms()

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: 'Program Studi' }]}
        description="Pilih program studi untuk melihat profil, visi misi, kurikulum, dan prospek lulusan."
        eyebrow="Akademik"
        title="Program Studi"
      />
      <div className="container-site py-12 md:py-16">
        {programs.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {programs.map((program) => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </div>
        ) : (
          <EmptyState title="Data program studi belum tersedia." />
        )}
      </div>
    </>
  )
}
