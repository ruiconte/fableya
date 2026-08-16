import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Book, BookPage } from '../lib/types'

export function PreviewBook() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [book, setBook] = useState<Book | null>(null)
  const [pages, setPages] = useState<BookPage[]>([])
  const [status, setStatus] = useState<string>('pending')
  const [currentPage, setCurrentPage] = useState(0)
  const [paying, setPaying] = useState(false)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)

  useEffect(() => {
    if (!id || !user) return
    const load = async () => {
      const { data: b } = await supabase.from('books').select('*').eq('id', id).eq('user_id', user.id).single()
      if (!b) { navigate('/bibliotheque'); return }
      setBook(b)
      setStatus(b.status)
      if (b.status === 'preview_ready' || b.status === 'completed') {
        const { data: p } = await supabase.from('book_pages').select('*').eq('book_id', id).order('page_number')
        setPages(p ?? [])
      }
    }
    load()
  }, [id, user, navigate])

  // Polling tant que preview pas prête
  useEffect(() => {
    if (status === 'preview_ready' || status === 'completed' || status === 'failed') return
    const interval = setInterval(async () => {
      const { data: b } = await supabase.from('books').select('status').eq('id', id).single()
      if (!b) return
      setStatus(b.status)
      if (b.status === 'preview_ready' || b.status === 'completed') {
        const { data: p } = await supabase.from('book_pages').select('*').eq('book_id', id).order('page_number')
        setPages(p ?? [])
        clearInterval(interval)
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [id, status])

  const handlePay = async () => {
    if (!book || !user) return
    setPaying(true)
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', { body: { book_id: book.id } })
      if (error) throw error
      window.location.href = data.url
    } catch {
      setPaying(false)
    }
  }

  const goNext = () => setCurrentPage(p => Math.min(p + 1, pages.length - 1))
  const goPrev = () => setCurrentPage(p => Math.max(p - 1, 0))
  const handleTouchStart = (e: React.TouchEvent) => setTouchStartX(e.touches[0].clientX)
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return
    const dx = touchStartX - e.changedTouches[0].clientX
    if (Math.abs(dx) > 60) { dx > 0 ? goNext() : goPrev() }
    setTouchStartX(null)
  }

  // En attente de génération
  if (status === 'pending' || status === 'preview_generating') {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-6 text-center px-4">
        <div className="w-16 h-16 border-4 border-kidoria-rose border-t-transparent rounded-full animate-spin" />
        <div>
          <h2 className="text-2xl font-black mb-2">✨ Votre aperçu est en cours de création…</h2>
          <p className="text-kidoria-muted">Les 5 premières pages de votre histoire sont en train d'être illustrées. Cela prend environ 2 minutes.</p>
        </div>
      </div>
    )
  }

  if (status === 'failed') {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="text-6xl">😢</div>
        <h2 className="text-2xl font-black">Une erreur est survenue</h2>
        <button onClick={() => navigate('/creer')} className="btn-primary">Réessayer</button>
      </div>
    )
  }

  const page = pages[currentPage]
  const isLastPreviewPage = currentPage === pages.length - 1

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-kidoria-cream overflow-hidden">
      {/* Top bar */}
      <div className="shrink-0 bg-white/90 backdrop-blur border-b border-gray-100 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between">
          <span className="font-black text-sm sm:text-base truncate max-w-[200px]">👀 Aperçu — {book?.title}</span>
          <div className="flex items-center gap-3">
            <span className="text-sm text-kidoria-muted font-semibold">{currentPage + 1} / {pages.length}</span>
            <span className="text-xs bg-kidoria-rose/20 text-kidoria-rose font-bold px-2 py-1 rounded-full">Aperçu gratuit</span>
          </div>
        </div>
      </div>

      {/* Reader */}
      <div className="flex-1 flex flex-col overflow-hidden" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
          <div className="sm:w-1/2 bg-white flex items-center justify-center p-4 sm:p-6 h-1/2 sm:h-full">
            <div className="w-full h-full rounded-3xl overflow-hidden">
              {page?.image_url
                ? <img src={page.image_url} alt={`Page ${page.page_number}`} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-6xl opacity-30">🎨</div>}
            </div>
          </div>
          <div className="sm:w-1/2 flex items-center justify-center p-6 sm:p-10 bg-white/60 h-1/2 sm:h-full overflow-y-auto">
            <p className="text-kidoria-text leading-relaxed text-lg sm:text-2xl font-semibold text-center sm:text-left">{page?.text}</p>
          </div>
        </div>

        {/* Navigation */}
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
          {isLastPreviewPage ? (
            <button onClick={handlePay} disabled={paying} className="btn-primary px-6 py-2 disabled:opacity-60">
              {paying ? '…' : '🔓 Débloquer la suite — 5€'}
            </button>
          ) : (
            <button onClick={goNext} className="btn-primary px-6 py-2">Suivant</button>
          )}
        </div>
      </div>

      {/* Paywall banner on last page */}
      {isLastPreviewPage && (
        <div className="shrink-0 bg-gradient-to-r from-kidoria-rose/20 to-kidoria-lavender/20 border-t border-kidoria-rose/20 px-4 py-3 text-center">
          <p className="text-sm font-semibold text-kidoria-text">
            ✨ L'histoire continue sur <strong>{book?.form_data?.creation_mode === 'advanced' ? 15 : 10} pages</strong> supplémentaires — débloque-les maintenant !
          </p>
        </div>
      )}
    </div>
  )
}
