/** Pembentuk konten rich text (Lexical) sederhana untuk data awal. */

type TextNode = {
  detail: number
  format: number
  mode: 'normal'
  style: string
  text: string
  type: 'text'
  version: 1
}

type ElementNode = {
  children: Array<ElementNode | TextNode>
  direction: 'ltr'
  format: ''
  indent: number
  type: string
  version: 1
  [key: string]: unknown
}

export type RichTextValue = {
  root: {
    children: ElementNode[]
    direction: 'ltr'
    format: ''
    indent: number
    type: 'root'
    version: 1
  }
}

const text = (value: string, bold = false): TextNode => ({
  detail: 0,
  format: bold ? 1 : 0,
  mode: 'normal',
  style: '',
  text: value,
  type: 'text',
  version: 1,
})

const element = (
  type: string,
  children: ElementNode['children'],
  extra: Record<string, unknown> = {},
): ElementNode => ({
  children,
  direction: 'ltr',
  format: '',
  indent: 0,
  type,
  version: 1,
  ...extra,
})

export const paragraph = (value: string) =>
  element('paragraph', [text(value)], { textFormat: 0, textStyle: '' })

export const heading = (value: string, tag: 'h2' | 'h3' = 'h2') =>
  element('heading', [text(value)], { tag })

export const bulletList = (items: string[]) =>
  element(
    'list',
    items.map((item, index) => element('listitem', [text(item)], { value: index + 1 })),
    { listType: 'bullet', start: 1, tag: 'ul' },
  )

export function richText(...nodes: ElementNode[]): RichTextValue {
  return {
    root: {
      children: nodes,
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  }
}

/** Rich text berisi satu atau beberapa paragraf. */
export const paragraphs = (...values: string[]) => richText(...values.map(paragraph))
