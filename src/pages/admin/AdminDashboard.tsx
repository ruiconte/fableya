import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { adminCall } from '../../hooks/useAdmin'

interface Stats {
  totalUsers: number
  totalBooks: number
  pendingBooks: number
  generatingBooks: number
  failedBooks: number
  activeSubscriptions: number
  recentUsers: { id: string; email: string; created_at: string }[]
  recentBooks: { id: string; title: string; status: string; created_at: string; user_id: string }[]
  stuckBooks: { id: string; title: string; status: string; updated_at: string }[]
}

const STATUS_COLOR: Record<string, string> = {
  completed: 'bg-green-100 text-green-700',
  paid: 'bg-blue-100 text-blue-700',
  generating: 'bg-yellow-100 text-yellow-700',
  preview_generating: 'bg-yellow-100 text-yellow-700',
  failed: 'bg-red-100 text-red-700',
  pending_payment: 'bg-gray-100 text-gray-600',
  draft: 'bg-purple-100 text-purple-700',
}

export function AdminDashboard() {
  const { session } = useAuth()
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!session) return
    adminCall(session, 'GET', { action: 'stats' })
      .then(setStats)
      .catch(e => setError(e.message))
  }, [session])

  if (error) return <div className="text-red-600">{error}</div>
  if (!stats) return <div className="text-gray-500">Chargement...</div>

  const statCards = [
    { label: 'Utilisateurs', value: stats.totalUsers, color: 'text-blue-600' },
    { label: 'Livres total', value: stats.totalBooks, color: 'text-purple-600' },
    { label: 'En attente', value: stats.pendingBooks, color: 'text-yellow-600' },
    { label: 'En génération', value: stats.generatingBooks, color: 'text-orange-500' },
    { label: 'Échoués', value: stats.failedBooks, color: 'text-red-600' },
    { label: 'Abonnés actifs', value: stats.activeSubscriptions, color: 'text-green-600' },
  ]

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-black text-gray-900">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className={`text-3xl font-black ${color}`}>{value}</div>
            <div className="text-xs text-gray-500 mt-1 font-semibold">{label}</div>
          </div>
        ))}
      </div>

      {/* Stuck generations */}
      {stats.stuckBooks.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <h2 className="font-bold text-red-700 mb-3">⚠ Générations bloquées (+30 min)</h2>
          <div className="space-y-2">
            {stats.stuckBooks.map(b => (
              <div key={b.id} className="flex items-center justify-between text-sm">
                <Link to={`/admin/books/${b.id}`} className="text-red-700 hover:underline font-semibold">{b.title || b.id.slice(0, 8)}</Link>
                <span className="text-red-500">{b.status} — {new Date(b.updated_at).toLocaleString('fr-FR')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent users */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-bold text-gray-800">Derniers inscrits</h2>
            <Link to="/admin/users" className="text-xs text-kidoria-rose font-semibold hover:underline">Voir tout →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {stats.recentUsers.map(u => (
              <Link key={u.id} to={`/admin/users/${u.id}`} className="flex items-center justify-between px-4 py-2 hover:bg-gray-50">
                <span className="text-sm font-medium text-gray-800">{u.email}</span>
                <span className="text-xs text-gray-400">{new Date(u.created_at).toLocaleDateString('fr-FR')}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent books */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-bold text-gray-800">Dernières générations</h2>
            <Link to="/admin/books" className="text-xs text-kidoria-rose font-semibold hover:underline">Voir tout →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {stats.recentBooks.map(b => (
              <Link key={b.id} to={`/admin/books/${b.id}`} className="flex items-center justify-between px-4 py-2 hover:bg-gray-50">
                <span className="text-sm font-medium text-gray-800 truncate max-w-[180px]">{b.title || '—'}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_COLOR[b.status] ?? 'bg-gray-100 text-gray-600'}`}>{b.status}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
