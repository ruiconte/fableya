import { useState, useCallback, useRef } from 'react'
import type { ExternalStyleReference, StyleProfile } from '../lib/providers/types'
import { searchMet } from '../lib/providers/met'
import { searchWikimedia, ILLUSTRATION_CATEGORIES } from '../lib/providers/wikimedia'
import { searchOpenverse } from '../lib/providers/openverse'
import { searchArchive } from '../lib/providers/archive'

const MAX_SELECT = 10

const SUGGESTIONS = [
  'watercolor fairy tale',
  'art nouveau illustration',
  'vintage engraving children',
  'Japanese woodblock',
  'pastel storybook',
  'ink drawing fairy tale',
  'Hansel Gretel Rackham',
  'Alice Wonderland illustration',
]

// Query variants: when a specific search exhausts, broaden progressively
function buildVariants(q: string): string[] {
  return [
    q,
    q + ' children',
    'children book illustration',
    'fairy tale illustration',
    'watercolor children illustration',
    'vintage storybook illustration',
    'picture book art',
    'illustrated fairy tale',
    'art nouveau children',
    'classic children illustration',
  ]
}

function combinePrompts(refs: ExternalStyleReference[]): string {
  const parts = refs.flatMap(r => r.generatedPrompt.split(',').map(p => p.trim()))
  const generic = new Set(["children's book illustration style", 'storybook aesthetic', 'illustrated book artwork', "children's book illustration"])
  const unique = [...new Set(parts)].filter(p => !generic.has(p))
  return [...unique, "children's book illustration style"].join(', ')
}

interface PageState {
  // Met
  metPage: number
  metAllIds: number[]
  metVariantIdx: number
  // Wikimedia
  wikiPage: number
  wikiCatIdx: number
  wikiVariantIdx: number
  // Openverse
  ovPage: number
  ovVariantIdx: number
  // Archive
  archPage: number
  archVariantIdx: number
  // Shared variants list
  variants: string[]
}

interface Props {
  selected: StyleProfile | null
  onSelect: (profile: StyleProfile) => void
  onClear: () => void
}

