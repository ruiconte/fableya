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
  }
}

interface WikiPage {
  pageid: number
  title: string
  imageinfo?: WikiImageInfo[]
}

// Large pool of illustration categories to cycle through indefinitely
export const ILLUSTRATION_CATEGORIES = [
  "Children's_book_illustrations",
  "Fairy_tale_illustrations",
  "Picture_books",
  "Illustrated_books_for_children",
  "Arthur_Rackham",
  "Walter_Crane_(artist)",
  "Kate_Greenaway",
  "Randolph_Caldecott",
  "Edmund_Dulac",
  "Kay_Nielsen",
  "John_Bauer_(illustrator)",
  "Heinrich_Vogeler",
  "Carl_Larsson",
  "Beatrix_Potter",
  "Ernst_Kreidolf",
  "Elsa_Beskow",
  "Books_illustrated_by_Arthur_Rackham",
  "Books_illustrated_by_Edmund_Dulac",
  "Grimm's_Fairy_Tales_illustrations",
  "Illustrations_of_fairy_tales",
  "Woodblock_prints_of_Japan",
  "Ukiyo-e",
  "Japanese_picture_books",
  "Watercolor_paintings",
  "Art_Nouveau_illustrations",
  "Victorian_illustrations",
  "Illustrations_by_Walter_Crane",
  "Illustrations_by_Kate_Greenaway",
  "Vintage_children_illustrations",
  "Storybook_illustrations",
  "Andersen_fairy_tales_illustrations",
]

function stripHtml(s: string): string {
  return s.replace(/<[^>]*>/g, '').trim()
}

function buildPrompt(title: string, description: string): string {
  const combined = (title + ' ' + description).toLowerCase()
  const parts: string[] = []

  if (combined.includes('watercolor') || combined.includes('aquarelle')) {
    parts.push('watercolor painting', 'soft color washes', 'visible paper texture', 'translucent layers')
  } else if (combined.includes('engraving') || combined.includes('gravure') || combined.includes('etching')) {
    parts.push('engraving style', 'fine crosshatching', 'intricate line patterns', 'high detail', 'monochromatic')
  } else if (combined.includes('art nouveau') || combined.includes('nouveau')) {
    parts.push('Art Nouveau style', 'organic flowing lines', 'decorative flat patterns', 'sinuous curves', 'ornamental borders')
  } else if (combined.includes('woodcut') || combined.includes('woodblock') || combined.includes('ukiyo')) {
    parts.push('woodblock print', 'bold flat color areas', 'strong black outlines', 'graphic shapes', 'limited palette')
  } else if (combined.includes('lithograph')) {
    parts.push('lithograph style', 'flat tonal areas', 'grainy texture', 'muted limited palette')
  } else if (combined.includes('ink') || combined.includes('pen')) {
    parts.push('pen and ink illustration', 'precise black line work', 'high contrast', 'crosshatching shading')
  } else if (combined.includes('gouache')) {
    parts.push('gouache illustration', 'flat opaque color', 'matte finish', 'bold shapes', 'no transparency')
  } else if (combined.includes('oil') || combined.includes('painting')) {
    parts.push('oil painting', 'thick impasto brushwork', 'rich saturated colors', 'painterly texture')
  } else if (combined.includes('pastel')) {
    parts.push('pastel artwork', 'chalky soft colors', 'blended matte finish')
  }

  // Extract discriminative style keywords from title (artist names, movements, eras)
  const SKIP_WORDS = new Set(['file', 'from', 'with', 'illustration', 'illustratie', 'book', 'page', 'plate', 'figure', 'image'])
  const clean = title.replace(/^File:/, '').replace(/\.[^.]+$/, '').replace(/[_-]/g, ' ')
  const keywords = clean
    .split(' ')
    .filter(w => w.length > 3 && !SKIP_WORDS.has(w.toLowerCase()))
    .slice(0, 3)
    .join(', ')
    .toLowerCase()
  if (keywords) parts.push(keywords)

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

async function fetchCategory(category: string, page = 0): Promise<WikiPage[]> {
  const params = new URLSearchParams({
    action: 'query',
    generator: 'categorymembers',
    gcmtitle: `Category:${category}`,
    gcmtype: 'file',
    gcmlimit: '30',
    gcmoffset: String(page * 30),
    prop: 'imageinfo',
    iiprop: 'url|thumburl|extmetadata',
    iiurlwidth: '400',
    format: 'json',
    origin: '*',
  })
  const res = await fetch(`${API}?${params}`)
  if (!res.ok) return []
  const data = await res.json()
  return pagesFromResponse(data)
}

// page = text search page, catIdx = which category to browse in parallel
export async function searchWikimedia(query: string, page = 0, catIdx = 0): Promise<ProviderSearchResult & { catIdx: number }> {
  const category = ILLUSTRATION_CATEGORIES[catIdx % ILLUSTRATION_CATEGORIES.length]
  const catPage = Math.floor(catIdx / ILLUSTRATION_CATEGORIES.length)

  const textParams = new URLSearchParams({
    action: 'query',
    generator: 'search',
    gsrsearch: query + ' illustration',
    gsrnamespace: '6',
    gsrlimit: '30',
    gsroffset: String(page * 30),
    prop: 'imageinfo',
    iiprop: 'url|thumburl|mediatype|extmetadata',
    iiurlwidth: '400',
    format: 'json',
    origin: '*',
  })

  const [textRes, catRes] = await Promise.allSettled([
    fetch(`${API}?${textParams}`).then(r => r.json()),
    fetchCategory(category, catPage),
  ])

  const textPages = textRes.status === 'fulfilled' ? pagesFromResponse(textRes.value) : []
  const catPages = catRes.status === 'fulfilled' ? catRes.value : []

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

  return { items, total: items.length, catIdx: catIdx + 1 }
}
