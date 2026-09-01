import docsRaw from '../docs/docs.json?raw'

export interface DocEntry {
  id: string
  file: string
  title: string
  description: string
  icon: string
  hidden: boolean
}

function decodeUnicodeEscapes(text: string): string {
  return text.replace(/\\u\{([0-9a-fA-F]{1,6})\}/g, (_, hex: string) => {
    const codePoint = parseInt(hex, 16)
    if (codePoint > 0x10ffff) return `\\u{${hex}}`
    return String.fromCodePoint(codePoint)
  })
}

const docsJson = JSON.parse(decodeUnicodeEscapes(docsRaw)) as { docs: DocEntry[] }

const entries: DocEntry[] = docsJson.docs || []

export function getDocs(includeHidden = false): DocEntry[] {
  return includeHidden ? entries : entries.filter(e => !e.hidden)
}

export function getDoc(id: string): DocEntry | undefined {
  return entries.find(entry => entry.id === id)
}

export function getDocFile(id: string): string | undefined {
  return getDoc(id)?.file
}
