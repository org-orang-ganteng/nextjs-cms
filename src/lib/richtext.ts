type LexicalNode = { children?: LexicalNode[]; text?: string; type?: string }

/** Teks polos dari rich text Lexical, dipotong rapi (untuk ringkasan & meta description). */
export function richTextToPlain(data: unknown, maxLength = 280): string {
  const root = (data as { root?: LexicalNode } | null | undefined)?.root
  if (!root) return ''
  const parts: string[] = []
  const walk = (node: LexicalNode) => {
    if (typeof node.text === 'string') parts.push(node.text)
    node.children?.forEach(walk)
    if (node.type === 'paragraph' || node.type === 'heading' || node.type === 'listitem')
      parts.push(' ')
  }
  walk(root)
  const text = parts.join('').replace(/\s+/g, ' ').trim()
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength).replace(/\s+\S*$/, '')}…`
}
