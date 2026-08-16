import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Book, BookStatus } from '../lib/types'

const STATUS_EMOJI: Record<BookStatus, string> = {
  pending: '⏳',
  pending_payment: '⏳',
  paid: '💳',
  preview_generating: '✨',
  preview_ready: '👀',
  generating: '✨',
  completed: '📖',
  failed: '❌',
}

const STATUS_COLOR: Record<BookStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  pending_payment: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-blue-100 text-blue-700',
  preview_generating: 'bg-purple-100 text-purple-700',
  preview_ready: 'bg-orange-100 text-orange-700',
  generating: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
}

const DELETABLE_STATUSES: BookStatus[] = ['completed', 'failed', 'pending_payment', 'preview_ready']

export function Library() {
  const { user } = useAuth()
  const { t, i18n } = useTranslation()
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const deleteBook = async (bookId: string) => {
    if (!confirm('Supprimer ce livre définitivement ?')) return
    setDeletingId(bookId)
    await supabase.from('books').delete().eq('id', bookId)
    setBooks(prev => prev.filter(b => b.id !== bookId))
    setDeletingId(null)
  }

  useEffect(() => {
    if (!user) return
    supabase.from('books').select('*').eq('user_id', user.id)
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
        <div className="w-10 h-10 border-4 border-kidoria-rose border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black">{t('library.title')}</h1>
          <p className="text-kidoria-muted mt-1">
            {books.length === 0 ? t('library.empty') : t('library.count', { count: books.length })}
          </p>
        </div>
        <Link to="/creer" className="btn-primary">{t('library.createNew')}</Link>
      </div>

      {books.length === 0 ? (
        <div className="text-center py-20 card">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-black mb-3">{t('library.emptyTitle')}</h2>
          <p className="text-kidoria-muted mb-8 max-w-sm mx-auto">{t('library.emptySub')}</p>
          <Link to="/creer" className="btn-primary">{t('library.emptyCTA')}</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map(book => (
            <div key={book.id} className="card hover:shadow-soft transition-shadow duration-300 flex flex-col">
              <div className="bg-gradient-to-br from-kidoria-rose/20 to-kidoria-lavender/20 rounded-2xl h-44 flex items-center justify-center mb-4 text-6xl overflow-hidden">
                {book.cover_url
                  ? <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                  : '📖'}
              </div>

              <h3 className="font-black text-base mb-2 leading-tight">{book.title}</h3>

              <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full self-start mb-4 ${STATUS_COLOR[book.status]}`}>
                <span>{STATUS_EMOJI[book.status]}</span>
                <span>{t(`library.status_${book.status}`)}</span>
              </div>

              <div className="mt-auto">
                {book.status === 'completed' ? (
                  <Link to={`/livre/${book.id}`} className="btn-primary w-full justify-center text-sm py-2.5">{t('library.read')}</Link>
                ) : book.status === 'generating' || book.status === 'paid' ? (
                  <Link to={`/generation?book_id=${book.id}`} className="btn-secondary w-full justify-center text-sm py-2.5">{t('library.seeProgress')}</Link>
                ) : book.status === 'pending_payment' ? (
                  <span className="text-xs text-kidoria-muted text-center block py-2">{t('library.pendingPayment')}</span>
                ) : null}
              </div>

              <div className="flex items-center justify-between mt-3">
                <p className="text-xs text-kidoria-muted">
                  {new Date(book.created_at).toLocaleDateString(i18n.language, { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                {DELETABLE_STATUSES.includes(book.status) && (
                  <button
                    onClick={() => deleteBook(book.id)}
                    disabled={deletingId === book.id}
                    className="text-xs text-red-400 hover:text-red-600 font-semibold transition-colors disabled:opacity-50"
                  >
                    {deletingId === book.id ? '…' : '🗑 Supprimer'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
