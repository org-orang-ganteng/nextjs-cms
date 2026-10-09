import { CalendarDays } from 'lucide-react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { PostCard } from '@/components/site/cards'
import { MediaImage } from '@/components/site/MediaImage'
import { PageHeader } from '@/components/site/PageHeader'
import { RichText } from '@/components/site/RichText'
import { formatDate } from '@/lib/format'
import { labelFor, POST_CATEGORIES } from '@/lib/options'
import { getPostBySlug, getPosts } from '@/lib/queries'
import { richTextToPlain } from '@/lib/richtext'
import { metaFromSeo } from '@/lib/seo'
import { pathFor } from '@/lib/site'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPostBySlug((await params).slug)
  if (!post) return {}
  return metaFromSeo(post.meta, {
    description: post.excerpt || richTextToPlain(post.content, 160),
    image: post.coverImage,
    path: pathFor('posts', post.slug),
    publishedTime: post.publishedAt,
    title: post.title,
    type: 'article',
  })
}

export default async function PostPage({ params }: Props) {
  const post = await getPostBySlug((await params).slug)
  if (!post) notFound()

  const related = (await getPosts({ limit: 4 })).docs
    .filter((item) => item.id !== post.id)
    .slice(0, 3)

  return (
    <>
      <PageHeader
        breadcrumbs={[{ href: '/berita', label: 'Berita' }, { label: post.title }]}
        title={post.title}
      >
        <p className="mt-5 flex flex-wrap items-center gap-3 text-sm text-brand-100">
          <span className="rounded-full bg-white/15 px-3 py-1 font-semibold text-white">
            {labelFor(POST_CATEGORIES, post.category)}
          </span>
          {post.publishedAt && (
            <span className="flex items-center gap-1.5">
              <CalendarDays aria-hidden className="size-4" />
              <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
            </span>
          )}
        </p>
      </PageHeader>

      <article className="container-site py-12 md:py-16">
        <div className="mx-auto max-w-3xl">
          {post.coverImage && (
            <figure className="mb-10">
              <div className="relative aspect-[16/9] overflow-hidden rounded-2xl">
                <MediaImage
                  className="object-cover"
                  fill
                  preload
                  resource={post.coverImage}
                  size="hero"
                  sizes="(min-width: 768px) 48rem, 100vw"
                />
              </div>
            </figure>
          )}
          <RichText data={post.content} />
        </div>
      </article>

      {related.length > 0 && (
        <section className="border-t border-stone-200 bg-white py-12 md:py-16">
          <div className="container-site">
            <h2 className="mb-8 text-2xl font-extrabold text-brand-950">Berita Lainnya</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <PostCard key={item.id} post={item} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
