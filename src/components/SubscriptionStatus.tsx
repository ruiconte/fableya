import { useSubscription } from '../hooks/useSubscription'

export function SubscriptionStatus() {
  const { subscription, loading, subscribe, openPortal } = useSubscription()

  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="h-4 bg-kidoria-sky rounded w-1/3 mb-3" />
        <div className="h-3 bg-kidoria-sky rounded w-2/3" />
      </div>
    )
  }

  const isPastDue = subscription?.status === 'past_due' || subscription?.status === 'unpaid'

  if (subscription?.isActive) {
    const pct = Math.round((subscription.booksUsed / subscription.planBookLimit) * 100)
    const renewDate = subscription.currentPeriodEnd
      ? new Date(subscription.currentPeriodEnd).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
      : null

    return (
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-sm text-kidoria-text">{subscription.planName}</p>
            <p className="text-xs text-kidoria-muted">15 € / mois</p>
          </div>
          <span className="text-xs font-semibold bg-green-100 text-green-700 px-2.5 py-1 rounded-full">
            Actif
          </span>
        </div>

        {isPastDue && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            Problème avec votre paiement.{' '}
            <button onClick={openPortal} className="underline font-medium">
              Mettre à jour la carte
            </button>
          </div>
        )}

        <div>
          <div className="flex justify-between text-xs text-kidoria-muted mb-1.5">
            <span>{subscription.booksUsed} / {subscription.planBookLimit} livres utilisés</span>
            <span>{subscription.booksRemaining} restants</span>
          </div>
          <div className="h-2 bg-kidoria-sky rounded-full overflow-hidden">
            <div
              className="h-full bg-kidoria-rose rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {renewDate && (
          <p className="text-xs text-kidoria-muted">
            {subscription.cancelAtPeriodEnd
              ? `Se termine le ${renewDate}`
              : `Renouvellement le ${renewDate}`}
          </p>
        )}

        <button
          onClick={openPortal}
          className="btn-secondary w-full justify-center text-sm py-2"
        >
          Gérer l'abonnement
        </button>
      </div>
    )
  }

  // Not subscribed
  return (
    <div className="card space-y-4">
      <div>
        <p className="font-semibold text-sm text-kidoria-text">Fableya Plus</p>
        <p className="text-xs text-kidoria-muted mt-0.5">25 livres par mois pour 15 €</p>
      </div>

      <ul className="space-y-1.5">
        {[
          '25 livres inclus chaque mois',
          'Équivaut à 0,60 € / livre',
          'Résiliation sans engagement',
        ].map(f => (
          <li key={f} className="flex items-center gap-2 text-xs text-kidoria-muted">
            <span className="w-4 h-4 rounded-full bg-kidoria-rose/10 text-kidoria-rose flex items-center justify-center shrink-0 text-[10px] font-bold">✓</span>
            {f}
          </li>
        ))}
      </ul>

      <button onClick={subscribe} className="btn-primary w-full justify-center text-sm py-2.5">
        S'abonner — 15 € / mois
      </button>
    </div>
  )
}
