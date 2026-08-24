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
  } else if (combined.includes('oil') || combined.includes('painting')) {
    parts.push('oil painting style, rich colors')
  } else {
    parts.push('classic book illustration style')
  }

  // Extract useful keywords from title (file name)
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

export async function searchWikimedia(query: string): Promise<ProviderSearchResult> {
  // One-shot: generator search + imageinfo in same request
  const params = new URLSearchParams({
    action: 'query',
    generator: 'search',
    gsrsearch: query + ' illustration',
    gsrnamespace: '6',       // File namespace only
    gsrlimit: '30',
    prop: 'imageinfo',
    iiprop: 'url|thumburl|mediatype|extmetadata',
    iiurlwidth: '400',
    format: 'json',
    origin: '*',
  })

  const res = await fetch(`${API}?${params}`)
  if (!res.ok) throw new Error('Wikimedia API unavailable')

  const data = await res.json()
  const pages: WikiPage[] = Object.values(data?.query?.pages ?? {})

  const items: ExternalStyleReference[] = pages
    .filter(p => {
      const info = p.imageinfo?.[0]
      if (!info?.thumburl) return false
      const url = (info.url || '').toLowerCase()
      return url.endsWith('.jpg') || url.endsWith('.jpeg') || url.endsWith('.png')
    })
    .map(p => {
      const info = p.imageinfo![0]
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
    })
    .slice(0, 15)

  return { items, total: items.length }
}
