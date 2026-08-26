import type { ExternalStyleReference, ProviderSearchResult } from './types'

const BASE = 'https://collectionapi.metmuseum.org/public/collection/v1'

interface MetObject {
  objectID: number
  title: string
  artistDisplayName: string
  medium: string
  objectDate: string
  period: string
  culture: string
  primaryImage: string
  primaryImageSmall: string
  isPublicDomain: boolean
  objectURL: string
  tags?: Array<{ term: string }>
}

function buildPrompt(obj: MetObject): string {
  const parts: string[] = []
  const medium = (obj.medium || '').toLowerCase()

  // Medium → specific rendering style descriptors
  if (medium.includes('watercolor') || medium.includes('watercolour')) {
    parts.push('watercolor painting', 'soft color washes', 'visible paper texture', 'wet-on-wet blending', 'translucent layers')
  } else if (medium.includes('oil')) {
    parts.push('oil painting', 'thick impasto brushwork', 'rich saturated colors', 'painterly texture', 'visible brushstrokes')
  } else if (medium.includes('ink') && medium.includes('wash')) {
    parts.push('ink and wash', 'flowing ink lines', 'tonal washes', 'high contrast')
  } else if (medium.includes('ink')) {
    parts.push('ink illustration', 'precise line work', 'high contrast black lines', 'minimal color')
  } else if (medium.includes('pencil') || medium.includes('graphite')) {
    parts.push('pencil drawing', 'fine graphite lines', 'subtle shading', 'monochromatic', 'delicate hatching')
  } else if (medium.includes('pastel')) {
    parts.push('pastel artwork', 'chalky soft colors', 'blended matte finish', 'gentle gradients')
  } else if (medium.includes('woodblock') || medium.includes('woodcut')) {
    parts.push('woodblock print', 'bold flat color areas', 'strong black outlines', 'graphic shapes', 'limited palette')
  } else if (medium.includes('engraving') || medium.includes('etching')) {
    parts.push('engraving style', 'fine crosshatching', 'intricate line patterns', 'high detail', 'monochromatic')
  } else if (medium.includes('gouache')) {
    parts.push('gouache illustration', 'flat opaque color', 'matte finish', 'bold shapes', 'no transparency')
  } else if (medium.includes('lithograph')) {
    parts.push('lithograph style', 'flat tonal areas', 'grainy texture', 'limited palette')
  } else if (obj.medium) {
    parts.push(obj.medium.split(';')[0].trim().toLowerCase())
  }

  // Period / culture → era flavor
  if (obj.period) parts.push(obj.period + ' era style')
  else if (obj.culture) parts.push(obj.culture + ' artistic tradition')

  // Tags → subject/mood clues (style-relevant only)
  const STYLE_TAG_WORDS = ['line', 'color', 'flat', 'bold', 'pattern', 'ornament', 'silhouette', 'graphic', 'naive', 'folk', 'expressionist', 'impressionist']
  const tags = (obj.tags || []).map(t => t.term.toLowerCase()).filter(t => STYLE_TAG_WORDS.some(w => t.includes(w)))
  if (tags.length) parts.push(tags.slice(0, 3).join(', '))

  return parts.filter(Boolean).join(', ')
}

async function fetchObject(id: number): Promise<(MetObject & { _prompt: string }) | null> {
  try {
    const res = await fetch(`${BASE}/objects/${id}`)
    if (!res.ok) return null
    const obj: MetObject = await res.json()
    if (!obj.isPublicDomain || !obj.primaryImageSmall) return null
    return { ...obj, _prompt: buildPrompt(obj) }
  } catch {
    return null
  }
}

export async function searchMet(query: string, allIds?: number[], page = 0): Promise<ProviderSearchResult & { allIds: number[] }> {
  let ids = allIds
  let total = 0

  if (!ids) {
    const searchUrl = `${BASE}/search?q=${encodeURIComponent(query)}&hasImages=true&isPublicDomain=true`
    const res = await fetch(searchUrl)
    if (!res.ok) throw new Error('Met API unavailable')
    const data = await res.json() as { total: number; objectIDs: number[] | null }
    ids = data.objectIDs ?? []
    total = data.total
  } else {
    total = ids.length
  }

  if (ids.length === 0) return { items: [], total: 0, allIds: [] }

  // Each page: take the next batch of 60 candidates, expect ~20 valid
  const batch = ids.slice(page * 60, (page + 1) * 60)
  if (batch.length === 0) return { items: [], total, allIds: ids }

  const results = await Promise.all(batch.map(fetchObject))
  const valid = results.filter((o): o is NonNullable<typeof o> => o !== null)

  const items: ExternalStyleReference[] = valid.slice(0, 20).map(obj => ({
    provider: 'met' as const,
    externalId: String(obj.objectID),
    title: obj.title || 'Untitled',
    creator: obj.artistDisplayName || 'Unknown artist',
    thumbnailUrl: obj.primaryImageSmall,
    imageUrl: obj.primaryImage || obj.primaryImageSmall,
    sourceUrl: obj.objectURL,
    medium: obj.medium || '',
    period: obj.period || obj.objectDate || '',
    tags: (obj.tags || []).map(t => t.term),
    attribution: `${obj.artistDisplayName || 'Unknown artist'}. "${obj.title}". The Metropolitan Museum of Art.`,
    generatedPrompt: obj._prompt,
  }))

  return { items, total, allIds: ids }
}
