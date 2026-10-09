import type { Metadata } from 'next'
import Link from 'next/link'

import { PostCard } from '@/components/site/cards'
import { EmptyState } from '@/components/site/EmptyState'
import { PageHeader } from '@/components/site/PageHeader'
import { Pagination, parsePage } from '@/components/site/Pagination'
import { cn } from '@/lib/cn'
import { labelFor, POST_CATEGORIES } from '@/lib/options'
import { getPosts } from '@/lib/queries'

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

const single = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const category = single((await searchParams).kategori)
  const label = category ? labelFor(POST_CATEGORIES, category) : null
  return {
    alternates: { canonical: '/berita' },
    description: 'Berita dan kabar terbaru seputar kegiatan STAI Morowali.',
    title: label ? `Berita ${label}` : 'Berita',
  }
}

export default async function NewsPage({ searchParams }: Props) {
  const params = await searchParams
  const categoryParam = single(params.kategori)
  const category = POST_CATEGORIES.some((option) => option.value === categoryParam)
    ? categoryParam
    : undefined
  const page = parsePage(params.page)
  const posts = await getPosts({ category, page })

  const categories = [{ label: 'Semua', value: undefined }, ...POST_CATEGORIES]

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: 'Berita' }]}
        description="Kabar terbaru kegiatan akademik, kemahasiswaan, dan prestasi civitas STAI Morowali."
        eyebrow="Informasi"
        title="Berita"
      />
      <div className="container-site py-12 md:py-16">
        <nav aria-label="Kategori berita" className="mb-8 flex flex-wrap gap-2">
          {categories.map((item) => (
            <Link
              aria-current={item.value === category ? 'page' : undefined}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-semibold',
                item.value === category
                  ? 'bg-brand-700 text-white'
                  : 'bg-white text-stone-700 ring-1 ring-stone-200 hover:bg-brand-50',
              )}
              href={item.value ? `/berita?kategori=${item.value}` : '/berita'}
              key={item.label}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {posts.docs.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.docs.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <EmptyState title="Belum ada berita.">
            Berita yang diterbitkan akan tampil di sini.
          </EmptyState>
        )}

        <Pagination
          basePath="/berita"
          page={posts.page ?? page}
          params={{ kategori: category }}
          totalPages={posts.totalPages}
        />
      </div>
    </>
  )
}
