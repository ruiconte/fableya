import type { ExternalStyleReference, ProviderSearchResult } from './types'

const API = 'https://commons.wikimedia.org/w/api.php'

interface WikiImageInfo {
  url: string
  thumburl?: string
  descriptionurl: string
  extmetadata?: {
    Artist?: { value: string }
    LicenseShortName?: { value: string }
    ImageDescription?: { value: string }
    DateTimeOriginal?: { value: string }
  }
}

interface WikiPage {
  pageid: number
  title: string
  imageinfo?: WikiImageInfo[]
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]*>/g, '').trim()
}

function buildPrompt(title: string, description: string): string {
  const combined = (title + ' ' + description).toLowerCase()
  const parts: string[] = []

  if (combined.includes('watercolor') || combined.includes('aquarelle')) {
    parts.push('watercolor illustration, soft color washes')
  } else if (combined.includes('engraving') || combined.includes('gravure')) {
    parts.push('engraving illustration style, fine crosshatch lines')
  } else if (combined.includes('art nouveau') || combined.includes('nouveau')) {
    parts.push('Art Nouveau illustration, flowing organic lines, decorative borders')
  } else if (combined.includes('woodcut') || combined.includes('woodblock')) {
    parts.push('woodcut print style, bold black outlines')
  } else if (combined.includes('lithograph')) {
    parts.push('lithograph illustration, soft tonal gradients')
  } else if (combined.includes('ink') || combined.includes('pen')) {
    parts.push('pen and ink illustration, detailed line work')
  } else if (combined.includes('gouache')) {
    parts.push('gouache illustration, opaque vivid colors')
  } else if (combined.includes('oil') || combined.includes('painting')) {
    parts.push('oil painting style, rich colors')
  } else {
    parts.push('classic book illustration style')
  }

  const clean = title.replace(/^File:/, '').replace(/\.[^.]+$/, '').replace(/[_-]/g, ' ')
  const keywords = clean
    .split(' ')
    .filter(w => w.length > 3 && !['File', 'from', 'with', 'illustration', 'Illustration'].includes(w))
    .slice(0, 4)
    .join(', ')
    .toLowerCase()
  if (keywords) parts.push(keywords)

  parts.push("children's book illustration style")
  return parts.filter(Boolean).join(', ')
}

function pagesFromResponse(data: unknown): WikiPage[] {
  return Object.values((data as { query?: { pages?: Record<string, WikiPage> } })?.query?.pages ?? {})
}

function toRef(p: WikiPage): ExternalStyleReference | null {
  const info = p.imageinfo?.[0]
  if (!info?.thumburl) return null
  const url = (info.url || '').toLowerCase()
  if (!url.endsWith('.jpg') && !url.endsWith('.jpeg') && !url.endsWith('.png')) return null

  const meta = info.extmetadata ?? {}
  const artist = meta.Artist?.value ? stripHtml(meta.Artist.value) : 'Wikimedia Commons'
  const desc = meta.ImageDescription?.value ? stripHtml(meta.ImageDescription.value) : ''
  const license = meta.LicenseShortName?.value ?? 'Public Domain'
  const cleanTitle = p.title.replace(/^File:/, '').replace(/\.[^.]+$/, '').replace(/_/g, ' ')

  return {
    provider: 'met' as const,
    externalId: `wiki_${p.pageid}`,
    title: cleanTitle,
    creator: artist,
    thumbnailUrl: info.thumburl!,
    imageUrl: info.url,
    sourceUrl: info.descriptionurl,
    medium: 'Wikimedia Commons',
    period: license,
    tags: [],
    attribution: `${artist}. "${cleanTitle}". Wikimedia Commons. ${license}.`,
    generatedPrompt: buildPrompt(p.title, desc),
  }
}

// Fetch files from a specific Wikimedia category
async function fetchCategory(category: string, limit = 20): Promise<WikiPage[]> {
  const params2 = new URLSearchParams({
    action: 'query',
    generator: 'categorymembers',
    gcmtitle: `Category:${category}`,
    gcmtype: 'file',
    gcmlimit: String(limit),
    prop: 'imageinfo',
    iiprop: 'url|thumburl|extmetadata',
    iiurlwidth: '400',
    format: 'json',
    origin: '*',
  })
  const res = await fetch(`${API}?${params2}`)
  if (!res.ok) return []
  const data = await res.json()
  return pagesFromResponse(data)
}

// Children's illustration categories to sample from when text search returns few results
const ILLUSTRATION_CATEGORIES = [
  "Children's_book_illustrations",
  "Fairy_tale_illustrations",
  "Picture_books",
  "Illustrated_books_for_children",
]

export async function searchWikimedia(query: string, page = 0): Promise<ProviderSearchResult> {
  const textParams = new URLSearchParams({
    action: 'query',
    generator: 'search',
    gsrsearch: query + ' illustration',
    gsrnamespace: '6',
    gsrlimit: '40',
    gsroffset: String(page * 40),
    prop: 'imageinfo',
    iiprop: 'url|thumburl|mediatype|extmetadata',
    iiurlwidth: '400',
    format: 'json',
    origin: '*',
  })

  // Text search + category browse in parallel
  const randomCategory = ILLUSTRATION_CATEGORIES[Math.floor(Math.random() * ILLUSTRATION_CATEGORIES.length)]
  const [textRes, catRes] = await Promise.allSettled([
    fetch(`${API}?${textParams}`).then(r => r.json()),
    fetchCategory(randomCategory, 20),
  ])

  const textPages = textRes.status === 'fulfilled' ? pagesFromResponse(textRes.value) : []
  const catPages = catRes.status === 'fulfilled' ? catRes.value : []

  // Deduplicate by pageid
  const seen = new Set<number>()
  const allPages = [...textPages, ...catPages].filter(p => {
    if (seen.has(p.pageid)) return false
    seen.add(p.pageid)
    return true
  })

  const items: ExternalStyleReference[] = allPages
    .map(toRef)
    .filter((r): r is ExternalStyleReference => r !== null)
    .slice(0, 20)

  return { items, total: items.length }
}
