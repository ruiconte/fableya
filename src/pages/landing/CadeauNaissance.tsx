import { Link } from 'react-router-dom'
import { PageSEO } from '../../components/PageSEO'

export function CadeauNaissance() {
  return (
    <div>
      <PageSEO
        title="Cadeau de naissance original — Livre illustré personnalisé"
        description="Offrez un livre illustré unique comme cadeau de naissance. L'histoire est générée avec le prénom du bébé comme héros. Livraison digitale immédiate, 5 € seulement."
        canonical="/cadeau-naissance"
      />

      {/* Hero */}
      <section className="bg-gradient-to-b from-kidoria-cream to-white py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-kidoria-rose/20 text-kidoria-text text-sm font-semibold px-4 py-2 rounded-full mb-6">
            🍼 Idée cadeau naissance
          </div>
          <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-6">
            Le cadeau de naissance le plus <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">original</span> et unique
          </h1>
          <p className="text-lg text-kidoria-muted max-w-2xl mx-auto mb-8 leading-relaxed">
            Offrez un livre illustré personnalisé avec le prénom du bébé comme héros de l'histoire. Une œuvre unique générée par IA que les parents garderont toute leur vie.
          </p>
          <Link to="/creer" className="btn-primary text-lg px-8 py-4">
            Créer le livre — 5 €
          </Link>
          <p className="mt-3 text-sm text-kidoria-muted">Livraison digitale immédiate · Paiement unique</p>
        </div>
      </section>

      {/* Pourquoi */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-black text-center mb-12">Pourquoi offrir un livre personnalisé à la naissance ?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: '✨', title: 'Un cadeau unique', desc: 'Contrairement à un jouet ou un vêtement, ce livre n\'existe qu\'en un seul exemplaire. L\'histoire a été créée spécialement pour ce bébé, avec son prénom.' },
              { icon: '💛', title: 'Un souvenir pour la vie', desc: 'Les parents peuvent relire l\'histoire des années plus tard. Un livre personnalisé à la naissance devient un objet de mémoire précieux.' },
              { icon: '🚀', title: 'Prêt en 10 minutes', desc: 'Pas de délai de livraison, pas de risque de rupture de stock. Le livre est généré et disponible en téléchargement immédiat.' },
            ].map((item, i) => (
              <div key={i} className="card text-center">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="font-black text-lg mb-2">{item.title}</h3>
                <p className="text-kidoria-muted text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="py-16 bg-kidoria-cream">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-black text-center mb-10">Comment créer un livre de naissance personnalisé ?</h2>
          <ol className="space-y-6">
            {[
              { n: '1', title: 'Renseignez le prénom du bébé', desc: 'Entrez le prénom, l\'âge (0 ou 1 an) et le thème de l\'histoire — aventure, magie, animaux...' },
              { n: '2', title: 'Choisissez le style d\'illustration', desc: 'Aquarelle douce, conte chaleureux, dessin animé coloré — 5 styles disponibles pour correspondre au goût des parents.' },
              { n: '3', title: 'Payez et recevez le livre', desc: 'Paiement sécurisé de 5 € via Stripe. Le livre de 15 pages illustrées est généré et disponible immédiatement.' },
            ].map((step) => (
              <li key={step.n} className="card flex gap-6 items-start">
                <div className="w-10 h-10 rounded-full bg-kidoria-rose flex items-center justify-center text-white font-black shrink-0">{step.n}</div>
                <div>
                  <h3 className="font-black text-base mb-1">{step.title}</h3>
                  <p className="text-kidoria-muted text-sm leading-relaxed">{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-kidoria-rose/30 to-kidoria-lavender/30">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black mb-4">Créez le livre de naissance maintenant</h2>
          <p className="text-kidoria-muted mb-8">5 € · Paiement unique · Prêt en moins de 10 minutes</p>
          <Link to="/creer" className="btn-primary text-lg px-8 py-4">Créer le livre personnalisé</Link>
        </div>
      </section>
    </div>
  )
}
