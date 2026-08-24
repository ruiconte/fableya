import { useState, useCallback, useRef } from 'react'
import type { ExternalStyleReference, StyleProfile } from '../lib/providers/types'
import { searchMet } from '../lib/providers/met'

const SUGGESTIONS = [
  'watercolor botanical',
  'vintage fairy tale',
  'Japanese woodblock',
  'ink illustration',
  'pastel gouache',
  'Art Nouveau',
]

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
  const [total, setTotal] = useState(0)
  const [highlighted, setHighlighted] = useState<ExternalStyleReference | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) return
    setLoading(true)
    setError('')
    setHighlighted(null)
    setResults([])
    try {
      const res = await searchMet(q)
      setResults(res.items)
      setTotal(res.total)
      if (res.items.length === 0) setError('Aucun résultat. Essayez une autre recherche.')
    } catch {
      setError('Impossible de contacter The Met. Vérifiez votre connexion.')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    doSearch(query)
  }

  const handleSuggestion = (s: string) => {
    setQuery(s)
    doSearch(s)
  }

  const handlePick = (ref: ExternalStyleReference) => {
    setHighlighted(ref)
  }

  const handleConfirm = () => {
    if (!highlighted) return
    onSelect({ reference: highlighted, generatedPrompt: highlighted.generatedPrompt })
  }

  if (selected) {
    return (
      <div className="rounded-2xl border-2 border-kidoria-rose bg-kidoria-rose/5 p-5">
        <div className="flex items-start gap-4">
          <img
            src={selected.reference.thumbnailUrl}
            alt={selected.reference.title}
            className="w-20 h-20 object-cover rounded-xl shrink-0 border border-kidoria-sky"
            loading="lazy"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-kidoria-rose text-sm font-bold">✓ Direction visuelle</span>
            </div>
            <p className="font-semibold text-sm text-kidoria-text truncate">{selected.reference.title}</p>
            <p className="text-xs text-kidoria-muted mb-2">{selected.reference.creator} · {selected.reference.period}</p>
            <p className="text-xs text-kidoria-muted italic leading-snug line-clamp-2">
              "{selected.generatedPrompt}"
            </p>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button
            type="button"
            onClick={onClear}
            className="flex-1 rounded-xl border border-kidoria-sky py-2 text-sm text-kidoria-muted hover:border-kidoria-muted/40 transition-colors"
          >
            Changer
          </button>
          <a
            href={selected.reference.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-kidoria-muted underline underline-offset-2 self-center ml-2 shrink-0"
          >
            Source ↗
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search input */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          className="input flex-1"
          placeholder="Ex: watercolor forest, vintage ink, Japanese print..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="btn-primary px-4 shrink-0 disabled:opacity-50"
        >
          {loading ? (
            <span className="block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : '→'}
        </button>
      </form>

      {/* Suggestions */}
      {results.length === 0 && !loading && !error && (
        <div>
          <p className="text-xs text-kidoria-muted mb-2 font-semibold">Suggestions :</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => handleSuggestion(s)}
                className="text-xs bg-kidoria-cream hover:bg-kidoria-rose/10 border border-kidoria-sky hover:border-kidoria-rose/40 rounded-full px-3 py-1.5 text-kidoria-muted hover:text-kidoria-text transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{error}</p>
      )}

      {/* Results info */}
      {results.length > 0 && (
        <p className="text-xs text-kidoria-muted">
          {results.length} résultats affichés sur {total.toLocaleString()} · The Metropolitan Museum of Art · domaine public
        </p>
      )}

      {/* Results grid */}
      {results.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {results.map(ref => (
            <button
              key={ref.externalId}
              type="button"
              onClick={() => handlePick(ref)}
              className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all group ${
                highlighted?.externalId === ref.externalId
                  ? 'border-kidoria-rose ring-2 ring-kidoria-rose/30'
                  : 'border-transparent hover:border-kidoria-rose/50'
              }`}
            >
              <img
                src={ref.thumbnailUrl}
                alt={ref.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              {highlighted?.externalId === ref.externalId && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-kidoria-rose text-white text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center">✓</span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Confirmation card when an image is highlighted */}
      {highlighted && (
        <div className="rounded-2xl border border-kidoria-sky bg-white p-4 space-y-3">
          <div className="flex gap-3">
            <img
              src={highlighted.thumbnailUrl}
              alt={highlighted.title}
              className="w-16 h-16 object-cover rounded-lg shrink-0"
              loading="lazy"
            />
            <div className="min-w-0">
              <p className="font-semibold text-sm text-kidoria-text leading-snug">{highlighted.title}</p>
              <p className="text-xs text-kidoria-muted">{highlighted.creator}</p>
              {highlighted.medium && <p className="text-xs text-kidoria-muted/70 mt-0.5">{highlighted.medium.split(';')[0]}</p>}
            </div>
          </div>
          <div className="bg-kidoria-cream rounded-xl px-3 py-2.5">
            <p className="text-[11px] font-semibold text-kidoria-muted uppercase tracking-wide mb-1">Style extrait</p>
            <p className="text-xs text-kidoria-text leading-relaxed italic">"{highlighted.generatedPrompt}"</p>
          </div>
          <p className="text-[10px] text-kidoria-muted leading-snug">{highlighted.attribution}</p>
          <button
            type="button"
            onClick={handleConfirm}
            className="btn-primary w-full justify-center text-sm py-2.5"
          >
            Utiliser ce style →
          </button>
        </div>
      )}
    </div>
  )
}
