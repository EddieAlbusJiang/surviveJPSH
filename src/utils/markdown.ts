import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
})

export function parseMarkdown(content: string): string {
  return md.render(content)
}

export function extractHeadings(content: string): Array<{ level: number; text: string; id: string }> {
  const headings: Array<{ level: number; text: string; id: string }> = []
  const lines = content.split('\n')

  for (const line of lines) {
    const match = line.match(/^(#{1,6})\s+(.+)$/)
    if (match) {
      const level = match[1].length
      const text = match[2].replace(/\*\*/g, '').trim()
      const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
      headings.push({ level, text, id })
    }
  }

  return headings
}
