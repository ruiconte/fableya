import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useSubscription } from '../hooks/useSubscription'
import type { Book, BookStatus } from '../lib/types'

const STATUS_COLOR: Record<BookStatus, string> = {
  pending: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  pending_payment: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  paid: 'text-blue-600 bg-blue-50 border-blue-200',
  preview_generating: 'text-purple-600 bg-purple-50 border-purple-200',
  preview_ready: 'text-orange-600 bg-orange-50 border-orange-200',
  generating: 'text-purple-600 bg-purple-50 border-purple-200',
  completed: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  failed: 'text-red-500 bg-red-50 border-red-200',
}

const STATUS_DOT: Record<BookStatus, string> = {
  pending: 'bg-yellow-400',
  pending_payment: 'bg-yellow-400',
  paid: 'bg-blue-400',
  preview_generating: 'bg-purple-400',
  preview_ready: 'bg-orange-400',
  generating: 'bg-purple-400',
  completed: 'bg-emerald-400',
  failed: 'bg-red-400',
}

const DELETABLE_STATUSES: BookStatus[] = ['completed', 'failed', 'pending_payment', 'preview_ready']

export function Library() {
  const { user } = useAuth()
  const { t, i18n } = useTranslation()
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const pendingActivation = searchParams.get('subscription') === 'success'
  const { subscription: liveSubscription } = useSubscription(pendingActivation)

  // Once active, remove the query param so the banner disappears
  useEffect(() => {
    if (pendingActivation && liveSubscription?.isActive) {
      setSearchParams({}, { replace: true })
    }
  }, [pendingActivation, liveSubscription?.isActive, setSearchParams])

  const deleteBook = async (bookId: string) => {
    if (!confirm('Supprimer ce livre définitivement ?')) return
    setDeletingId(bookId)
    await supabase.from('books').delete().eq('id', bookId)
    setBooks(prev => prev.filter(b => b.id !== bookId))
    setDeletingId(null)
  }

  useEffect(() => {
    if (!user) return
    supabase
      .from('books')
      .select('*, book_pages(image_url, page_number)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error?.message?.includes('JWT') || error?.code === 'PGRST301') {
          supabase.auth.signOut().then(() => { window.location.href = '/connexion' })
          return
        }
        setBooks(data ?? [])
        setLoading(false)
      })
  }, [user])

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-kidoria-rose border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
        <div>
          <p className="text-kidoria-rose text-[11px] font-semibold tracking-[0.2em] uppercase mb-3">Fableya</p>
          <h1 className="font-display text-4xl lg:text-5xl text-kidoria-text">{t('library.title')}</h1>
          <div className="flex items-center gap-4 mt-2 flex-wrap">
            {books.length > 0 && (
              <p className="text-kidoria-muted text-sm">
                {t('library.count', { count: books.length })}
              </p>
            )}
            {liveSubscription?.isActive && (
              <p className="text-kidoria-muted text-sm">
                · <span className="text-kidoria-rose font-semibold">{liveSubscription.booksRemaining}</span> livre{liveSubscription.booksRemaining !== 1 ? 's' : ''} restant{liveSubscription.booksRemaining !== 1 ? 's' : ''} ce mois
              </p>
            )}
          </div>
        </div>
        <Link to="/creer" className="btn-primary">{t('library.createNew')}</Link>
      </div>

      {/* Activation pending banner */}
      {pendingActivation && !liveSubscription?.isActive && (
        <div className="mb-6 flex items-center gap-3 bg-kidoria-rose/10 border border-kidoria-rose/20 rounded-xl px-5 py-4 max-w-sm">
          <div className="w-4 h-4 border-2 border-kidoria-rose border-t-transparent rounded-full animate-spin shrink-0" />
          <p className="text-sm text-kidoria-text font-medium">Activation de votre abonnement en cours…</p>
        </div>
      )}

      {books.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-kidoria-sky rounded-xl">
          <p className="text-kidoria-muted text-5xl mb-6 font-display">—</p>
          <h2 className="font-display text-3xl mb-3 text-kidoria-text">{t('library.emptyTitle')}</h2>
          <p className="text-kidoria-muted mb-10 max-w-sm mx-auto text-sm leading-relaxed">{t('library.emptySub')}</p>
          <Link to="/creer" className="btn-primary">{t('library.emptyCTA')}</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {books.map(book => (
            <div
              key={book.id}
              className="group flex flex-col bg-white rounded-xl border border-kidoria-sky overflow-hidden transition-all duration-300 hover:-translate-y-1"
              style={{ boxShadow: '0 2px 16px rgba(26,22,20,0.07)' }}
            >
              {/* Cover */}
              <div className="aspect-[3/4] bg-kidoria-lavender overflow-hidden">
                {(() => {
                  const imgSrc = book.cover_url ||
                    (book as {book_pages?: {image_url: string, page_number: number}[]}).book_pages
                      ?.sort((a, b) => a.page_number - b.page_number)[0]?.image_url
                  return imgSrc ? (
                    <img
                      src={imgSrc}
                      alt={book.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-kidoria-lavender/40">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-kidoria-muted/40"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                    </div>
                  )
                })()}
              </div>

              {/* Info */}
              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-semibold text-sm text-kidoria-text mb-3 leading-snug">{book.title}</h3>

                <div className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border self-start mb-4 ${STATUS_COLOR[book.status]}`}>
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_DOT[book.status]}`} />
                  {{
                    pending: 'En attente',
                    pending_payment: 'Paiement requis',
                    paid: 'Payé',
                    preview_generating: 'Aperçu en cours',
                    preview_ready: 'Aperçu prêt',
                    generating: 'Génération en cours',
                    completed: 'Terminé',
                    failed: 'Erreur',
                  }[book.status]}
                </div>

                <div className="mt-auto space-y-2">
                  {book.status === 'completed' ? (
                    <Link to={`/livre/${book.id}`} className="btn-primary w-full justify-center text-xs py-2.5">
                      {t('library.read')}
                    </Link>
                  ) : (book.status === 'generating' || book.status === 'paid') ? (
                    <Link to={`/generation?book_id=${book.id}`} className="btn-secondary w-full justify-center text-xs py-2.5">
                      {t('library.seeProgress')}
                    </Link>
                  ) : null}
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-kidoria-sky/50">
                  <span className="text-xs text-kidoria-muted">
                    {new Date(book.created_at).toLocaleDateString(i18n.language, {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                  {DELETABLE_STATUSES.includes(book.status) && (
                    <button
                      onClick={() => deleteBook(book.id)}
                      disabled={deletingId === book.id}
                      className="text-xs text-kidoria-muted hover:text-red-500 transition-colors disabled:opacity-40"
                    >
                      {deletingId === book.id ? '…' : 'Supprimer'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
