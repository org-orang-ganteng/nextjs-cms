import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { RenderBlocks } from '@/components/blocks/RenderBlocks'
import { PageHeader } from '@/components/site/PageHeader'
import { getPageBySlug } from '@/lib/queries'
import { metaFromSeo } from '@/lib/seo'
import { pathFor } from '@/lib/site'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await getPageBySlug((await params).slug)
  if (!page) return {}
  return metaFromSeo(page.meta, { path: pathFor('pages', page.slug), title: page.title })
}

/** Halaman bebas dari koleksi "Halaman" (page builder), tampil di /{slug}. */
export default async function BuilderPage({ params }: Props) {
  const page = await getPageBySlug((await params).slug)
  if (!page) notFound()

  const startsWithHero = page.layout[0]?.blockType === 'hero'

  return (
    <>
      {!startsWithHero && <PageHeader breadcrumbs={[{ label: page.title }]} title={page.title} />}
      <RenderBlocks blocks={page.layout} />
    </>
  )
}
