import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { adminCall } from '../../hooks/useAdmin'

const STATUS_COLOR: Record<string, string> = {
  completed: 'bg-green-100 text-green-700', paid: 'bg-blue-100 text-blue-700',
  generating: 'bg-yellow-100 text-yellow-700', failed: 'bg-red-100 text-red-700',
  pending_payment: 'bg-gray-100 text-gray-600', draft: 'bg-purple-100 text-purple-700',
  preview_generating: 'bg-yellow-100 text-yellow-700', preview_ready: 'bg-teal-100 text-teal-700',
}

export function AdminUserDetail() {
  const { id } = useParams<{ id: string }>()
  const { session } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [creditAmt, setCreditAmt] = useState('')
  const [creditReason, setCreditReason] = useState('')
  const [creditLoading, setCreditLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const load = () => {
    if (!session || !id) return
    setLoading(true)
    adminCall(session, 'GET', { action: 'user', id })
      .then(setData).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [session, id])

  const handleCredits = async (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseInt(creditAmt)
    if (!amount || isNaN(amount)) return
    setCreditLoading(true)
    setMsg('')
    try {
      await adminCall(session!, 'POST', {}, { action: 'credits', user_id: id, amount, reason: creditReason || undefined })
      setMsg(amount > 0 ? `+${amount} crédits ajoutés` : `${amount} crédits retirés`)
      setCreditAmt(''); setCreditReason('')
      load()
    } catch (e: any) { setMsg(`Erreur : ${e.message}`) }
    finally { setCreditLoading(false) }
  }

  if (loading) return <div className="text-gray-400">Chargement...</div>
  if (!data?.profile) return <div className="text-red-600">Utilisateur introuvable</div>

  const { profile, subscription, books, credits, bonusTotal } = data
  const subActive = subscription && ['active', 'trialing'].includes(subscription.status)
  const subRemaining = subscription ? Math.max(0, subscription.plan_book_limit - subscription.books_used_this_period) : 0

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-700 text-sm">←</button>
        <h1 className="text-2xl font-black text-gray-900">{profile.email}</h1>
        {profile.role === 'admin' && <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full font-bold">admin</span>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Profile */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 col-span-2">
          <h2 className="font-bold text-gray-700 mb-3">Profil</h2>
          <dl className="space-y-1 text-sm">
            <div className="flex gap-2"><dt className="text-gray-400 w-28">UUID</dt><dd className="font-mono text-xs text-gray-600">{profile.id}</dd></div>
            <div className="flex gap-2"><dt className="text-gray-400 w-28">Email</dt><dd>{profile.email}</dd></div>
            <div className="flex gap-2"><dt className="text-gray-400 w-28">Nom</dt><dd>{profile.display_name ?? '—'}</dd></div>
            <div className="flex gap-2"><dt className="text-gray-400 w-28">Inscrit le</dt><dd>{new Date(profile.created_at).toLocaleString('fr-FR')}</dd></div>
          </dl>
        </div>

        {/* Credits summary */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <h2 className="font-bold text-gray-700 mb-3">Crédits</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Abonnement</span><span className="font-bold">{subActive ? `${subRemaining} / ${subscription.plan_book_limit}` : '—'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Bonus admin</span><span className={`font-bold ${bonusTotal > 0 ? 'text-green-600' : 'text-gray-400'}`}>{bonusTotal}</span></div>
            <div className="border-t pt-2 flex justify-between"><span className="font-semibold">Total dispo</span><span className="font-black text-kidoria-rose">{(subActive ? subRemaining : 0) + bonusTotal}</span></div>
          </div>
        </div>
      </div>

      {/* Subscription */}
      {subscription && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <h2 className="font-bold text-gray-700 mb-3">Abonnement</h2>
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div><dt className="text-gray-400">Statut</dt><dd className={`font-bold ${subActive ? 'text-green-600' : 'text-red-500'}`}>{subscription.status}</dd></div>
            <div><dt className="text-gray-400">Plan</dt><dd className="font-semibold">{subscription.plan_book_limit} livres/mois</dd></div>
            <div><dt className="text-gray-400">Utilisés</dt><dd className="font-semibold">{subscription.books_used_this_period}</dd></div>
            <div><dt className="text-gray-400">Expire</dt><dd className="font-semibold">{subscription.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString('fr-FR') : '—'}</dd></div>
          </dl>
        </div>
      )}

      {/* Add/remove credits */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <h2 className="font-bold text-gray-700 mb-3">Ajouter / retirer des crédits bonus</h2>
        <form onSubmit={handleCredits} className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Montant (négatif pour retirer)</label>
            <input type="number" value={creditAmt} onChange={e => setCreditAmt(e.target.value)} placeholder="ex: 5 ou -2" className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-32 focus:outline-none focus:ring-2 focus:ring-kidoria-rose" />
          </div>
          <div className="flex-1 min-w-48">
            <label className="text-xs text-gray-500 block mb-1">Raison (optionnel)</label>
            <input value={creditReason} onChange={e => setCreditReason(e.target.value)} placeholder="ex: compensation retard 19h" className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-kidoria-rose" />
          </div>
          <button type="submit" disabled={creditLoading || !creditAmt} className="bg-kidoria-rose text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50">
            {creditLoading ? '...' : 'Appliquer'}
          </button>
        </form>
        {msg && <p className={`mt-2 text-sm font-semibold ${msg.startsWith('Erreur') ? 'text-red-600' : 'text-green-600'}`}>{msg}</p>}

        {/* Credit history */}
        {credits?.length > 0 && (
          <div className="mt-4 border-t pt-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Historique crédits</h3>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {credits.map((c: any) => (
                <div key={c.id} className="flex justify-between text-xs text-gray-600">
                  <span className={`font-semibold ${c.amount > 0 ? 'text-green-600' : 'text-red-500'}`}>{c.amount > 0 ? `+${c.amount}` : c.amount}</span>
                  <span className="text-gray-400 flex-1 px-3 truncate">{c.reason ?? '—'}</span>
                  <span className="text-gray-400">{new Date(c.created_at).toLocaleString('fr-FR')}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Books */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="font-bold text-gray-700">Livres ({books?.length ?? 0})</h2>
        </div>
        <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
          {(books ?? []).map((b: any) => (
            <Link key={b.id} to={`/admin/books/${b.id}`} className="flex items-center justify-between px-4 py-2 hover:bg-gray-50">
              <span className="text-sm font-medium text-gray-800 truncate max-w-xs">{b.title || '—'}</span>
              <div className="flex items-center gap-3 shrink-0">
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_COLOR[b.status] ?? 'bg-gray-100 text-gray-600'}`}>{b.status}</span>
                <span className="text-xs text-gray-400">{new Date(b.created_at).toLocaleDateString('fr-FR')}</span>
              </div>
            </Link>
          ))}
          {!books?.length && <div className="px-4 py-6 text-center text-sm text-gray-400">Aucun livre</div>}
        </div>
      </div>
    </div>
  )
}
