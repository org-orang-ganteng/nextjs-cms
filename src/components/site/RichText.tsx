import type {
  DefaultNodeTypes,
  DefaultTypedEditorState,
  SerializedLinkNode,
} from '@payloadcms/richtext-lexical'
import {
  type JSXConvertersFunction,
  LinkJSXConverter,
  RichText as LexicalRichText,
} from '@payloadcms/richtext-lexical/react'

import { cn } from '@/lib/cn'
import { isLinkableCollection, pathFor } from '@/lib/site'

const internalDocToHref = ({ linkNode }: { linkNode: SerializedLinkNode }): string => {
  const doc = linkNode.fields.doc
  if (!doc || typeof doc.value !== 'object' || !doc.value) return '#'
  const slug = 'slug' in doc.value && typeof doc.value.slug === 'string' ? doc.value.slug : null
  return isLinkableCollection(doc.relationTo) ? pathFor(doc.relationTo, slug) : '#'
}

const converters: JSXConvertersFunction<DefaultNodeTypes> = ({ defaultConverters }) => ({
  ...defaultConverters,
  ...LinkJSXConverter({ internalDocToHref }),
})

const isEditorState = (value: unknown): value is DefaultTypedEditorState =>
  typeof value === 'object' && value !== null && 'root' in value

/**
 * Menampilkan konten rich text (Lexical) dengan gaya tipografi situs.
 * Lebar bawaan mengikuti kontainer; kirim className (mis. "mx-auto max-w-3xl") untuk membatasinya.
 */
export function RichText({ className, data }: { className?: string; data: unknown }) {
  if (!isEditorState(data)) return null
  return (
    <LexicalRichText
      className={cn(
        'prose prose-stone prose-headings:font-bold prose-headings:text-brand-950 prose-a:text-brand-700 prose-a:underline-offset-2 hover:prose-a:text-brand-800 prose-img:rounded-xl',
        className ?? 'max-w-none',
      )}
      converters={converters}
      data={data}
    />
  )
}
