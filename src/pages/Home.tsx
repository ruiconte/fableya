import { Link } from 'react-router-dom'
import { useTranslation, Trans } from 'react-i18next'
import { SAMPLE_BOOKS, type SampleBookData } from '../lib/sampleBooks'
import { PageSEO } from '../components/PageSEO'

function BookCover({
  book,
  className = '',
}: {
  book: SampleBookData
  className?: string
}) {
  return (
    <Link
      to={`/exemple/${book.id}`}
      className={`block rounded-xl overflow-hidden group ${className}`}
      style={{
        boxShadow: '-2px 3px 0 rgba(0,0,0,0.06), 0 16px 48px rgba(26,22,20,0.20)',
      }}
      tabIndex={-1}
    >
      {book.pages[0].image_url ? (
        <img
          src={book.pages[0].image_url}
          alt={book.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full bg-kidoria-lavender flex items-center justify-center text-4xl">📖</div>
      )}
    </Link>
  )
}

export function Home() {
  const { t } = useTranslation()

  return (
    <div>
      <PageSEO
        title="Livre personnalisé pour enfant — Histoire unique générée par IA"
        description="Créez un livre illustré personnalisé où votre enfant est le héros. Histoire unique générée en quelques minutes, illustrations IA, livraison digitale immédiate."
        canonical="/"
      />

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="min-h-[calc(100vh-64px)] flex items-center overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full py-16 lg:py-0">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-0">

            {/* Left: headline */}
            <div className="lg:w-[42%] lg:pr-10 text-center lg:text-left">
              <p className="text-kidoria-rose text-[11px] font-semibold tracking-[0.22em] uppercase mb-8">
                {t('home.badge')}
              </p>
              <h1 className="font-display text-5xl sm:text-6xl lg:text-[3.8rem] xl:text-[4.4rem] leading-[1.08] text-kidoria-text mb-7">
                <Trans
                  i18nKey="home.hero"
                  components={[
                    <em key="0" className="not-italic text-kidoria-rose" />,
                  ]}
                />
              </h1>
              <p className="text-kidoria-muted text-lg leading-relaxed mb-10 max-w-md mx-auto lg:mx-0">
                {t('home.heroSub')}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link to="/creer" className="btn-primary text-base px-8 py-4">
                  {t('home.heroCTA')}
                </Link>
                <Link to="/apercu" className="btn-secondary text-base px-8 py-4 flex items-center gap-2">
                  <span style={{display:'inline-flex',alignItems:'center',justifyContent:'center',width:22,height:22,borderRadius:'50%',background:'#1a1614',flexShrink:0}}>
                    <svg width="8" height="10" viewBox="0 0 8 10" fill="none"><path d="M1 1l6 4-6 4V1z" fill="white"/></svg>
                  </span>
                  Voir un exemple
                </Link>
              </div>
              <p className="mt-5 text-sm text-kidoria-muted">{t('home.heroSub2')}</p>
            </div>

            {/* Right: scattered books (desktop) */}
            <div className="hidden lg:block lg:w-[58%] relative h-[620px] xl:h-[680px]">
              {/* Stars */}
              {[
                { top:'8%',  left:'18%',  color:'#F0C060', size:22 },
                { top:'5%',  left:'52%',  color:'#7B9EA8', size:16 },
                { top:'16%', right:'10%', color:'#E8834A', size:20 },
                { top:'44%', left:'8%',   color:'#D4829A', size:18 },
                { top:'52%', left:'55%',  color:'#7B9EA8', size:14 },
                { top:'62%', right:'12%', color:'#F0C060', size:24 },
                { top:'78%', left:'34%',  color:'#E8834A', size:16 },
                { top:'30%', left:'36%',  color:'#D4829A', size:12 },
              ].map((s, i) => {
                const ro = s.size/2, ri = s.size/4
                const pts = Array.from({length:5},(_,j)=>{
                  const a=(Math.PI*2*j)/5-Math.PI/2, b=a+Math.PI/5
                  return [Math.cos(a)*ro+ro, Math.sin(a)*ro+ro, Math.cos(b)*ri+ro, Math.sin(b)*ri+ro]
                })
                const d = pts.map(([ox,oy,ix,iy],j)=>`${j===0?'M':'L'}${ox},${oy} L${ix},${iy}`).join(' ')+'Z'
                return (
                  <div key={i} style={{position:'absolute', top:s.top, left:(s as {left?:string}).left, right:(s as {right?:string}).right, zIndex:5, pointerEvents:'none'}}>
                    <svg width={s.size} height={s.size} viewBox={`0 0 ${s.size} ${s.size}`}><path d={d} fill={s.color}/></svg>
                  </div>
                )
              })}

              {/* Row 1 books */}
              <div className="absolute book-float-a" style={{width:200,top:'3%',left:'2%',transform:'rotate(-14deg)',zIndex:10,borderRadius:12,overflow:'hidden',boxShadow:'0 16px 48px rgba(26,22,20,0.22)'}}>
                <BookCover book={SAMPLE_BOOKS[0]} className="w-full" />
              </div>
              <div className="absolute book-float-b" style={{width:210,top:'1%',left:'33%',transform:'rotate(5deg)',zIndex:12,borderRadius:12,overflow:'hidden',boxShadow:'0 16px 48px rgba(26,22,20,0.22)'}}>
                <BookCover book={SAMPLE_BOOKS[1]} className="w-full" />
              </div>
              <div className="absolute book-float-c" style={{width:185,top:'4%',right:'2%',transform:'rotate(12deg)',zIndex:10,borderRadius:12,overflow:'hidden',boxShadow:'0 16px 48px rgba(26,22,20,0.22)'}}>
                <BookCover book={SAMPLE_BOOKS[2]} className="w-full" />
              </div>

              {/* Row 2 books */}
              <div className="absolute book-float-b" style={{width:230,top:'46%',left:'0%',transform:'rotate(-7deg)',zIndex:14,borderRadius:12,overflow:'hidden',boxShadow:'0 20px 56px rgba(26,22,20,0.26)'}}>
                <BookCover book={SAMPLE_BOOKS[2]} className="w-full" />
              </div>
              <div className="absolute book-float-a" style={{width:200,top:'44%',left:'36%',transform:'rotate(8deg)',zIndex:13,borderRadius:12,overflow:'hidden',boxShadow:'0 16px 48px rgba(26,22,20,0.22)'}}>
                <BookCover book={SAMPLE_BOOKS[0]} className="w-full" />
              </div>
              <div className="absolute book-float-c" style={{width:190,top:'43%',right:'1%',transform:'rotate(-10deg)',zIndex:11,borderRadius:12,overflow:'hidden',boxShadow:'0 16px 48px rgba(26,22,20,0.22)'}}>
                <BookCover book={SAMPLE_BOOKS[1]} className="w-full" />
              </div>

              {/* Social proof */}
              <div style={{position:'absolute',bottom:'3%',right:'4%',background:'white',borderRadius:40,padding:'10px 18px',display:'flex',alignItems:'center',gap:10,boxShadow:'0 4px 24px rgba(26,22,20,0.12)',zIndex:20}}>
                <span style={{fontSize:16}}>✨</span>
                <span style={{fontSize:13,fontWeight:600,color:'#1a1614'}}>Des milliers d'histoires uniques déjà créées</span>
                <div style={{display:'flex',marginLeft:4}}>
                  {['#C89EAE','#8BB0C8','#A0C89A'].map((c,i)=>(
                    <div key={i} style={{width:26,height:26,borderRadius:'50%',background:c,border:'2px solid white',marginLeft:i>0?-8:0,zIndex:3-i}}/>
                  ))}
                  <span style={{marginLeft:6,fontSize:12,fontWeight:700,color:'#1a1614',alignSelf:'center'}}>+10k</span>
                </div>
              </div>
            </div>

            {/* Mobile: horizontal book strip */}
            <div className="lg:hidden flex gap-4 overflow-x-auto pb-2 -mx-6 px-6 w-full scrollbar-hide">
              {SAMPLE_BOOKS.map((book, i) => {
                const rotations = ['-3deg', '4deg', '-2deg']
                return (
                  <div
                    key={book.id}
                    className="shrink-0 w-32 sm:w-36 aspect-[3/4]"
                    style={{ transform: `rotate(${rotations[i]})` }}
                  >
                    <BookCover book={book} className="w-full h-full" />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      <section className="py-24 border-y border-kidoria-sky bg-kidoria-lavender/25">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="font-display text-4xl lg:text-5xl text-center mb-20">
            {t('home.howTitle')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 lg:gap-16">
            {[
              { n: '01', titleKey: 'home.step1Title', descKey: 'home.step1Desc' },
              { n: '02', titleKey: 'home.step2Title', descKey: 'home.step2Desc' },
              { n: '03', titleKey: 'home.step3Title', descKey: 'home.step3Desc' },
            ].map(step => (
              <div key={step.n}>
                <p className="text-kidoria-rose text-xs font-bold tracking-[0.18em] mb-5">{step.n}</p>
                <h3 className="font-display text-2xl mb-3 text-kidoria-text">{t(step.titleKey)}</h3>
                <p className="text-kidoria-muted leading-relaxed text-sm">{t(step.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOOK GALLERY ─────────────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-14 gap-5">
            <div>
              <p className="text-kidoria-rose text-[11px] font-semibold tracking-[0.22em] uppercase mb-4">
                {t('home.examplesTitle')}
              </p>
              <h2 className="font-display text-4xl lg:text-5xl max-w-lg text-kidoria-text">
                {t('home.examplesSub')}
              </h2>
            </div>
            <Link to="/apercu" className="btn-secondary self-start lg:self-auto shrink-0 text-sm">
              Explorer les exemples →
            </Link>
          </div>

          {/* Asymmetric grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            {SAMPLE_BOOKS.map((book, i) => (
              <Link
                key={book.id}
                to={`/exemple/${book.id}`}
                className={`group block rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 ${i === 0 ? 'lg:row-span-2' : ''}`}
                style={{ boxShadow: '0 2px 20px rgba(26,22,20,0.09)' }}
              >
                <div className={`relative overflow-hidden ${i === 0 ? 'aspect-[3/4] lg:h-full' : 'aspect-[3/4]'}`}>
                  {book.pages[0].image_url ? (
                    <img
                      src={book.pages[0].image_url}
                      alt={book.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-kidoria-lavender flex items-center justify-center text-4xl">📖</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5">
                    <div>
                      <p className="text-white font-semibold text-sm">{book.title}</p>
                      <p className="text-white/70 text-xs mt-1">Lire l'extrait →</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY FABLEYA + PRICING ────────────────────────────────────────────── */}
      <section className="py-24 border-y border-kidoria-sky bg-kidoria-lavender/20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-start">
            <div>
              <p className="text-kidoria-rose text-[11px] font-semibold tracking-[0.22em] uppercase mb-6">Fableya</p>
              <h2 className="font-display text-4xl lg:text-5xl mb-10 text-kidoria-text">{t('home.whyTitle')}</h2>
              <ul className="space-y-6">
                {[1, 2, 3, 4, 5].map(i => (
                  <li key={i} className="flex items-start gap-4">
                    <span className="w-[5px] h-[5px] rounded-full bg-kidoria-rose mt-2.5 shrink-0" />
                    <span className="text-kidoria-muted leading-relaxed text-sm">{t(`home.feature${i}`)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pricing: two options */}
            <div className="space-y-4">
              {/* Pay-per-book */}
              <div className="bg-white rounded-xl border border-kidoria-sky p-7">
                <p className="text-xs font-semibold tracking-widest uppercase text-kidoria-muted mb-4">Un livre</p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="font-display text-5xl text-kidoria-text leading-none">5€</span>
                  <span className="text-kidoria-muted text-sm mb-1">/ livre</span>
                </div>
                <p className="text-kidoria-muted text-xs mb-5">15 pages illustrées · Paiement unique</p>
                <Link to="/creer" className="btn-secondary w-full justify-center text-sm py-3">
                  Créer un livre — 5 €
                </Link>
                <p className="text-xs text-kidoria-muted mt-3">Les 5 premières pages sont gratuites.</p>
              </div>

              {/* Fableya Plus */}
              <div className="bg-kidoria-rose rounded-xl p-7 text-white relative overflow-hidden">
                <div className="absolute top-3 right-3 text-[10px] font-bold bg-white/20 rounded-full px-2 py-0.5">
                  Recommandé
                </div>
                <p className="text-xs font-semibold tracking-widest uppercase text-white/70 mb-4">Fableya Plus</p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="font-display text-5xl leading-none">15€</span>
                  <span className="text-white/70 text-sm mb-1">/ mois</span>
                </div>
                <p className="text-white/80 text-xs mb-1">25 livres inclus chaque mois</p>
                <p className="text-white/60 text-xs mb-5">Soit 0,60 € / livre · Résiliation sans engagement</p>
                <Link to="/bibliotheque" className="block w-full text-center bg-white text-kidoria-rose font-semibold rounded-lg py-3 text-sm hover:bg-white/90 transition-opacity">
                  S'abonner — 15 € / mois
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="font-display text-4xl lg:text-5xl text-center mb-16">{t('home.faqTitle')}</h2>
          <div className="divide-y divide-kidoria-sky">
            {[1, 2, 3, 4, 5].map(i => (
              <details key={i} className="group py-6 cursor-pointer">
                <summary className="flex justify-between items-center gap-8 list-none">
                  <span className="font-medium text-base text-kidoria-text">{t(`home.faq${i}Q`)}</span>
                  <span className="text-kidoria-rose text-xl shrink-0 transition-transform duration-200 group-open:rotate-45 leading-none">+</span>
                </summary>
                <p className="mt-4 text-kidoria-muted leading-relaxed text-sm">{t(`home.faq${i}A`)}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA (dark) ─────────────────────────────────────────────────── */}
      <section className="py-24 bg-kidoria-text">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="font-display text-4xl lg:text-5xl text-white mb-6">{t('home.ctaTitle')}</h2>
          <p className="text-white/50 mb-10 text-lg">{t('home.ctaSub')}</p>
          <Link
            to="/creer"
            className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-kidoria-rose text-white font-semibold rounded-lg text-base hover:opacity-90 transition-opacity"
          >
            {t('home.heroCTA')}
          </Link>
        </div>
      </section>

      {/* ── SEO internal links ───────────────────────────────────────────────── */}
      <section className="py-10 border-t border-kidoria-sky">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { to: '/generateur-histoire-enfant-ia', label: 'Générateur histoire IA' },
              { to: '/cadeau-naissance', label: 'Cadeau de naissance' },
              { to: '/cadeau-anniversaire-enfant', label: 'Cadeau anniversaire enfant' },
              { to: '/idee-cadeau-noel-enfant', label: 'Cadeau Noël enfant' },
              { to: '/livre-prenom-enfant', label: 'Livre avec prénom' },
            ].map(item => (
              <Link
                key={item.to}
                to={item.to}
                className="text-xs text-kidoria-muted hover:text-kidoria-text border border-kidoria-sky hover:border-kidoria-muted/40 rounded-full px-4 py-1.5 transition-all"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
