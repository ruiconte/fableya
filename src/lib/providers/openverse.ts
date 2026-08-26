import type { ExternalStyleReference, ProviderSearchResult } from './types'

const BASE = 'https://api.openverse.org/v1'

interface OpenverseImage {
  id: string
  title: string
  creator: string
  creator_url: string
  url: string
  thumbnail: string
  license: string
  license_version: string
  license_url: string
  source: string
  tags: Array<{ name: string }>
  foreign_landing_url: string
  fields_matched?: string[]
}

interface OpenverseResponse {
  count: number
  results: OpenverseImage[]
}

function buildPrompt(img: OpenverseImage): string {
  const parts: string[] = []

  const title = (img.title || '').toLowerCase()
  const tags = img.tags?.map(t => t.name.toLowerCase()) || []
  const combined = [title, ...tags].join(' ')

  if (combined.includes('watercolor') || combined.includes('aquarelle')) {
    parts.push('watercolor painting', 'soft color washes', 'visible paper texture', 'translucent layers')
  } else if (combined.includes('gouache')) {
    parts.push('gouache illustration', 'flat opaque color', 'matte finish', 'bold shapes')
  } else if (combined.includes('ink') && combined.includes('wash')) {
    parts.push('ink and wash', 'flowing ink lines', 'tonal washes', 'high contrast')
  } else if (combined.includes('ink') || combined.includes('engraving')) {
    parts.push('ink illustration', 'precise line work', 'high contrast black outlines', 'minimal color')
  } else if (combined.includes('pastel')) {
    parts.push('pastel artwork', 'chalky soft colors', 'blended matte finish', 'gentle gradients')
  } else if (combined.includes('art nouveau') || combined.includes('nouveau')) {
    parts.push('Art Nouveau style', 'organic flowing lines', 'decorative flat patterns', 'sinuous curves', 'gold accents')
  } else if (combined.includes('woodblock') || combined.includes('ukiyo')) {
    parts.push('woodblock print', 'bold flat color areas', 'strong black outlines', 'graphic shapes', 'limited palette')
  } else if (combined.includes('vintage') || combined.includes('retro')) {
    parts.push('vintage printing style', 'muted aged colors', 'grain texture', 'retro letterpress aesthetic')
  } else if (combined.includes('oil')) {
    parts.push('oil painting', 'thick impasto', 'rich saturated colors', 'visible brushstrokes')
  }

  const STRIP_TAGS = new Set(['illustration', 'book', 'children', 'vintage', 'art', 'drawing', 'painting'])
  const relevantTags = tags.filter(t => !STRIP_TAGS.has(t)).slice(0, 3)
  if (relevantTags.length) parts.push(relevantTags.join(', '))

  return parts.filter(Boolean).join(', ')
}

function rightsLabel(license: string): string {
  const l = license.toLowerCase()
  if (l === 'cc0') return 'CC0 — domaine public'
  if (l.includes('by') && !l.includes('sa') && !l.includes('nd')) return 'CC BY'
  if (l.includes('by-sa')) return 'CC BY-SA'
  return license.toUpperCase()
}

export async function searchOpenverse(query: string, page = 1): Promise<ProviderSearchResult> {
  // rawpixel = thousands of CC0 children's book illustrations (Greenaway, Crane, Caldecott + modern)
  // nypl = New York Public Library digitized collections
  // flickr = Flickr Commons (museum/library uploads)
  const url = `${BASE}/images/?q=${encodeURIComponent(query)}&license_type=commercial&source=rawpixel,nypl,flickr&page_size=20&page=${page}`
  const res = await fetch(url, {
    headers: { 'Accept': 'application/json' },
  })
  if (!res.ok) throw new Error('Openverse API unavailable')

  const data: OpenverseResponse = await res.json()

  const items: ExternalStyleReference[] = data.results
    .filter(img => img.thumbnail && img.url)
    .map(img => ({
      provider: 'met' as const, // reuse type — openverse compatible
      externalId: img.id,
      title: img.title || 'Sans titre',
      creator: img.creator || 'Auteur inconnu',
      thumbnailUrl: img.thumbnail,
      imageUrl: img.url,
      sourceUrl: img.foreign_landing_url || img.creator_url || img.url,
      medium: img.source || '',
      period: rightsLabel(img.license),
      tags: img.tags?.map(t => t.name) || [],
      attribution: `${img.creator || 'Auteur inconnu'}. "${img.title}". Source: ${img.source}. Licence ${img.license.toUpperCase()} ${img.license_version}.`,
      generatedPrompt: buildPrompt(img),
    }))

  return { items, total: data.count }
}
