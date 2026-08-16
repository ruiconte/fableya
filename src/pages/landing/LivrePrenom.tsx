import { Link } from 'react-router-dom'
import { PageSEO } from '../../components/PageSEO'

export function LivrePrenom() {
  const prenoms = ['Emma', 'Lucas', 'Léa', 'Noah', 'Chloé', 'Hugo', 'Camille', 'Nathan', 'Inès', 'Théo']

  return (
    <div>
      <PageSEO
        title="Livre avec le prénom de votre enfant — Histoire personnalisée"
        description="Créez un livre illustré où le héros porte le prénom de votre enfant. Histoire unique générée par IA, 15 pages illustrées, disponible immédiatement pour 5 €."
        canonical="/livre-prenom-enfant"
      />

      <section className="bg-gradient-to-b from-kidoria-cream to-white py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-kidoria-rose/20 text-kidoria-text text-sm font-semibold px-4 py-2 rounded-full mb-6">
            📖 Livre avec prénom personnalisé
          </div>
          <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-6">
            Un livre où <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">votre enfant</span> est le héros
          </h1>
          <p className="text-lg text-kidoria-muted max-w-2xl mx-auto mb-8 leading-relaxed">
            Fableya génère une histoire illustrée unique avec le prénom de votre enfant comme personnage principal. Chaque livre est différent — il n'en existe aucun autre identique au monde.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {prenoms.map(p => (
              <span key={p} className="bg-white border-2 border-kidoria-rose/30 rounded-full px-4 py-1 text-sm font-semibold text-kidoria-text">
                {p}
              </span>
            ))}
            <span className="bg-white border-2 border-dashed border-kidoria-rose/30 rounded-full px-4 py-1 text-sm font-semibold text-kidoria-muted">
              et tous les prénoms…
            </span>
          </div>
          <Link to="/creer" className="btn-primary text-lg px-8 py-4">
            Créer le livre de mon enfant — 5 €
          </Link>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-black text-center mb-12">Ce qui rend chaque livre unique</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { icon: '✏️', title: 'Le prénom intégré partout', desc: 'Le prénom de votre enfant apparaît naturellement dans toute l\'histoire, comme si l\'auteur l\'avait écrite pour lui dès le départ.' },
              { icon: '🎨', title: '15 pages illustrées', desc: 'Chaque page est illustrée dans le style que vous choisissez — aquarelle, cartoon, conte. Des illustrations générées spécifiquement pour cette histoire.' },
              { icon: '🌍', title: 'Dans la langue de votre choix', desc: 'Le livre peut être écrit en français, anglais, espagnol, allemand, italien, portugais ou japonais.' },
              { icon: '💛', title: 'Une valeur à transmettre', desc: 'Choisissez une leçon de vie à intégrer dans l\'histoire : courage, amitié, confiance en soi, persévérance…' },
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
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-black text-center mb-8">Questions fréquentes</h2>
          <div className="space-y-4">
            {[
              { q: 'Est-ce que tous les prénoms fonctionnent ?', r: 'Oui, absolument tous les prénoms — français, étrangers, composés. L\'IA intègre naturellement n\'importe quel prénom dans l\'histoire.' },
              { q: 'Puis-je lire le livre avant de payer ?', r: 'Oui ! Fableya génère les 5 premières pages gratuitement pour que vous puissiez lire un extrait avant de payer les 5 € pour le livre complet.' },
              { q: 'Comment recevoir le livre ?', r: 'Le livre est accessible directement dans votre bibliothèque Fableya, lisible sur mobile et desktop. Vous pouvez aussi le télécharger en PDF.' },
            ].map((item, i) => (
              <details key={i} className="card group">
                <summary className="font-black text-base cursor-pointer list-none flex justify-between items-center gap-4">
                  {item.q}
                  <span className="text-kidoria-rose text-xl shrink-0 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-3 text-kidoria-muted leading-relaxed">{item.r}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-kidoria-rose/30 to-kidoria-lavender/30">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black mb-4">Créez le livre avec le prénom de votre enfant</h2>
          <p className="text-kidoria-muted mb-8">5 € · Paiement unique · Prêt en moins de 10 minutes</p>
          <Link to="/creer" className="btn-primary text-lg px-8 py-4">Commencer maintenant</Link>
        </div>
      </section>
    </div>
  )
}
