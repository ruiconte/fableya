import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { adminCall } from '../../hooks/useAdmin'

interface User { id: string; email: string; display_name: string | null; role: string; created_at: string }

export function AdminUsers() {
  const { session } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    if (!session) return
    setLoading(true)
    adminCall(session, 'GET', { action: 'users', search: query, page: String(page) })
      .then(d => { setUsers(d.users ?? []); setCount(d.count ?? 0); setPages(d.pages ?? 1) })
      .finally(() => setLoading(false))
  }, [session, query, page])

  useEffect(() => { load() }, [load])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-gray-900">Utilisateurs <span className="text-gray-400 font-normal text-lg">({count})</span></h1>

      <form onSubmit={e => { e.preventDefault(); setPage(1); setQuery(search) }} className="flex gap-2">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Email, nom ou UUID…" className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-kidoria-rose" />
        <button type="submit" className="bg-kidoria-rose text-white px-4 py-2 rounded-lg text-sm font-semibold">Rechercher</button>
        {query && <button type="button" onClick={() => { setSearch(''); setQuery(''); setPage(1) }} className="border border-gray-200 px-3 py-2 rounded-lg text-sm text-gray-500">Effacer</button>}
      </form>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? <div className="p-8 text-center text-gray-400">Chargement...</div> : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Email</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Nom</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Rôle</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Inscrit le</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3"><Link to={`/admin/users/${u.id}`} className="text-kidoria-rose hover:underline font-medium">{u.email}</Link></td>
                  <td className="px-4 py-3 text-gray-600">{u.display_name ?? '—'}</td>
                  <td className="px-4 py-3">
                    {u.role === 'admin' ? <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full font-bold">admin</span> : <span className="text-gray-400 text-xs">user</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-400">{new Date(u.created_at).toLocaleDateString('fr-FR')}</td>
                </tr>
              ))}
              {users.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">Aucun résultat</td></tr>}
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
