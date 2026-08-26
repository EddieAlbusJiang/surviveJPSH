export interface SearchResult {
  title: string
  subtitle: string
  path: string
}

const mdModules = import.meta.glob('/src/docs/*.md', {
  query: '?raw',
  import: 'default',
  eager: true
}) as Record<string, string>

const docTitles: Record<string, Record<string, string>> = {
  study: { 'zh-CN': '学习篇', 'en-US': 'Study Guide' },
  life: { 'zh-CN': '生活篇', 'en-US': 'Life Guide' }
}

export function getDocTitle(docId: string, locale: string): string {
  const titles = docTitles[docId]
  if (!titles) return docId
  return titles[locale] || titles['zh-CN'] || docId
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u4e00-\u9fff-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .replace(/!\[.*?\]\(.+?\)/g, '')
    .replace(/`(.+?)`/g, '$1')
    .replace(/~~(.+?)~~/g, '$1')
    .trim()
}

interface RawSection {
  heading: string
  content: string
  anchor: string
}

function parseSections(raw: string): RawSection[] {
  const sections: RawSection[] = []
  const lines = raw.split('\n')
  let currentHeading = ''
  let currentContent: string[] = []

  for (const line of lines) {
    const m = line.match(/^#{1,4}\s+(.+)/)
    if (m) {
      if (currentHeading || currentContent.length > 0) {
        const heading = currentHeading
        sections.push({
          heading,
          content: currentContent.join('\n'),
          anchor: slugify(heading)
        })
      }
      currentHeading = m[1].trim()
      currentContent = []
    } else {
      currentContent.push(line)
    }
  }

  if (currentHeading || currentContent.length > 0) {
    const heading = currentHeading
    sections.push({
      heading,
      content: currentContent.join('\n'),
      anchor: slugify(heading)
    })
  }

  return sections
}

interface IndexEntry {
  docId: string
  heading: string
  content: string
  anchor: string
}

function buildIndex(): IndexEntry[] {
  const index: IndexEntry[] = []

  for (const [path, raw] of Object.entries(mdModules)) {
    const match = path.match(/\/([^/]+)\.md$/)
    if (!match) continue
    const docId = match[1]

    const sections = parseSections(raw)
    for (const section of sections) {
      index.push({
        docId,
        heading: section.heading,
        content: stripMarkdown(section.content),
        anchor: section.anchor
      })
    }
  }

  return index
}

const searchIndex = buildIndex()

export function searchDocs(query: string, locale: string = 'zh-CN'): SearchResult[] {
  if (!query || query.trim().length === 0) return []

  const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 0)

  return searchIndex
    .filter(section => {
      const searchText = `${section.heading} ${section.content}`.toLowerCase()
      return terms.every(term => searchText.includes(term))
    })
    .map(section => ({
      title: section.heading,
      subtitle: getDocTitle(section.docId, locale),
      path: `/doc/${section.docId}#${section.anchor}`
    }))
    .slice(0, 10)
}
