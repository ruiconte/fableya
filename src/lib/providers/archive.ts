import type { ExternalStyleReference, ProviderSearchResult } from './types'

// Internet Archive full-text search API — public domain books & illustrations
const BASE = 'https://archive.org'

interface ArchiveDoc {
  identifier: string
  title?: string
  creator?: string
  subject?: string | string[]
  description?: string | string[]
  mediatype?: string
}

interface ArchiveResponse {
  response: {
    numFound: number
    docs: ArchiveDoc[]
  }
}

function buildPrompt(doc: ArchiveDoc): string {
  const text = [
    doc.title || '',
    ...(Array.isArray(doc.subject) ? doc.subject : [doc.subject || '']),
    ...(Array.isArray(doc.description) ? doc.description.slice(0, 1) : [doc.description || '']),
  ].join(' ').toLowerCase()

  const parts: string[] = []

  if (text.includes('watercolor') || text.includes('aquarelle')) {
    parts.push('watercolor illustration, soft color washes')
  } else if (text.includes('fairy') || text.includes('conte') || text.includes('fée')) {
    parts.push('fairy tale illustration, magical storybook artwork')
  } else if (text.includes('picture book') || text.includes('album')) {
    parts.push('picture book illustration, colorful storybook style')
  } else if (text.includes('japanese') || text.includes('japon')) {
    parts.push('Japanese picture book style, flat color woodblock-inspired')
  } else if (text.includes('art nouveau')) {
    parts.push('Art Nouveau children illustration, decorative organic style')
  } else {
    parts.push('vintage children book illustration, classic storybook style')
  }

  parts.push("children's book illustration style")
  return parts.join(', ')
}

// Query for children's illustration-related book covers / page scans
export async function searchArchive(query: string, page = 0): Promise<ProviderSearchResult> {
  const encodedQ = encodeURIComponent(
    `(${query}) AND (subject:"children" OR subject:"fairy tales" OR subject:"picture books" OR subject:"illustrated") AND mediatype:texts`
  )
  const url = `${BASE}/advancedsearch.php?q=${encodedQ}&fl[]=identifier,title,creator,subject&sort[]=downloads+desc&rows=20&start=${page * 20}&output=json`

  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error('Archive.org API unavailable')

  const data: ArchiveResponse = await res.json()
  const docs = data.response?.docs ?? []

  // Build thumbnail URLs using Archive.org's item image endpoint
  const items: ExternalStyleReference[] = docs
    .filter(d => d.identifier)
    .map(doc => {
      const thumbUrl = `${BASE}/services/img/${doc.identifier}`
      const sourceUrl = `${BASE}/details/${doc.identifier}`
      const title = doc.title || doc.identifier
      const creator = Array.isArray(doc.creator) ? doc.creator[0] : (doc.creator || 'Internet Archive')

      return {
        provider: 'met' as const,
        externalId: `arch_${doc.identifier}`,
        title,
        creator,
        thumbnailUrl: thumbUrl,
        imageUrl: thumbUrl,
        sourceUrl,
        medium: 'Internet Archive',
        period: 'Domaine public',
        tags: Array.isArray(doc.subject) ? doc.subject.slice(0, 5) : (doc.subject ? [doc.subject] : []),
        attribution: `"${title}" ${creator ? `par ${creator}` : ''}. Internet Archive. Domaine public.`,
        generatedPrompt: buildPrompt(doc),
      }
    })

  return { items, total: data.response.numFound }
}
