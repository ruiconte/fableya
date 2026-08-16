import { Link } from 'react-router-dom'
import { PageSEO } from '../../components/PageSEO'

export function CadeauAnniversaire() {
  return (
    <div>
      <PageSEO
        title="Cadeau anniversaire enfant original — Livre illustré personnalisé"
        description="Trouvez l'idée cadeau anniversaire parfaite pour un enfant. Un livre illustré personnalisé avec son prénom comme héros, pour 5 € seulement. Livraison digitale immédiate."
        canonical="/cadeau-anniversaire-enfant"
      />

      <section className="bg-gradient-to-b from-kidoria-cream to-white py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-kidoria-rose/20 text-kidoria-text text-sm font-semibold px-4 py-2 rounded-full mb-6">
            🎂 Cadeau anniversaire enfant
          </div>
          <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-6">
            L'idée cadeau anniversaire que l'enfant <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">n'oubliera jamais</span>
          </h1>
          <p className="text-lg text-kidoria-muted max-w-2xl mx-auto mb-8 leading-relaxed">
            Offrez un livre illustré personnalisé où l'enfant est le héros de son propre anniversaire. Une histoire unique créée avec son prénom, ses goûts et la valeur que vous voulez lui transmettre.
          </p>
          <Link to="/creer" className="btn-primary text-lg px-8 py-4">
            Créer le cadeau — 5 €
          </Link>
          <p className="mt-3 text-sm text-kidoria-muted">Disponible immédiatement · Pas de livraison à attendre</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-black text-center mb-4">Pour quel âge ?</h2>
          <p className="text-center text-kidoria-muted mb-10">Fableya adapte l'histoire et le vocabulaire à l'âge de l'enfant</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { age: '2 – 4 ans', desc: 'Histoires courtes, mots simples, beaucoup d\'illustrations' },
              { age: '4 – 6 ans', desc: 'Aventures avec rebondissements, héros courageux' },
              { age: '6 – 8 ans', desc: 'Récits plus longs, dialogues, leçons de vie' },
              { age: '8 – 10 ans', desc: 'Intrigues développées, personnages complexes' },
            ].map((item, i) => (
              <div key={i} className="card text-center">
                <div className="text-2xl font-black text-kidoria-rose mb-2">{item.age}</div>
                <p className="text-kidoria-muted text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-kidoria-cream">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-black text-center mb-12">Pourquoi c'est le meilleur cadeau anniversaire ?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: '🎁', title: 'Original et mémorable', desc: 'Pas de jouet qui finira dans un tiroir. Un livre avec son propre prénom, c\'est un cadeau dont on parle.' },
              { icon: '⚡', title: 'Prêt en 10 minutes', desc: 'Vous avez oublié l\'anniversaire ? Pas de panique. Le livre est prêt et disponible en moins de 10 minutes.' },
              { icon: '💰', title: 'Budget maîtrisé', desc: 'Un cadeau qui sort du lot pour seulement 5 €. Pas d\'abonnement, pas de frais cachés.' },
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

      <section className="py-16 bg-gradient-to-r from-kidoria-rose/30 to-kidoria-lavender/30">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black mb-4">Créez le cadeau d'anniversaire maintenant</h2>
          <p className="text-kidoria-muted mb-8">5 € · Livraison digitale immédiate · Aucun abonnement</p>
          <Link to="/creer" className="btn-primary text-lg px-8 py-4">Créer le livre personnalisé</Link>
        </div>
      </section>
    </div>
  )
}
