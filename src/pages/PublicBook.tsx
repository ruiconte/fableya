import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { SAMPLE_BOOK_MAP } from '../lib/sampleBooks'

interface Page {
  page_number: number
  text: string
  image_url: string
}

export function PublicBook() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [pages, setPages] = useState<Page[]>([])
  const [title, setTitle] = useState('')
  const [notFound, setNotFound] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [cinemaMode, setCinemaMode] = useState(() => window.innerWidth < 768)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!id) { navigate('/'); return }

    const staticBook = SAMPLE_BOOK_MAP[id]
    if (staticBook) setTitle(staticBook.title)

    supabase
      .from('book_pages')
      .select('page_number, text, image_url')
      .eq('book_id', id)
      .order('page_number')
      .then(({ data: pagesData }) => {
        if (!pagesData || pagesData.length === 0) {
          if (staticBook) setPages(staticBook.pages as Page[])
          else setNotFound(true)
        } else {
          setPages(pagesData)
        }
      })

    if (!staticBook) {
      supabase
        .from('books')
        .select('title')
        .eq('id', id)
        .single()
        .then(({ data }) => { if (data?.title) setTitle(data.title) })
    }
  }, [id, navigate])

  // Scroll to top on mount so iOS doesn't inherit scroll position
  useEffect(() => { window.scrollTo(0, 0) }, [])

  if (notFound) {
    navigate('/')
    return null
  }

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

  const isMobile = window.innerWidth < 768

  const toggleCinema = () => {
    if (cinemaMode) {
      document.exitFullscreen?.().catch(() => {})
      if (isMobile) { navigate('/'); return }
    } else {
      document.documentElement.requestFullscreen?.().catch(() => {})
    }
    setCinemaMode(v => !v)
  }

  if (cinemaMode) {
    return (
      <div
        className="fixed inset-0 bg-black z-50 flex flex-col select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Barre top */}
        <div className="shrink-0 flex items-center justify-between px-4 pt-3 pb-2">
          <button onClick={toggleCinema} className="text-white/70 hover:text-white text-sm font-semibold">✕ Fermer</button>
          <span className="text-white/50 text-sm font-semibold">{currentPage + 1} / {pages.length}</span>
        </div>

        {/* Image — cliquable gauche/droite pour naviguer */}
        <div className="flex-1 min-h-0 relative" onClick={e => {
          const x = e.clientX / window.innerWidth
          if (x < 0.35) goPrev()
          else if (x > 0.65) goNext()
        }}>
          {page?.image_url
            ? <img src={page.image_url} alt="" className="w-full h-full object-contain" />
            : <div className="w-full h-full bg-kidoria-lavender/20" />
          }
          {/* Flèches fantômes */}
          <div className="absolute left-0 top-0 h-full w-[35%] flex items-center justify-start pl-3 pointer-events-none">
            {currentPage > 0 && <span className="text-white/30 text-3xl">‹</span>}
          </div>
          <div className="absolute right-0 top-0 h-full w-[35%] flex items-center justify-end pr-3 pointer-events-none">
            {currentPage < pages.length - 1 && <span className="text-white/30 text-3xl">›</span>}
          </div>
        </div>

        {/* Texte — panneau fixe en bas, séparé de l'image */}
        {page?.text && (
          <div className="shrink-0 bg-[#111] px-5 py-4">
            <p className="text-white text-base sm:text-lg font-medium text-center leading-relaxed">{page.text}</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="flex flex-col bg-kidoria-cream overflow-hidden"
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <div className="shrink-0 bg-white/90 backdrop-blur border-b border-gray-100 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between">
          <Link to="/" className="text-sm font-semibold text-kidoria-muted hover:text-kidoria-text transition-colors">
            {t('sample.back')}
          </Link>
          <span className="font-black text-sm sm:text-base truncate max-w-[160px]">{title}</span>
          <div className="flex items-center gap-3">
            <span className="text-sm text-kidoria-muted font-semibold">{pages.length > 0 ? `${currentPage + 1} / ${pages.length}` : '…'}</span>
            <button
              onClick={toggleCinema}
              className="text-kidoria-muted hover:text-kidoria-text transition-colors text-xs font-semibold"
            >
              {t('reader.cinema') || 'Cinéma'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col overflow-hidden" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <div className="flex-1 min-h-0 flex flex-col sm:flex-row overflow-hidden">
          <div className="sm:w-1/2 bg-white flex items-center justify-center p-4 sm:p-6 h-1/2 sm:h-full">
            <div className="w-full h-full rounded-3xl overflow-hidden">
              {page?.image_url
                ? <img src={page.image_url} alt={`Page ${page.page_number}`} className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-kidoria-lavender/30 animate-pulse" />}
            </div>
          </div>
          <div className="sm:w-1/2 flex items-center justify-center p-6 sm:p-10 bg-white/60 h-1/2 sm:h-full overflow-y-auto">
            <p className="text-kidoria-text leading-relaxed text-lg sm:text-2xl font-semibold text-center sm:text-left">{page?.text}</p>
          </div>
        </div>

        <div className="shrink-0 bg-white/80 backdrop-blur border-t border-gray-100 py-3 px-4 flex items-center justify-center gap-4">
          <button onClick={goPrev} disabled={currentPage === 0} className="btn-secondary px-6 py-2 disabled:opacity-30 disabled:cursor-not-allowed">
            {t('sample.prev')}
          </button>
          <div className="hidden sm:flex items-center gap-1.5">
            {pages.map((_, i) => (
              <button key={i} onClick={() => setCurrentPage(i)}
                className={`w-2 h-2 rounded-full transition-all ${i === currentPage ? 'bg-kidoria-rose w-4' : 'bg-gray-300 hover:bg-gray-400'}`} />
            ))}
          </div>
          {isLast ? (
            <Link to="/creer" className="btn-primary px-6 py-2">
              {t('sample.createCTA')}
            </Link>
          ) : (
            <button onClick={goNext} disabled={pages.length === 0} className="btn-primary px-6 py-2 disabled:opacity-50">
              {t('sample.next')}
            </button>
          )}
        </div>
      </div>

      {isLast && pages.length > 0 && (
        <div className="shrink-0 bg-gradient-to-r from-kidoria-rose/20 to-kidoria-lavender/20 border-t border-kidoria-rose/20 px-4 py-3 text-center">
          <p className="text-sm font-semibold text-kidoria-text">
            {t('sample.paywallText')}{' '}
            <Link to="/creer" className="text-kidoria-rose underline font-black">{t('sample.paywallLink')}</Link>
          </p>
        </div>
      )}
    </div>
  )
}
