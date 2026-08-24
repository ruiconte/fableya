import { useState, useCallback } from 'react'
import type { ExternalStyleReference, StyleProfile } from '../lib/providers/types'
import { searchOpenverse } from '../lib/providers/openverse'

const MAX_SELECT = 10

const SUGGESTIONS = [
  'vintage children book illustration',
  'watercolor storybook',
  'fairy tale art nouveau',
  'pastel gouache illustration',
  'ink children illustration',
  'Japanese woodblock children',
]

function combinePrompts(refs: ExternalStyleReference[]): string {
  const parts = refs.flatMap(r =>
    r.generatedPrompt.split(',').map(p => p.trim())
  )
  const generic = new Set(["children's book illustration style", 'storybook aesthetic', 'illustrated book artwork', "children's book illustration"])
  const unique = [...new Set(parts)].filter(p => !generic.has(p))
  return [...unique, "children's book illustration style"].join(', ')
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
  const [error, setError] = useState('')
  const [picked, setPicked] = useState<ExternalStyleReference[]>([])

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) return
    setLoading(true)
    setError('')
    setResults([])
    setPicked([])
    try {
      const res = await searchOpenverse(q)
      setResults(res.items)
      if (res.items.length === 0) setError('Aucun résultat. Essayez une autre recherche.')
    } catch {
      setError('Impossible de contacter Openverse. Vérifiez votre connexion.')
    } finally {
      setLoading(false)
    }
  }, [])

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
            ✓ {selected.references.length} image{selected.references.length > 1 ? 's' : ''} sélectionnée{selected.references.length > 1 ? 's' : ''}
          </span>
          <button type="button" onClick={onClear}
            className="text-xs text-kidoria-muted border border-kidoria-sky rounded-lg px-3 py-1 hover:border-kidoria-muted/40 transition-colors">
            Changer
          </button>
        </div>

        {/* Thumbnail strip */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {selected.references.map(ref => (
            <img
              key={ref.externalId}
              src={ref.thumbnailUrl}
              alt={ref.title}
              className="w-16 h-16 object-cover rounded-lg shrink-0 border border-kidoria-sky"
              loading="lazy"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          ))}
        </div>

        {/* Combined prompt */}
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
      {/* Search input */}
      <div className="flex gap-2">
        <input
          type="text"
          className="input flex-1"
          placeholder="Ex: watercolor storybook, vintage fairy tale..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); doSearch(query) } }}
        />
        <button
          type="button"
          disabled={loading || !query.trim()}
          onClick={() => doSearch(query)}
          className="btn-primary px-4 shrink-0 disabled:opacity-50"
        >
          {loading
            ? <span className="block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : '→'}
        </button>
      </div>

      {/* Suggestions */}
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

      {error && (
        <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{error}</p>
      )}

      {results.length > 0 && (
        <div className="space-y-4">
          {/* Counter */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-kidoria-muted">
              {results.length} illustrations · Openverse CC · libres de droits
            </p>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${picked.length > 0 ? 'bg-kidoria-rose/10 text-kidoria-rose' : 'bg-kidoria-lavender text-kidoria-muted'}`}>
              {picked.length}/{MAX_SELECT}
            </span>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {results.map(ref => {
              const idx = picked.findIndex(r => r.externalId === ref.externalId)
              const isSelected = idx !== -1
              const isFull = picked.length >= MAX_SELECT && !isSelected
              return (
                <button
                  key={ref.externalId}
                  type="button"
                  onClick={() => togglePick(ref)}
                  disabled={isFull}
                  className={`relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all group ${
                    isSelected
                      ? 'border-kidoria-rose ring-2 ring-kidoria-rose/30'
                      : isFull
                      ? 'border-transparent opacity-40 cursor-not-allowed'
                      : 'border-transparent hover:border-kidoria-rose/50'
                  }`}
                >
                  <img
                    src={ref.thumbnailUrl}
                    alt={ref.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                    onError={e => { (e.target as HTMLImageElement).parentElement!.style.display = 'none' }}
                  />
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

          {/* Confirm bar */}
          {picked.length > 0 && (
            <div className="rounded-2xl border border-kidoria-rose/30 bg-kidoria-rose/5 p-4 space-y-3">
              {/* Mini strip */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                {picked.map((ref, i) => (
                  <div key={ref.externalId} className="relative shrink-0">
                    <img
                      src={ref.thumbnailUrl}
                      alt={ref.title}
                      className="w-12 h-12 object-cover rounded-lg border border-kidoria-rose/30"
                      loading="lazy"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                    <span className="absolute -top-1.5 -right-1.5 bg-kidoria-rose text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {i + 1}
                    </span>
                  </div>
                ))}
              </div>

              {/* Combined prompt preview */}
              <div className="bg-white rounded-xl px-3 py-2.5">
                <p className="text-[11px] font-semibold text-kidoria-muted uppercase tracking-wide mb-1">Style combiné</p>
                <p className="text-xs text-kidoria-text leading-relaxed italic line-clamp-3">"{combinePrompts(picked)}"</p>
              </div>

              <button type="button" onClick={handleConfirm}
                className="btn-primary w-full justify-center text-sm py-3">
                Utiliser {picked.length === 1 ? 'ce style' : `ces ${picked.length} styles`} →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
