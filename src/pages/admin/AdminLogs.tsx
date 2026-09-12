import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { adminCall } from '../../hooks/useAdmin'

const ACTION_LABEL: Record<string, string> = {
  add_credits: '+ Crédits ajoutés',
  remove_credits: '− Crédits retirés',
  retry_book: '↺ Livre relancé',
  set_book_status: '✎ Statut modifié',
  admin_generate_book: '★ Livre créé (admin)',
}

const ACTION_COLOR: Record<string, string> = {
  add_credits: 'text-green-600', remove_credits: 'text-red-500',
  retry_book: 'text-blue-600', set_book_status: 'text-yellow-600',
  admin_generate_book: 'text-purple-600',
}

export function AdminLogs() {
  const { session } = useAuth()
  const [logs, setLogs] = useState<any[]>([])
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) return
    setLoading(true)
    adminCall(session, 'GET', { action: 'audit', page: String(page) })
      .then(d => { setLogs(d.logs ?? []); setCount(d.count ?? 0); setPages(d.pages ?? 1) })
      .finally(() => setLoading(false))
  }, [session, page])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-gray-900">Audit log <span className="text-gray-400 font-normal text-lg">({count})</span></h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? <div className="p-8 text-center text-gray-400">Chargement...</div> : (
          <div className="divide-y divide-gray-50">
            {logs.map((log: any) => (
              <div key={log.id} className="px-4 py-3 hover:bg-gray-50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm font-bold ${ACTION_COLOR[log.action] ?? 'text-gray-700'}`}>{ACTION_LABEL[log.action] ?? log.action}</span>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Admin : <span className="font-medium">{log.admin_email}</span>
                      {log.target_user_id && <> · User : <Link to={`/admin/users/${log.target_user_id}`} className="text-kidoria-rose hover:underline">{log.details?.target_email ?? log.target_user_id.slice(0,8)}</Link></>}
                      {log.target_book_id && <> · Livre : <Link to={`/admin/books/${log.target_book_id}`} className="text-kidoria-rose hover:underline">{String(log.details?.title ?? log.target_book_id.slice(0,8))}</Link></>}
                    </div>
                    {log.details && Object.keys(log.details).length > 0 && (
                      <div className="text-xs text-gray-400 mt-1">
                        {log.details.amount != null && <span>Montant : {log.details.amount > 0 ? `+${log.details.amount}` : log.details.amount} · </span>}
                        {log.details.reason && <span>Raison : {log.details.reason} · </span>}
                        {log.details.previous_status && <span>{log.details.previous_status} → {log.details.new_status ?? 'paid'}</span>}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">{new Date(log.created_at).toLocaleString('fr-FR')}</span>
                </div>
              </div>
            ))}
            {logs.length === 0 && <div className="px-4 py-8 text-center text-gray-400">Aucune entrée</div>}
          </div>
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
