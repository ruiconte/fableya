import { Link } from 'react-router-dom'
import { useTranslation, Trans } from 'react-i18next'
import { SAMPLE_BOOKS } from '../lib/sampleBooks'
import { PageSEO } from '../components/PageSEO'

export function Home() {
  const { t } = useTranslation()

  const steps = [
    { icon: '✏️', titleKey: 'home.step1Title', descKey: 'home.step1Desc' },
    { icon: '💳', titleKey: 'home.step2Title', descKey: 'home.step2Desc' },
    { icon: '✨', titleKey: 'home.step3Title', descKey: 'home.step3Desc' },
  ]

  const features = [
    { icon: '🎨', key: 'home.feature1' },
    { icon: '🌍', key: 'home.feature2' },
    { icon: '💛', key: 'home.feature3' },
    { icon: '📱', key: 'home.feature4' },
    { icon: '🔒', key: 'home.feature5' },
  ]

  return (
    <div>
      <PageSEO
        title="Livre personnalisé pour enfant — Histoire unique générée par IA"
        description="Créez un livre illustré personnalisé où votre enfant est le héros. Histoire unique générée en quelques minutes, illustrations IA, livraison digitale immédiate."
        canonical="/"
      />
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-kidoria-cream to-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 pb-16 sm:pt-20 sm:pb-24 text-center">
          <div className="inline-flex items-center gap-2 bg-kidoria-rose/20 text-kidoria-text text-sm font-semibold px-4 py-2 rounded-full mb-6">
            <span>✨</span> {t('home.badge')}
          </div>
          <h1 className="text-4xl sm:text-6xl font-black leading-tight mb-6">
            <Trans
              i18nKey="home.hero"
              components={[
                <span key="0" className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400" />
              ]}
            />
          </h1>
          <p className="text-lg sm:text-xl text-kidoria-muted max-w-2xl mx-auto mb-10 leading-relaxed">
            {t('home.heroSub')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/creer" className="btn-primary text-lg px-8 py-4 shadow-lg">
              {t('home.heroCTA')}
            </Link>

          </div>
          <p className="mt-4 text-sm text-kidoria-muted">{t('home.heroSub2')}</p>

          <div className="absolute top-12 left-6 text-4xl opacity-20 sm:opacity-40 select-none pointer-events-none">🌸</div>
          <div className="absolute top-24 right-8 text-3xl opacity-20 sm:opacity-40 select-none pointer-events-none">⭐</div>
          <div className="absolute bottom-8 left-16 text-2xl opacity-20 sm:opacity-40 select-none pointer-events-none">🦋</div>
          <div className="absolute bottom-12 right-12 text-3xl opacity-20 sm:opacity-40 select-none pointer-events-none">🌈</div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-black text-center mb-12">{t('home.howTitle')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <div key={i} className="card text-center relative">
                <div className="w-12 h-12 rounded-2xl bg-kidoria-lavender/40 flex items-center justify-center text-2xl mx-auto mb-4">
                  {step.icon}
                </div>
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-kidoria-rose flex items-center justify-center text-sm font-black">
                  {i + 1}
                </div>
                <h3 className="font-black text-lg mb-2">{t(step.titleKey)}</h3>
                <p className="text-kidoria-muted text-sm leading-relaxed">{t(step.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Example books */}
      <section className="py-16 sm:py-20 bg-kidoria-cream">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-black text-center mb-4">{t('home.examplesTitle')}</h2>
          <p className="text-center text-kidoria-muted mb-12">{t('home.examplesSub')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {SAMPLE_BOOKS.map(book => (
              <Link key={book.id} to={`/exemple/${book.id}`} className="card hover:shadow-soft transition-shadow duration-300 group block">
                <div className="rounded-2xl h-40 overflow-hidden mb-4">
                  <img
                    src={book.pages[0].image_url}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="font-black text-base mb-1">{book.title}</h3>
                <p className="text-kidoria-muted text-sm">{t(`styles.${book.style}_label`)}</p>
                <p className="text-kidoria-rose text-xs font-semibold mt-2">Lire l'extrait →</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black mb-6">{t('home.whyTitle')}</h2>
              <ul className="space-y-4">
                {features.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-xl mt-0.5">{item.icon}</span>
                    <span className="text-kidoria-muted">{t(item.key)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-kidoria-lavender/30 to-kidoria-rose/20 rounded-3xl p-8 text-center">
              <div className="text-6xl mb-4">📖</div>
              <div className="text-5xl font-black text-kidoria-text mb-2">5 €</div>
              <div className="text-kidoria-muted font-semibold mb-6">{t('home.priceLabel')}</div>
              <Link to="/creer" className="btn-primary w-full justify-center">{t('home.startNow')}</Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:py-20 bg-kidoria-cream">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-black text-center mb-12">{t('home.faqTitle')}</h2>
          <div className="space-y-4">
            {[1,2,3,4,5].map(i => (
              <details key={i} className="card group">
                <summary className="font-black text-base cursor-pointer list-none flex justify-between items-center gap-4">
                  {t(`home.faq${i}Q`)}
                  <span className="text-kidoria-rose text-xl shrink-0 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-3 text-kidoria-muted leading-relaxed">{t(`home.faq${i}A`)}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Liens internes thématiques */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-xl font-black text-center mb-6 text-kidoria-muted">Pour chaque occasion</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { to: '/generateur-histoire-enfant-ia', label: '✨ Générateur histoire IA' },
              { to: '/cadeau-naissance', label: '🍼 Cadeau de naissance' },
              { to: '/cadeau-anniversaire-enfant', label: '🎂 Cadeau anniversaire' },
              { to: '/idee-cadeau-noel-enfant', label: '🎄 Cadeau de Noël' },
            ].map(item => (
              <Link key={item.to} to={item.to}
                className="rounded-2xl border-2 border-kidoria-rose/20 hover:border-kidoria-rose/50 p-3 text-center text-sm font-semibold transition-all hover:bg-kidoria-rose/5">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA bottom */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-kidoria-rose/30 to-kidoria-lavender/30">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-black mb-4">{t('home.ctaTitle')}</h2>
          <p className="text-kidoria-muted mb-8 text-lg">{t('home.ctaSub')}</p>
          <Link to="/creer" className="btn-primary text-lg px-8 py-4">{t('home.heroCTA')}</Link>
        </div>
      </section>
    </div>
  )
}
