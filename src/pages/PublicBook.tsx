import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { SAMPLE_BOOK_MAP } from '../lib/sampleBooks'

export function PublicBook() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const book = id ? SAMPLE_BOOK_MAP[id] : null

  const [currentPage, setCurrentPage] = useState(0)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)

  if (!book) {
    navigate('/')
    return null
  }

  const pages = book.pages
  const page = pages[currentPage]
  const isLast = currentPage === pages.length - 1

  const goNext = () => setCurrentPage(p => Math.min(p + 1, pages.length - 1))
  const goPrev = () => setCurrentPage(p => Math.max(p - 1, 0))
  const handleTouchStart = (e: React.TouchEvent) => setTouchStartX(e.touches[0].clientX)
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return
    const dx = touchStartX - e.changedTouches[0].clientX
    if (Math.abs(dx) > 60) { dx > 0 ? goNext() : goPrev() }
    setTouchStartX(null)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-kidoria-cream overflow-hidden">
      <div className="shrink-0 bg-white/90 backdrop-blur border-b border-gray-100 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between">
          <Link to="/" className="text-sm font-semibold text-kidoria-muted hover:text-kidoria-text transition-colors">
            ← Accueil
          </Link>
          <span className="font-black text-sm sm:text-base truncate max-w-[200px]">{book.title}</span>
          <span className="text-sm text-kidoria-muted font-semibold">{currentPage + 1} / {pages.length}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
          <div className="sm:w-1/2 bg-white flex items-center justify-center p-4 sm:p-6 h-1/2 sm:h-full">
            <div className="w-full h-full rounded-3xl overflow-hidden">
              {page?.image_url
                ? <img src={page.image_url} alt={`Page ${page.page_number}`} className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-kidoria-lavender/30" />}
            </div>
          </div>
          <div className="sm:w-1/2 flex items-center justify-center p-6 sm:p-10 bg-white/60 h-1/2 sm:h-full overflow-y-auto">
            <p className="text-kidoria-text leading-relaxed text-lg sm:text-2xl font-semibold text-center sm:text-left">{page?.text}</p>
          </div>
        </div>

        <div className="shrink-0 bg-white/80 backdrop-blur border-t border-gray-100 py-3 px-4 flex items-center justify-center gap-4">
          <button onClick={goPrev} disabled={currentPage === 0} className="btn-secondary px-6 py-2 disabled:opacity-30 disabled:cursor-not-allowed">
            Précédent
          </button>
          <div className="hidden sm:flex items-center gap-1.5">
            {pages.map((_, i) => (
              <button key={i} onClick={() => setCurrentPage(i)}
                className={`w-2 h-2 rounded-full transition-all ${i === currentPage ? 'bg-kidoria-rose w-4' : 'bg-gray-300 hover:bg-gray-400'}`} />
            ))}
          </div>
          {isLast ? (
            <Link to="/creer" className="btn-primary px-6 py-2">
              Créer mon livre →
            </Link>
          ) : (
            <button onClick={goNext} className="btn-primary px-6 py-2">Suivant</button>
          )}
        </div>
      </div>

      {isLast && (
        <div className="shrink-0 bg-gradient-to-r from-kidoria-rose/20 to-kidoria-lavender/20 border-t border-kidoria-rose/20 px-4 py-3 text-center">
          <p className="text-sm font-semibold text-kidoria-text">
            Votre livre contiendra 15 pages personnalisées avec le prénom de votre enfant —{' '}
            <Link to="/creer" className="text-kidoria-rose underline font-black">Créer mon livre</Link>
          </p>
        </div>
      )}
    </div>
  )
}
