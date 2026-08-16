import { Link } from 'react-router-dom'
import { PageSEO } from '../../components/PageSEO'

export function GenerateurHistoire() {
  return (
    <div>
      <PageSEO
        title="Générateur d'histoires pour enfants par IA — Fableya"
        description="Créez une histoire illustrée personnalisée pour votre enfant en quelques minutes grâce à l'IA. Entrez le prénom, l'âge et le thème — Fableya génère une histoire unique de 15 pages."
        canonical="/generateur-histoire-enfant-ia"
      />

      <section className="bg-gradient-to-b from-kidoria-cream to-white py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-kidoria-rose/20 text-kidoria-text text-sm font-semibold px-4 py-2 rounded-full mb-6">
            ✨ Générateur d'histoires IA pour enfants
          </div>
          <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-6">
            Générez une <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">histoire illustrée unique</span> pour votre enfant
          </h1>
          <p className="text-lg text-kidoria-muted max-w-2xl mx-auto mb-8 leading-relaxed">
            Fableya est un générateur d'histoires pour enfants basé sur l'intelligence artificielle. En quelques informations sur votre enfant, il crée une histoire originale de 15 pages avec des illustrations générées spécialement pour lui.
          </p>
          <Link to="/creer" className="btn-primary text-lg px-8 py-4">
            Générer une histoire — 5 €
          </Link>
          <p className="mt-3 text-sm text-kidoria-muted">Lisez les 5 premières pages gratuitement avant de payer</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-black text-center mb-12">Comment fonctionne le générateur d'histoires IA ?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: '✏️', title: 'Décrivez votre enfant', desc: 'Prénom, âge, personnage ou animal préféré, valeur que vous voulez transmettre (courage, amitié, persévérance…).' },
              { icon: '🤖', title: "L'IA génère l'histoire", desc: "Notre modèle d'IA crée une histoire originale adaptée à l'âge de votre enfant, avec des rebondissements et une morale." },
              { icon: '🎨', title: 'Illustrations générées', desc: 'Chaque page est illustrée dans le style que vous choisissez. Aquarelle, cartoon, conte — 5 styles disponibles.' },
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

      <section className="py-16 bg-kidoria-cream">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-black text-center mb-12">Pourquoi utiliser Fableya plutôt qu'un autre générateur d'histoires ?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { icon: '🦄', title: 'Une histoire vraiment unique', desc: 'Contrairement aux générateurs d\'histoires génériques, Fableya intègre le prénom, l\'âge et les goûts spécifiques de votre enfant. Chaque histoire est différente.' },
              { icon: '🖼️', title: 'Illustrations incluses', desc: 'La plupart des générateurs d\'histoires ne produisent que du texte. Fableya génère aussi les illustrations — 15 pages complètes prêtes à lire.' },
              { icon: '🌍', title: '7 langues disponibles', desc: 'Générez l\'histoire en français, anglais, espagnol, allemand, italien, portugais ou japonais. Idéal pour les familles bilingues.' },
              { icon: '⚡', title: 'Prêt en moins de 10 minutes', desc: 'Les 5 premières pages sont disponibles en 2 minutes. Le livre complet en moins de 10 minutes.' },
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

      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-black text-center mb-8">Questions fréquentes</h2>
          <div className="space-y-4">
            {[
              { q: 'Le générateur fonctionne-t-il pour tous les âges ?', r: 'Oui, de 1 à 10 ans. Fableya adapte automatiquement le vocabulaire, la longueur des phrases et la complexité de l\'histoire à l\'âge indiqué.' },
              { q: 'Puis-je choisir le thème de l\'histoire ?', r: 'Oui : aventure, magie & féerie, nature & animaux, espace, océan, ou vie quotidienne. Vous pouvez aussi décrire librement votre idée en mode avancé.' },
              { q: 'L\'histoire est-elle vraiment originale ?', r: 'Chaque histoire est générée à la demande et n\'existe nulle part ailleurs. Deux enfants avec le même prénom obtiendront des histoires différentes.' },
              { q: 'Combien coûte la génération ?', r: '5 € par livre complet (15 pages illustrées). Les 5 premières pages sont générées gratuitement pour que vous puissiez lire un extrait avant de payer.' },
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
          <h2 className="text-3xl font-black mb-4">Essayez le générateur gratuitement</h2>
          <p className="text-kidoria-muted mb-8">Les 5 premières pages sont gratuites · 5 € pour le livre complet</p>
          <Link to="/creer" className="btn-primary text-lg px-8 py-4">Générer l'histoire de mon enfant</Link>
        </div>
      </section>
    </div>
  )
}
