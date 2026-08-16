import { Link } from 'react-router-dom'
import { PageSEO } from '../../components/PageSEO'

export function CadeauNoel() {
  return (
    <div>
      <PageSEO
        title="Idée cadeau Noël enfant — Livre illustré personnalisé unique"
        description="Offrez un livre de Noël personnalisé avec le prénom de l'enfant comme héros. Idée cadeau originale pour les fêtes, 5 € seulement, disponible immédiatement."
        canonical="/idee-cadeau-noel-enfant"
      />

      <section className="bg-gradient-to-b from-kidoria-cream to-white py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-kidoria-rose/20 text-kidoria-text text-sm font-semibold px-4 py-2 rounded-full mb-6">
            🎄 Idée cadeau Noël enfant
          </div>
          <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-6">
            Le cadeau de Noël le plus <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">magique</span> pour votre enfant
          </h1>
          <p className="text-lg text-kidoria-muted max-w-2xl mx-auto mb-8 leading-relaxed">
            Imaginez l'émerveillement de votre enfant en découvrant un livre illustré où il est lui-même le héros d'une aventure de Noël. Une histoire unique créée spécialement avec son prénom.
          </p>
          <Link to="/creer" className="btn-primary text-lg px-8 py-4">
            Créer le livre de Noël — 5 €
          </Link>
          <p className="mt-3 text-sm text-kidoria-muted">Disponible immédiatement · Pas de délai de livraison</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-black text-center mb-12">Pourquoi Fableya est le cadeau de Noël idéal ?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { icon: '🎅', title: 'Une aventure de Noël personnalisée', desc: 'Choisissez le thème "magie & féerie" pour créer une histoire de Noël où votre enfant rencontre le Père Noël, des elfes ou des rennes magiques.' },
              { icon: '📱', title: 'Zéro stress livraison', desc: 'Pas de colis à attendre, pas de rupture de stock. Le livre est disponible en téléchargement immédiat, même la veille de Noël à minuit.' },
              { icon: '🌍', title: 'Pour toute la famille', desc: 'Créez un livre en français pour les grands-parents, en anglais pour un cousin à l\'étranger — 7 langues disponibles.' },
              { icon: '💝', title: 'Un cadeau qui touche', desc: 'Voir son prénom dans un livre illustré, c\'est une émotion que les enfants n\'oublient pas. Les parents non plus.' },
            ].map((item, i) => (
              <div key={i} className="card flex gap-4 items-start">
                <div className="text-3xl shrink-0">{item.icon}</div>
                <div>
                  <h3 className="font-black text-base mb-1">{item.title}</h3>
                  <p className="text-kidoria-muted text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-kidoria-cream">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-black mb-6">Comment ça marche ?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            {[
              { n: '1', title: 'Personnalisez', desc: 'Prénom, âge, thème magie & féerie, valeur à transmettre.' },
              { n: '2', title: 'Payez 5 €', desc: 'Paiement sécurisé Stripe. Apple Pay et Google Pay acceptés.' },
              { n: '3', title: 'Offrez !', desc: 'Imprimez le PDF ou partagez le lien de lecture pour la découverte sous le sapin.' },
            ].map((step) => (
              <div key={step.n} className="card">
                <div className="w-10 h-10 rounded-full bg-kidoria-rose flex items-center justify-center text-white font-black mb-3">{step.n}</div>
                <h3 className="font-black text-base mb-1">{step.title}</h3>
                <p className="text-kidoria-muted text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-kidoria-rose/30 to-kidoria-lavender/30">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black mb-4">Créez le cadeau de Noël maintenant</h2>
          <p className="text-kidoria-muted mb-8">5 € · Disponible immédiatement · Aucun abonnement</p>
          <Link to="/creer" className="btn-primary text-lg px-8 py-4">Créer le livre de Noël</Link>
        </div>
      </section>
    </div>
  )
}
