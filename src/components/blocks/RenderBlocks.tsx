import { ArrowRight, ChevronDown } from 'lucide-react'

import type {
  CallToActionBlock,
  CardGridBlock,
  ContentBlock,
  FaqBlock,
  HeroBlock,
  LatestPostsBlock,
  MediaBlock,
  Page,
  ProgramListBlock,
  StatsBlock,
  VideoBlock,
} from '@/payload-types'
import { cn } from '@/lib/cn'
import { asMedia } from '@/lib/media'
import { getPosts, getPrograms } from '@/lib/queries'
import { getYouTubeEmbedUrl } from '@/lib/youtube'

import { PostCard, ProgramCard } from '../site/cards'
import { MediaImage } from '../site/MediaImage'
import { RichText } from '../site/RichText'
import { SectionHeading } from '../site/SectionHeading'
import { SmartLink } from '../site/SmartLink'

function Section({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={cn('py-12 md:py-16', className)}>{children}</section>
}

export function HeroView({ block, first }: { block: HeroBlock; first?: boolean }) {
  const hasImage = Boolean(asMedia(block.image))
  // Banner di urutan pertama menjadi judul utama halaman (h1).
  const Heading = first ? 'h1' : 'h2'
  return (
    <section className="bg-pattern relative isolate overflow-hidden bg-brand-800 text-white">
      {hasImage && (
        <>
          <MediaImage
            className="-z-20 object-cover"
            fill
            preload={first}
            resource={block.image}
            size="hero"
          />
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-950/90 via-brand-900/75 to-brand-900/30"
          />
        </>
      )}
      <div className="container-site py-16 md:py-24">
        <Heading className="max-w-3xl text-3xl leading-tight font-extrabold md:text-5xl">
          {block.title}
        </Heading>
        {block.subtitle && (
          <p className="mt-5 max-w-2xl text-lg text-brand-100">{block.subtitle}</p>
        )}
        {(block.buttons ?? []).length > 0 && (
          <div className="mt-8 flex flex-wrap gap-3">
            {block.buttons!.map((button, index) => (
              <SmartLink
                className={cn('btn', index === 0 ? 'btn-gold' : 'btn-outline-light')}
                href={button.url}
                key={button.id ?? index}
                newTab={button.newTab}
              >
                {button.label}
              </SmartLink>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function ContentView({ block }: { block: ContentBlock }) {
  return (
    <Section>
      <div className="container-site">
        <RichText className="mx-auto max-w-3xl" data={block.content} />
      </div>
    </Section>
  )
}

function MediaView({ block }: { block: MediaBlock }) {
  return (
    <Section>
      <figure className="container-site">
        <MediaImage
          className="mx-auto h-auto w-full max-w-5xl rounded-2xl"
          resource={block.image}
          sizes="(min-width: 1024px) 64rem, 100vw"
        />
        {block.caption && (
          <figcaption className="mt-3 text-center text-sm text-stone-500">
            {block.caption}
          </figcaption>
        )}
      </figure>
    </Section>
  )
}

function CallToActionView({ block }: { block: CallToActionBlock }) {
  const button = block.button?.label && block.button.url ? block.button : null
  return (
    <Section>
      <div className="container-site">
        <div className="bg-pattern flex flex-col items-start justify-between gap-6 rounded-2xl bg-brand-800 p-8 text-white md:flex-row md:items-center md:p-12">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-extrabold md:text-3xl">{block.title}</h2>
            {block.text && <p className="mt-3 text-brand-100">{block.text}</p>}
          </div>
          {button && (
            <SmartLink className="btn btn-gold shrink-0" href={button.url!} newTab={button.newTab}>
              {button.label}
              <ArrowRight aria-hidden className="size-4" />
            </SmartLink>
          )}
        </div>
      </div>
    </Section>
  )
}

function CardGridView({ block }: { block: CardGridBlock }) {
  return (
    <Section>
      <div className="container-site">
        {block.title && (
          <SectionHeading description={block.intro ?? undefined} title={block.title} />
        )}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(block.cards ?? []).map((card, index) => {
            const content = (
              <>
                {card.image && (
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <MediaImage
                      className="object-cover"
                      fill
                      resource={card.image}
                      size="card"
                      sizes="(min-width: 1024px) 33vw, 50vw"
                    />
                  </div>
                )}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-stone-900">{card.title}</h3>
                  {card.description && (
                    <p className="mt-2 text-sm text-stone-600">{card.description}</p>
                  )}
                </div>
              </>
            )
            return card.url ? (
              <SmartLink
                className="card block overflow-hidden transition-shadow hover:shadow-md"
                href={card.url}
                key={card.id ?? index}
              >
                {content}
              </SmartLink>
            ) : (
              <div className="card overflow-hidden" key={card.id ?? index}>
                {content}
              </div>
            )
          })}
        </div>
      </div>
    </Section>
  )
}

const STATS_GRID: Record<number, string> = {
  1: 'mx-auto max-w-xs grid-cols-1',
  2: 'mx-auto max-w-2xl grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-3',
}

export function StatsView({ items, title }: { items: StatsBlock['items']; title?: null | string }) {
  if (!items?.length) return null
  return (
    <Section className="bg-white">
      <div className="container-site">
        {title && <SectionHeading title={title} />}
        <dl className={cn('grid gap-6', STATS_GRID[items.length] ?? 'grid-cols-2 md:grid-cols-4')}>
          {items.map((item, index) => (
            <div
              className="flex flex-col-reverse rounded-2xl border border-brand-100 bg-brand-50/60 p-6 text-center"
              key={item.id ?? index}
            >
              <dt className="mt-2 text-sm font-medium text-stone-600">{item.label}</dt>
              <dd className="text-3xl font-extrabold text-brand-800 md:text-4xl">{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Section>
  )
}

export function FaqView({ block }: { block: FaqBlock }) {
  return (
    <Section>
      <div className="container-site max-w-3xl">
        {block.title && <SectionHeading title={block.title} />}
        <div className="space-y-3">
          {(block.items ?? []).map((item, index) => (
            <details className="card group p-5 open:shadow-md" key={item.id ?? index}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-stone-900 marker:hidden">
                {item.question}
                <ChevronDown
                  aria-hidden
                  className="size-5 shrink-0 text-brand-700 transition-transform group-open:rotate-180"
                />
              </summary>
              <p className="mt-3 whitespace-pre-line text-stone-600">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </Section>
  )
}

function VideoView({ block }: { block: VideoBlock }) {
  const src = getYouTubeEmbedUrl(block.url)
  if (!src) return null
  return (
    <Section>
      <figure className="container-site max-w-4xl">
        {block.title && (
          <h2 className="mb-4 text-2xl font-extrabold text-brand-950">{block.title}</h2>
        )}
        <div className="relative aspect-video overflow-hidden rounded-2xl bg-stone-900">
          <iframe
            allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 size-full"
            loading="lazy"
            src={src}
            title={block.title || 'Video YouTube'}
          />
        </div>
        {block.caption && (
          <figcaption className="mt-3 text-center text-sm text-stone-500">
            {block.caption}
          </figcaption>
        )}
      </figure>
    </Section>
  )
}

async function LatestPostsView({ block }: { block: LatestPostsBlock }) {
  const { docs } = await getPosts({ limit: block.limit ?? 3 })
  if (docs.length === 0) return null
  return (
    <Section>
      <div className="container-site">
        <SectionHeading
          action={
            <SmartLink className="btn btn-outline" href="/berita">
              Semua berita
            </SmartLink>
          }
          title={block.title || 'Berita Terbaru'}
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {docs.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </Section>
  )
}

async function ProgramListView({ block }: { block: ProgramListBlock }) {
  const programs = await getPrograms()
  if (programs.length === 0) return null
  return (
    <Section>
      <div className="container-site">
        <SectionHeading
          description={block.intro ?? undefined}
          title={block.title || 'Program Studi'}
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {programs.map((program) => (
            <ProgramCard key={program.id} program={program} />
          ))}
        </div>
      </div>
    </Section>
  )
}

/** Merender susunan blok dari page builder sesuai jenisnya. */
export function RenderBlocks({ blocks }: { blocks: Page['layout'] }) {
  return (
    <>
      {blocks.map((block, index) => {
        const key = block.id ?? `${block.blockType}-${index}`
        switch (block.blockType) {
          case 'hero':
            return <HeroView block={block} first={index === 0} key={key} />
          case 'content':
            return <ContentView block={block} key={key} />
          case 'mediaBlock':
            return <MediaView block={block} key={key} />
          case 'callToAction':
            return <CallToActionView block={block} key={key} />
          case 'cardGrid':
            return <CardGridView block={block} key={key} />
          case 'stats':
            return <StatsView items={block.items} key={key} title={block.title} />
          case 'faq':
            return <FaqView block={block} key={key} />
          case 'video':
            return <VideoView block={block} key={key} />
          case 'latestPosts':
            return <LatestPostsView block={block} key={key} />
          case 'programList':
            return <ProgramListView block={block} key={key} />
          default:
            return null
        }
      })}
    </>
  )
}
