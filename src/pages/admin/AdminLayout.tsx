import { Link, Outlet, useLocation, Navigate } from 'react-router-dom'
import { useAdmin } from '../../hooks/useAdmin'

export function AdminLayout() {
  const { isAdmin, loading } = useAdmin()
  const { pathname } = useLocation()

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-kidoria-rose border-t-transparent rounded-full animate-spin" /></div>
  if (!isAdmin) return <Navigate to="/connexion" replace />

  const nav = [
    { to: '/admin', label: 'Dashboard', exact: true },
    { to: '/admin/users', label: 'Utilisateurs' },
    { to: '/admin/books', label: 'Livres' },
    { to: '/admin/logs', label: 'Audit log' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-48 bg-gray-900 text-white flex flex-col shrink-0">
        <div className="px-4 py-5 border-b border-gray-700">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Admin</span>
          <div className="text-white font-black text-lg">Fableya</div>
        </div>
        <nav className="flex-1 py-4 space-y-1 px-2">
          {nav.map(({ to, label, exact }) => {
            const active = exact ? pathname === to : pathname.startsWith(to)
            return (
              <Link key={to} to={to} className={`block px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${active ? 'bg-kidoria-rose text-white' : 'text-gray-300 hover:bg-gray-800'}`}>
                {label}
              </Link>
            )
          })}
        </nav>
        <div className="px-4 py-4 border-t border-gray-700">
          <Link to="/" className="text-xs text-gray-400 hover:text-white">← Site</Link>
        </div>
      </aside>
      {/* Main */}
      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  )
}
