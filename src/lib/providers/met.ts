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

  if (medium.includes('watercolor') || medium.includes('watercolour')) {
    parts.push('delicate watercolor painting, soft washes of color')
  } else if (medium.includes('oil')) {
    parts.push('oil painting style, rich painterly texture')
  } else if (medium.includes('ink')) {
    parts.push('ink illustration, expressive line work')
  } else if (medium.includes('pencil') || medium.includes('graphite')) {
    parts.push('detailed pencil drawing, fine graphite work')
  } else if (medium.includes('pastel')) {
    parts.push('soft pastel artwork, chalky blended colors')
  } else if (medium.includes('woodblock') || medium.includes('woodcut')) {
    parts.push('woodblock print style, bold flat colors and outlines')
  } else if (medium.includes('engraving') || medium.includes('etching')) {
    parts.push('fine engraving style, intricate crosshatching')
  } else if (medium.includes('gouache')) {
    parts.push('gouache illustration, opaque flat colors')
  } else if (obj.medium) {
    parts.push(obj.medium.split(';')[0].trim().toLowerCase())
  }

  if (obj.period) parts.push(obj.period)
  else if (obj.culture) parts.push(obj.culture + ' artistic tradition')

  const tags = (obj.tags || []).map(t => t.term.toLowerCase())
  if (tags.length) parts.push(tags.slice(0, 4).join(', '))

  parts.push("children's book illustration")
  parts.push('storybook aesthetic')

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

export async function searchMet(query: string): Promise<ProviderSearchResult> {
  const searchUrl = `${BASE}/search?q=${encodeURIComponent(query)}&hasImages=true`
  const res = await fetch(searchUrl)
  if (!res.ok) throw new Error('Met API unavailable')

  const { total, objectIDs } = await res.json() as { total: number; objectIDs: number[] | null }
  if (!objectIDs || objectIDs.length === 0) return { items: [], total: 0 }

  // Fetch first 40 in parallel, expect ~20 valid after filtering
  const batch = objectIDs.slice(0, 40)
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

  return { items, total }
}
