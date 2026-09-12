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

export function AdminBookDetail() {
  const { id } = useParams<{ id: string }>()
  const { session } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [confirm, setConfirm] = useState<string | null>(null)

  const load = () => {
    if (!session || !id) return
    setLoading(true)
    adminCall(session, 'GET', { action: 'book', id })
      .then(setData).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [session, id])

  const doAction = async (_action: string, postAction: string, newStatus?: string) => {
    if (!session) return
    setActionLoading(true); setMsg(''); setConfirm(null)
    try {
      if (postAction === 'retry-book') {
        await adminCall(session, 'POST', {}, { action: 'retry-book', book_id: id })
        setMsg('Livre relancé en génération (statut → paid)')
      } else if (postAction === 'set-book-status' && newStatus) {
        await adminCall(session, 'POST', {}, { action: 'set-book-status', book_id: id, status: newStatus })
        setMsg(`Statut mis à jour → ${newStatus}`)
      }
      load()
    } catch (e: any) { setMsg(`Erreur : ${e.message}`) }
    finally { setActionLoading(false) }
  }

  if (loading) return <div className="text-gray-400">Chargement...</div>
  if (!data?.book) return <div className="text-red-600">Livre introuvable</div>

  const { book, pagesCount, userEmail } = data
  const fd = book.form_data ?? {}
  const isStuck = ['generating', 'preview_generating'].includes(book.status) &&
    new Date(book.updated_at) < new Date(Date.now() - 30 * 60 * 1000)

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-700 text-sm">←</button>
        <h1 className="text-2xl font-black text-gray-900 truncate">{book.title || 'Sans titre'}</h1>
        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold shrink-0 ${STATUS_COLOR[book.status] ?? 'bg-gray-100 text-gray-600'}`}>{book.status}</span>
        {isStuck && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold animate-pulse">BLOQUÉ</span>}
      </div>

      {/* Book info */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <h2 className="font-bold text-gray-700 mb-3">Informations</h2>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div><dt className="text-gray-400">ID</dt><dd className="font-mono text-xs">{book.id}</dd></div>
          <div><dt className="text-gray-400">Utilisateur</dt><dd><Link to={`/admin/users/${book.user_id}`} className="text-kidoria-rose hover:underline">{userEmail ?? book.user_id.slice(0,8)}</Link></dd></div>
          <div><dt className="text-gray-400">Créé le</dt><dd>{new Date(book.created_at).toLocaleString('fr-FR')}</dd></div>
          <div><dt className="text-gray-400">Mis à jour</dt><dd>{new Date(book.updated_at).toLocaleString('fr-FR')}</dd></div>
          <div><dt className="text-gray-400">Pages générées</dt><dd className="font-semibold">{pagesCount} / 15</dd></div>
          <div><dt className="text-gray-400">Stripe session</dt><dd className="font-mono text-xs truncate">{book.stripe_session_id ?? '—'}</dd></div>
        </dl>
      </div>

      {/* Generation params */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <h2 className="font-bold text-gray-700 mb-3">Paramètres de génération</h2>
        <dl className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
          {[['Prénom', fd.child_name], ['Âge', fd.child_age], ['Genre', fd.genre], ['Style', fd.visual_style], ['Langue', fd.language], ['Valeur', fd.moral_value]].map(([k, v]) => v != null && (
            <div key={k as string}><dt className="text-gray-400 text-xs">{k as string}</dt><dd className="font-semibold">{String(v)}</dd></div>
          ))}
        </dl>
        {fd.custom_story_idea && <div className="mt-2 text-sm"><span className="text-gray-400 text-xs">Idée personnalisée : </span><span>{fd.custom_story_idea}</span></div>}
      </div>

      {/* Admin actions */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <h2 className="font-bold text-gray-700 mb-3">Actions admin</h2>

        {confirm && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
            <p className="font-semibold text-yellow-800 mb-2">Confirmer : {confirm}</p>
            <div className="flex gap-2">
              <button onClick={() => {
                if (confirm === 'retry') doAction('retry', 'retry-book')
                else if (confirm === 'failed') doAction('fail', 'set-book-status', 'failed')
                else if (confirm === 'pending_payment') doAction('reset', 'set-book-status', 'pending_payment')
              }} className="bg-red-600 text-white px-3 py-1 rounded text-xs font-semibold">Confirmer</button>
              <button onClick={() => setConfirm(null)} className="border px-3 py-1 rounded text-xs">Annuler</button>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button onClick={() => setConfirm('retry')} disabled={actionLoading} className="bg-kidoria-rose text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50">
            ↺ Relancer la génération
          </button>
          <button onClick={() => setConfirm('failed')} disabled={actionLoading} className="border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 hover:bg-red-50">
            ✕ Marquer comme échoué
          </button>
          <button onClick={() => setConfirm('pending_payment')} disabled={actionLoading} className="border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 hover:bg-gray-50">
            ← Retour en attente paiement
          </button>
          {book.cover_url && (
            <a href={book.cover_url} target="_blank" rel="noreferrer" className="border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50">
              🖼 Voir couverture
            </a>
          )}
        </div>

        {msg && <p className={`mt-3 text-sm font-semibold ${msg.startsWith('Erreur') ? 'text-red-600' : 'text-green-600'}`}>{msg}</p>}
      </div>
    </div>
  )
}
