import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { adminCall } from '../../hooks/useAdmin'

const STATUSES = ['', 'pending_payment', 'paid', 'generating', 'preview_generating', 'completed', 'failed', 'draft']
const STATUS_COLOR: Record<string, string> = {
  completed: 'bg-green-100 text-green-700', paid: 'bg-blue-100 text-blue-700',
  generating: 'bg-yellow-100 text-yellow-700', failed: 'bg-red-100 text-red-700',
  pending_payment: 'bg-gray-100 text-gray-600', draft: 'bg-purple-100 text-purple-700',
  preview_generating: 'bg-yellow-100 text-yellow-700', preview_ready: 'bg-teal-100 text-teal-700',
}

export function AdminBooks() {
  const { session } = useAuth()
  const [books, setBooks] = useState<any[]>([])
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    if (!session) return
    setLoading(true)
    adminCall(session, 'GET', { action: 'books', ...(status ? { status } : {}), page: String(page) })
      .then(d => { setBooks(d.books ?? []); setCount(d.count ?? 0); setPages(d.pages ?? 1) })
      .finally(() => setLoading(false))
  }, [session, status, page])

  useEffect(() => { load() }, [load])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-gray-900">Livres <span className="text-gray-400 font-normal text-lg">({count})</span></h1>

      <div className="flex gap-2 flex-wrap">
        {STATUSES.map(s => (
          <button key={s} onClick={() => { setStatus(s); setPage(1) }} className={`px-3 py-1 rounded-full text-sm font-semibold border transition-colors ${status === s ? 'bg-kidoria-rose text-white border-kidoria-rose' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
            {s || 'Tous'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? <div className="p-8 text-center text-gray-400">Chargement...</div> : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Titre</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Statut</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Utilisateur</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Créé le</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {books.map(b => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3"><Link to={`/admin/books/${b.id}`} className="text-kidoria-rose hover:underline font-medium truncate block max-w-xs">{b.title || '—'}</Link></td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_COLOR[b.status] ?? 'bg-gray-100 text-gray-600'}`}>{b.status}</span></td>
                  <td className="px-4 py-3"><Link to={`/admin/users/${b.user_id}`} className="text-gray-600 hover:text-kidoria-rose text-xs">{b.user_email ?? b.user_id.slice(0, 8)}</Link></td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(b.created_at).toLocaleString('fr-FR')}</td>
                </tr>
              ))}
              {books.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">Aucun livre</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {pages > 1 && (
        <div className="flex gap-2 justify-center">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border rounded-lg text-sm disabled:opacity-40">←</button>
          <span className="px-3 py-1 text-sm text-gray-600">{page} / {pages}</span>
          <button disabled={page >= pages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border rounded-lg text-sm disabled:opacity-40">→</button>
        </div>
      )}
    </div>
  )
}