export function StyleExplorer({ selected, onSelect, onClear }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ExternalStyleReference[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')
  const [picked, setPicked] = useState<ExternalStyleReference[]>([])
  const pageState = useRef<PageState | null>(null)
  const loadingMoreRef = useRef(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const seenIds = useRef<Set<string>>(new Set())

  const fetchPage = useCallback(async (ps: PageState, append: boolean) => {
    const metVariant = ps.variants[Math.min(ps.metVariantIdx, ps.variants.length - 1)]
    const wikiVariant = ps.variants[Math.min(ps.wikiVariantIdx, ps.variants.length - 1)]
    const ovVariant = ps.variants[Math.min(ps.ovVariantIdx, ps.variants.length - 1)]
    const archVariant = ps.variants[Math.min(ps.archVariantIdx, ps.variants.length - 1)]

    const [metRes, wikiRes, ovRes, archRes] = await Promise.allSettled([
      searchMet(metVariant, ps.metAllIds.length ? ps.metAllIds : undefined, ps.metPage),
      searchWikimedia(wikiVariant, ps.wikiPage, ps.wikiCatIdx),
      searchOpenverse(ovVariant, ps.ovPage),
      searchArchive(archVariant, ps.archPage),
    ])

    const metResult = metRes.status === 'fulfilled' ? metRes.value : null
    const metItems = metResult?.items ?? []
    const wikiResult = wikiRes.status === 'fulfilled' ? wikiRes.value : null
    const wikiItems = wikiResult?.items ?? []
    const ovItems = ovRes.status === 'fulfilled' ? ovRes.value.items : []
    const archItems = archRes.status === 'fulfilled' ? archRes.value.items : []

    // Interleave
    const merged: ExternalStyleReference[] = []
    const max = Math.max(metItems.length, wikiItems.length, ovItems.length, archItems.length)
    for (let i = 0; i < max; i++) {
      if (metItems[i]) merged.push(metItems[i])
      if (wikiItems[i]) merged.push(wikiItems[i])
      if (ovItems[i]) merged.push(ovItems[i])
      if (archItems[i]) merged.push(archItems[i])
    }

    // Deduplicate globally across all pages
    const fresh = merged.filter(r => !seenIds.current.has(r.externalId))
    fresh.forEach(r => seenIds.current.add(r.externalId))

    if (append) {
      setResults(prev => [...prev, ...fresh])
    } else {
      setResults(fresh)
    }

    // Advance each provider's state; if exhausted, bump variant
    const nextIds = metResult?.allIds ?? ps.metAllIds
    const metHasMore = nextIds.length > (ps.metPage + 1) * 60
    const nextMetVariant = !metHasMore ? ps.metVariantIdx + 1 : ps.metVariantIdx

    // Wikimedia: category pool is virtually infinite (31 categories × many pages each)
    // Text search page advances; catIdx always advances to cycle categories
    const wikiTextHasMore = wikiItems.length >= 10
    const nextWikiPage = wikiTextHasMore ? ps.wikiPage + 1 : ps.wikiPage
    const nextWikiVariant = !wikiTextHasMore ? ps.wikiVariantIdx + 1 : ps.wikiVariantIdx

    const ovHasMore = ovItems.length >= 10
    const nextOvPage = ovHasMore ? ps.ovPage + 1 : 1
    const nextOvVariant = !ovHasMore ? ps.ovVariantIdx + 1 : ps.ovVariantIdx

    const archHasMore = archItems.length >= 5
    const nextArchPage = archHasMore ? ps.archPage + 1 : 0
    const nextArchVariant = !archHasMore ? ps.archVariantIdx + 1 : ps.archVariantIdx

    // Always hasMore: Wikimedia categories pool is ~31 categories, each with many pages
    // We stop only when we've cycled through all variants AND all categories
    const catExhausted = wikiResult?.catIdx !== undefined
      ? wikiResult.catIdx > ILLUSTRATION_CATEGORIES.length * 3
      : false
    const variantsExhausted = nextMetVariant >= ps.variants.length
      && nextWikiVariant >= ps.variants.length
      && nextOvVariant >= ps.variants.length
      && nextArchVariant >= ps.variants.length

    pageState.current = {
      metPage: metHasMore ? ps.metPage + 1 : 0,
      metAllIds: metHasMore ? nextIds : [],
      metVariantIdx: nextMetVariant,
      wikiPage: nextWikiPage,
      wikiCatIdx: wikiResult?.catIdx ?? ps.wikiCatIdx + 1,
      wikiVariantIdx: nextWikiVariant,
      ovPage: nextOvPage,
      ovVariantIdx: nextOvVariant,
      archPage: nextArchPage,
      archVariantIdx: nextArchVariant,
      variants: ps.variants,
      // hasMore is stored implicitly — we check below
      _hasMore: !(catExhausted && variantsExhausted),
    } as PageState & { _hasMore: boolean }

    return fresh.length
  }, [])

  const loadMore = useCallback(async () => {
    const ps = pageState.current as (PageState & { _hasMore?: boolean }) | null
    if (!ps || ps._hasMore === false || loadingMoreRef.current) return
    loadingMoreRef.current = true
    setLoadingMore(true)
    try {
      await fetchPage(ps, true)
    } finally {
      loadingMoreRef.current = false
      setLoadingMore(false)
    }
  }, [fetchPage])

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 400) {
      loadMore()
    }
  }, [loadMore])

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) return
    setLoading(true)
    setError('')
    setResults([])
    setPicked([])
    seenIds.current = new Set()
    pageState.current = null

    const variants = buildVariants(q)
    const initialState: PageState = {
      metPage: 0, metAllIds: [], metVariantIdx: 0,
      wikiPage: 0, wikiCatIdx: 0, wikiVariantIdx: 0,
      ovPage: 1, ovVariantIdx: 0,
      archPage: 0, archVariantIdx: 0,
      variants,
    }
    // seed _hasMore
    ;(initialState as PageState & { _hasMore: boolean })._hasMore = true

    try {
      const count = await fetchPage(initialState, false)
      if (count === 0) setError('Aucun résultat. Essayez un autre terme.')
    } catch {
      setError('Impossible de charger les images. Vérifiez votre connexion.')
    } finally {
      setLoading(false)
    }
  }, [fetchPage])

  const togglePick = (ref: ExternalStyleReference) => {
    setPicked(prev => {
      const already = prev.find(r => r.externalId === ref.externalId)
      if (already) return prev.filter(r => r.externalId !== ref.externalId)
      if (prev.length >= MAX_SELECT) return prev
      return [...prev, ref]
    })
  }

  const handleConfirm = () => {
    if (picked.length === 0) return
    onSelect({ references: picked, generatedPrompt: combinePrompts(picked) })
  }

  const handleSuggestion = (s: string) => {
    setQuery(s)
    doSearch(s)
  }

  // ── Selected state ──────────────────────────────────────────────────────────
  if (selected) {
    return (
      <div className="rounded-2xl border-2 border-kidoria-rose bg-kidoria-rose/5 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-kidoria-rose text-sm font-bold">
            {selected.references.length} image{selected.references.length > 1 ? 's' : ''} sélectionnée{selected.references.length > 1 ? 's' : ''}
          </span>
          <button type="button" onClick={onClear}
            className="text-xs text-kidoria-muted border border-kidoria-sky rounded-lg px-3 py-1 hover:border-kidoria-muted/40 transition-colors">
            Changer
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {selected.references.map(ref => (
            <img key={ref.externalId} src={ref.thumbnailUrl} alt={ref.title}
              className="w-16 h-16 object-cover rounded-lg shrink-0 border border-kidoria-sky"
              loading="lazy" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
          ))}
        </div>
        <div className="bg-kidoria-cream rounded-xl px-3 py-2.5">
          <p className="text-[11px] font-semibold text-kidoria-muted uppercase tracking-wide mb-1">Style combiné</p>
          <p className="text-xs text-kidoria-text leading-relaxed italic">"{selected.generatedPrompt}"</p>
        </div>
      </div>
    )
  }

  // ── Search state ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        <input type="text" className="input flex-1"
          placeholder="Ex: watercolor storybook, vintage fairy tale..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); doSearch(query) } }}
        />
        <button type="button" disabled={loading || !query.trim()} onClick={() => doSearch(query)}
          className="btn-primary px-4 shrink-0 disabled:opacity-50">
          {loading
            ? <span className="block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : '→'}
        </button>
      </div>

      {results.length === 0 && !loading && !error && (
        <div>
          <p className="text-xs text-kidoria-muted mb-2 font-semibold">Suggestions :</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map(s => (
              <button key={s} type="button" onClick={() => handleSuggestion(s)}
                className="text-xs bg-kidoria-cream hover:bg-kidoria-rose/10 border border-kidoria-sky hover:border-kidoria-rose/40 rounded-full px-3 py-1.5 text-kidoria-muted hover:text-kidoria-text transition-all">
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{error}</p>}

      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-kidoria-muted">
              {results.length} illustrations chargées · scroll pour en voir plus
            </p>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${picked.length > 0 ? 'bg-kidoria-rose/10 text-kidoria-rose' : 'bg-kidoria-lavender text-kidoria-muted'}`}>
              {picked.length}/{MAX_SELECT}
            </span>
          </div>

          {/* Scrollable grid */}
          <div ref={scrollContainerRef} onScroll={handleScroll} className="h-[520px] overflow-y-auto rounded-2xl pr-1" style={{ scrollbarWidth: 'thin' }}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {results.map(ref => {
                const idx = picked.findIndex(r => r.externalId === ref.externalId)
                const isSelected = idx !== -1
                const isFull = picked.length >= MAX_SELECT && !isSelected
                return (
                  <button key={ref.externalId} type="button" onClick={() => togglePick(ref)} disabled={isFull}
                    className={`relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all group ${
                      isSelected ? 'border-kidoria-rose ring-2 ring-kidoria-rose/30'
                      : isFull ? 'border-transparent opacity-40 cursor-not-allowed'
                      : 'border-transparent hover:border-kidoria-rose/50'
                    }`}
                  >
                    <img src={ref.thumbnailUrl} alt={ref.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                      onError={e => { (e.target as HTMLImageElement).parentElement!.style.display = 'none' }} />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <span className="bg-kidoria-rose text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow">
                          {idx + 1}
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-[10px] leading-tight line-clamp-2">{ref.title}</p>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Loading indicator */}
            <div className="flex items-center justify-center py-6">
              {loadingMore && (
                <span className="w-5 h-5 border-2 border-kidoria-muted border-t-transparent rounded-full animate-spin" />
              )}
            </div>
          </div>

          {/* Confirm bar */}
          {picked.length > 0 && (
            <div className="rounded-2xl border border-kidoria-rose/30 bg-kidoria-rose/5 p-4 space-y-3">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {picked.map((ref, i) => (
                  <div key={ref.externalId} className="relative shrink-0">
                    <img src={ref.thumbnailUrl} alt={ref.title}
                      className="w-12 h-12 object-cover rounded-lg border border-kidoria-rose/30"
                      loading="lazy" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    <span className="absolute -top-1.5 -right-1.5 bg-kidoria-rose text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {i + 1}
                    </span>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-xl px-3 py-2.5">
                <p className="text-[11px] font-semibold text-kidoria-muted uppercase tracking-wide mb-1">Style combiné</p>
                <p className="text-xs text-kidoria-text leading-relaxed italic line-clamp-3">"{combinePrompts(picked)}"</p>
              </div>
              <button type="button" onClick={handleConfirm} className="btn-primary w-full justify-center text-sm py-3">
                Utiliser {picked.length === 1 ? 'ce style' : `ces ${picked.length} styles`} →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
