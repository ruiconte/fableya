import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { downloadBookPdf } from '../lib/downloadBookPdf'
import type { Book, BookPage } from '../lib/types'

export function ReadBook() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [book, setBook] = useState<Book | null>(null)
  const [pages, setPages] = useState<BookPage[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  const [loading, setLoading] = useState(true)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [cinemaMode, setCinemaMode] = useState(false)
  const [cinemaTextVisible, setCinemaTextVisible] = useState(true)

  useEffect(() => {
    if (!id || !user) return
    Promise.all([
      supabase.from('books').select('*').eq('id', id).eq('user_id', user.id).single(),
      supabase.from('book_pages').select('*').eq('book_id', id).order('page_number'),
    ]).then(([bookResult, pagesResult]) => {
      if (bookResult.error || !bookResult.data) { navigate('/bibliotheque'); return }
      setBook(bookResult.data)
      setPages(pagesResult.data ?? [])
      setLoading(false)
    })
  }, [id, user, navigate])

  const goNext = () => setCurrentPage(p => Math.min(p + 1, pages.length - 1))
  const goPrev = () => setCurrentPage(p => Math.max(p - 1, 0))

  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const handleTouchStart = (e: React.TouchEvent) => setTouchStartX(e.touches[0].clientX)
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return
    const dx = touchStartX - e.changedTouches[0].clientX
    if (Math.abs(dx) > 60) { dx > 0 ? goNext() : goPrev() }
    setTouchStartX(null)
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-kidoria-rose border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!book) {
    return (
      <div className="page-container text-center">
        <div className="text-kidoria-muted font-display text-4xl mb-4">—</div>
        <h1 className="text-2xl font-black mb-3">{t('reader.notFound')}</h1>
        <Link to="/bibliotheque" className="btn-secondary">{t('reader.backToLibrary')}</Link>
      </div>
    )
  }

  // ── Page-by-page reader ─────────────────────────────────────────────────────
  if (pages.length === 0) {
    return (
      <div className="page-container text-center">
        <div className="text-kidoria-muted font-display text-4xl mb-4">—</div>
        <h1 className="text-2xl font-black mb-3">{t('reader.notFound')}</h1>
        <Link to="/bibliotheque" className="btn-secondary">{t('reader.backToLibrary')}</Link>
      </div>
    )
  }

  const page = pages[currentPage]
  const isCover = currentPage === 0

  const toggleCinema = () => {
    setCinemaMode(v => !v)
    setCinemaTextVisible(true)
    if (!cinemaMode) {
      document.documentElement.requestFullscreen?.().catch(() => {})
    } else {
      document.exitFullscreen?.().catch(() => {})
    }
  }

  const handleCinemaTap = (e: React.MouseEvent) => {
    const x = e.clientX / window.innerWidth
    if (x < 0.3) goPrev()
    else if (x > 0.7) goNext()
    else setCinemaTextVisible(v => !v)
  }

  if (cinemaMode) {
    return (
      <div
        className="fixed inset-0 bg-black z-50 flex items-center justify-center select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={handleCinemaTap}
      >
        {page.image_url
          ? <img src={page.image_url} alt={`Page ${page.page_number}`} className="w-full h-full object-contain" />
          : <div className="w-full h-full bg-kidoria-lavender/30" />
        }

        {/* Texte overlay */}
        {!isCover && (
          <div className={`absolute bottom-0 left-0 right-0 transition-opacity duration-300 ${cinemaTextVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="bg-gradient-to-t from-black/80 to-transparent px-6 pt-10 pb-8">
              <p className="text-white text-lg sm:text-xl font-semibold text-center leading-relaxed">{page.text}</p>
            </div>
          </div>
        )}

        {/* Barre haut */}
        <div className={`absolute top-0 left-0 right-0 transition-opacity duration-300 ${cinemaTextVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="bg-gradient-to-b from-black/60 to-transparent px-4 pt-4 pb-8 flex items-center justify-between">
            <button onClick={e => { e.stopPropagation(); toggleCinema() }} className="text-white/80 hover:text-white text-sm font-semibold">✕ Fermer</button>
            <span className="text-white/60 text-sm font-semibold">{currentPage + 1} / {pages.length}</span>
          </div>
        </div>

        {/* Zones tap gauche/droite */}
        <div className="absolute left-0 top-0 w-[30%] h-full" />
        <div className="absolute right-0 top-0 w-[30%] h-full" />
      </div>
    )
  }

  return (
    <div className={`flex flex-col bg-kidoria-cream overflow-hidden ${isFullscreen ? 'h-screen' : 'h-[calc(100vh-4rem)]'}`}>
      {/* Top bar */}
      <div className="shrink-0 bg-white/90 backdrop-blur border-b border-gray-100 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between">
          <Link to="/bibliotheque" className="text-sm font-semibold text-kidoria-muted hover:text-kidoria-text transition-colors">
            {t('reader.myBooks')}
          </Link>
          <h2 className="font-black text-sm sm:text-base truncate max-w-[180px] sm:max-w-none">{book.title}</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-kidoria-muted font-semibold">{currentPage + 1} / {pages.length}</span>
            <button
              onClick={async () => { setPdfLoading(true); try { await downloadBookPdf(book, pages) } finally { setPdfLoading(false) } }}
              disabled={pdfLoading}
              className="text-kidoria-muted hover:text-kidoria-rose transition-colors text-xs font-semibold flex items-center gap-1 disabled:opacity-50"
              title="Télécharger en PDF"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              {pdfLoading ? '…' : 'PDF'}
            </button>
            <button onClick={toggleCinema} className="text-kidoria-muted hover:text-kidoria-text transition-colors text-xs font-semibold sm:hidden">Cinéma</button>
            <button onClick={toggleFullscreen} className="text-kidoria-muted hover:text-kidoria-text transition-colors text-xs font-semibold hidden sm:block">
              {isFullscreen ? 'Réduire' : 'Plein écran'}
            </button>
          </div>
        </div>
      </div>

      {/* Reader area */}
      <div className="flex-1 flex flex-col overflow-hidden"
        onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>

        {isCover ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="max-h-full max-w-[320px] aspect-[3/4] rounded-3xl shadow-soft overflow-hidden">
              {page.image_url
                ? <img src={page.image_url} alt="Cover" className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-gradient-to-br from-kidoria-rose/30 to-kidoria-lavender/30 flex items-center justify-center p-8"><div className="text-center"><h2 className="font-display text-2xl text-kidoria-text">{book.title}</h2></div></div>
              }
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
            {/* Image — left on desktop, top on mobile */}
            <div className="sm:w-1/2 bg-white flex items-center justify-center p-4 sm:p-6 h-1/2 sm:h-full">
              <div className="w-full h-full rounded-3xl overflow-hidden">
                {page.image_url
                  ? <img src={page.image_url} alt={`Page ${page.page_number}`} className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-kidoria-lavender/30" />}
              </div>
            </div>
            {/* Text — right on desktop, bottom on mobile */}
            <div className="sm:w-1/2 flex items-center justify-center p-6 sm:p-10 bg-white/60 h-1/2 sm:h-full overflow-y-auto">
              <p className="text-kidoria-text leading-relaxed text-lg sm:text-2xl font-semibold text-center sm:text-left">{page.text}</p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="shrink-0 bg-white/80 backdrop-blur border-t border-gray-100 py-3 px-4 flex items-center justify-center gap-4">
          <button onClick={goPrev} disabled={currentPage === 0} className="btn-secondary px-6 py-2 disabled:opacity-30 disabled:cursor-not-allowed">
            {t('reader.prev')}
          </button>
          <div className="hidden sm:flex items-center gap-1.5">
            {pages.map((_, i) => (
              <button key={i} onClick={() => setCurrentPage(i)}
                className={`w-2 h-2 rounded-full transition-all ${i === currentPage ? 'bg-kidoria-rose w-4' : 'bg-gray-300 hover:bg-gray-400'}`}
                aria-label={`Page ${i + 1}`} />
            ))}
          </div>
          <button onClick={goNext} disabled={currentPage === pages.length - 1} className="btn-primary px-6 py-2 disabled:opacity-30 disabled:cursor-not-allowed">
            {t('reader.next')}
          </button>
        </div>
      </div>
    </div>
  )
}
