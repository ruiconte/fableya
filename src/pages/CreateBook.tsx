import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import i18n from '../i18n'
import { PageSEO } from '../components/PageSEO'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { useSubscription } from '../hooks/useSubscription'
import { VISUAL_STYLES, MORAL_VALUES, GENRES, BOOK_LANGUAGES } from '../lib/constants'
import type { BookFormData, VisualStyle, BookLanguage, CreationMode, Character } from '../lib/types'
import type { StyleProfile } from '../lib/providers/types'
import { CharacterSection } from '../components/CharacterSection'
import { StyleExplorer } from '../components/StyleExplorer'
import { BookShowcase } from '../components/BookShowcase'

const SUPPORTED_LANGUAGES: BookLanguage[] = ['fr', 'en', 'ja', 'es', 'de', 'it', 'pt']

function getSiteLang(): BookLanguage {
  const base = i18n.language?.split('-')[0] as BookLanguage
  return SUPPORTED_LANGUAGES.includes(base) ? base : 'fr'
}

export function CreateBook() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { subscription, loading: subLoading, subscribe } = useSubscription()
  const [form, setForm] = useState<BookFormData>({
    child_name: '',
    child_age: 4,
    genre: 'aventure',
    favorite_character: '',
    moral_value: 'courage',
    visual_style: 'aquarelle',
    language: getSiteLang(),
    custom_story_idea: '',
    creation_mode: 'quick',
  })
  const [styleTab, setStyleTab] = useState<'preset' | 'references'>('preset')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [trialEligible, setTrialEligible] = useState(false)

  useEffect(() => {
    if (!user || subscription?.isActive) return
    supabase
      .from('books')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .in('status', ['queued', 'paid', 'generating', 'completed', 'preview_ready'])
      .then(({ count }) => setTrialEligible((count ?? 0) === 0))
  }, [user, subscription])

  const set = <K extends keyof BookFormData>(key: K, value: BookFormData[K]) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const setMode = (mode: CreationMode) => set('creation_mode', mode)
  const isAdvanced = form.creation_mode === 'advanced'

  const validate = () => {
    if (!user) {
      navigate('/connexion', { state: { from: { pathname: '/creer' } } })
      return false
    }
    if (isAdvanced) {
      const chars = form.characters ?? []
      if (chars.length === 0) { setError('Ajoutez au moins un personnage.'); return false }
      if (chars.some(c => !c.name.trim())) { setError('Chaque personnage doit avoir un nom.'); return false }
    } else {
      if (!form.child_name.trim()) { setError(t('create.errorName')); return false }
    }
    return true
  }

  // Build form_data for submission — derive legacy child_name/child_age from
  // main character for n8n backward compatibility
  const buildSubmitData = (): BookFormData => {
    if (!isAdvanced || !form.characters?.length) return form
    const main = form.characters.find(c => c.role === 'main') ?? form.characters[0]
    const ageNum = main.age ? parseInt(main.age) : NaN
    return {
      ...form,
      child_name: main.name,
      child_age: isNaN(ageNum) ? 4 : ageNum,
    }
  }

  const buildTitle = (data: BookFormData): string => {
    const protagonist = data.child_name || (form.characters?.[0]?.name ?? 'Personnage')
    const lang = data.language ?? 'fr'
    const templates: Record<string, (n: string) => string> = {
      fr: n => `L'histoire de ${n}`,
      en: n => `${n}'s Story`,
      ja: n => `${n}のお話`,
      es: n => `La historia de ${n}`,
      de: n => `Die Geschichte von ${n}`,
      it: n => `La storia di ${n}`,
      pt: n => `A história de ${n}`,
    }
    return (templates[lang] ?? templates['fr'])(protagonist)
  }

  const handlePayNow = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!validate()) return
    setLoading(true)
    try {
      const submitData = buildSubmitData()
      const title = buildTitle(submitData)
      const { data: book, error: bookError } = await supabase
        .from('books')
        .insert({ user_id: user!.id, title, status: 'pending_payment', form_data: submitData })
        .select().single()
      if (bookError) throw bookError
      const { data: sessionData, error: fnError } = await supabase.functions.invoke('create-checkout', { body: { book_id: book.id } })
      if (fnError) throw fnError
      window.location.href = sessionData.url
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'))
      setLoading(false)
    }
  }

  const handleGenerateWithSub = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!validate()) return
    setLoading(true)
    try {
      const submitData = buildSubmitData()
      const title = buildTitle(submitData)
      const { data: book, error: bookError } = await supabase
        .from('books')
        .insert({ user_id: user!.id, title, status: 'queued', form_data: submitData })
        .select().single()
      if (bookError) throw bookError
      // GeneratingBook will call generate-book automatically on arrival
      navigate(`/generation?book_id=${book.id}&source=${trialEligible ? 'trial' : 'sub'}`)
    } catch (err) {
      console.error('handleGenerateWithSub error:', err)
      const msg = err instanceof Error ? err.message
        : (err as { message?: string })?.message
        || JSON.stringify(err)
        || t('common.error')
      setError(msg)
      setLoading(false)
    }
  }

  const fillExample = (text: string) => set('custom_story_idea', text)

  const EXAMPLES = [
    t('create.storyIdeaExample1'),
    t('create.storyIdeaExample2'),
    t('create.storyIdeaExample3'),
    t('create.storyIdeaExample4'),
  ]

  return (
    <div className="page-container max-w-2xl" style={{ position: 'relative', zIndex: 1 }}>
      <BookShowcase />
      <PageSEO title="Créer un livre personnalisé" description="Personnalisez le livre de votre enfant : prénom, âge, thème, style d'illustration. Votre histoire unique est prête en quelques minutes." canonical="/creer" />
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="font-display text-4xl sm:text-5xl mb-3">{t('create.title')}</h1>
        <p className="text-kidoria-muted">{t('create.subtitle')}</p>
      </div>

      {/* Subscription status banner */}
      {!subLoading && subscription?.isActive && (
        <div className="mb-6 rounded-2xl border border-kidoria-rose/30 bg-kidoria-rose/5 px-5 py-4 flex items-center gap-4">
          <div className="flex-1">
            <p className="font-semibold text-sm text-kidoria-text">{subscription.planName}</p>
            <p className="text-xs text-kidoria-muted mt-0.5">
              {subscription.booksRemaining > 0
                ? t('create.usageLine', { used: subscription.booksUsed, total: subscription.planBookLimit })
                : t('create.quotaReachedLine', { date: subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString(undefined, { day: 'numeric', month: 'long' }) : '—' })
              }
            </p>
          </div>
          <div className="w-24">
            <div className="h-1.5 bg-kidoria-sky rounded-full overflow-hidden">
              <div
                className="h-full bg-kidoria-rose rounded-full"
                style={{ width: `${Math.round((subscription.booksUsed / subscription.planBookLimit) * 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-kidoria-muted text-right mt-1">
              {t('create.booksLeft', { count: subscription.booksRemaining })}
            </p>
          </div>
        </div>
      )}

      {/* Quota exceeded: show pay-per-book option */}
      {!subLoading && subscription?.isActive && subscription.booksRemaining === 0 && (
        <div className="mb-6 rounded-2xl bg-amber-50 border border-amber-200 px-5 py-4 text-sm text-amber-800">
          <p className="font-semibold mb-1">{t('create.quotaTitle')}</p>
          <p className="text-xs mb-3">{t('create.quotaText', { total: subscription.planBookLimit })}</p>
        </div>
      )}

      {/* Non-subscriber upsell */}
      {!subLoading && !subscription?.isActive && (
        <div className="mb-6 rounded-2xl bg-kidoria-lavender/30 border border-kidoria-sky px-5 py-4 flex items-center gap-4">
          <div className="flex-1">
            <p className="font-semibold text-sm">{t('create.upsellTitle')}</p>
            <p className="text-xs text-kidoria-muted mt-0.5">{t('create.upsellSub')}</p>
          </div>
          <button onClick={subscribe} className="btn-primary shrink-0 text-xs px-4 py-2">
            {t('create.subscribe')}
          </button>
        </div>
      )}

      {/* Mode toggle */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <button
          type="button"
          onClick={() => setMode('quick')}
          className={`rounded-2xl border-2 p-4 text-left transition-all ${
            !isAdvanced
              ? 'border-kidoria-rose bg-kidoria-rose/10'
              : 'border-gray-200 hover:border-kidoria-rose/40 bg-white'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="font-black text-sm">{t('create.modeQuick')}</span>
            {!isAdvanced && <span className="ml-auto text-kidoria-rose text-sm font-bold">✓</span>}
          </div>
          <p className="text-xs text-kidoria-muted leading-snug">{t('create.modeQuickDesc')}</p>
        </button>

        <button
          type="button"
          onClick={() => setMode('advanced')}
          className={`rounded-2xl border-2 p-4 text-left transition-all ${
            isAdvanced
              ? 'border-kidoria-rose bg-kidoria-rose/10'
              : 'border-gray-200 hover:border-kidoria-rose/40 bg-white'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="font-black text-sm">{t('create.modeAdvanced')}</span>
            {isAdvanced && <span className="ml-auto text-kidoria-rose text-sm font-bold">✓</span>}
          </div>
          <p className="text-xs text-kidoria-muted leading-snug">{t('create.modeAdvancedDesc')}</p>
        </button>
      </div>

      <form onSubmit={e => e.preventDefault()} className="space-y-8">

        {/* ── Child info (quick mode) ── */}
        {!isAdvanced && (
          <div className="card space-y-6">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-kidoria-rose text-white text-xs font-black flex items-center justify-center shrink-0">1</span>
              <h2 className="font-display text-xl">{t('create.childSection')}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="child_name">{t('create.childName')} *</label>
                <input id="child_name" type="text" className="input"
                  placeholder={t('create.childNamePlaceholder')}
                  value={form.child_name} onChange={e => set('child_name', e.target.value)}
                  maxLength={30} required />
              </div>
              <div>
                <label className="label" htmlFor="child_age">{t('create.childAge')} *</label>
                <select id="child_age" className="input" value={form.child_age}
                  onChange={e => set('child_age', Number(e.target.value))}>
                  {Array.from({ length: 10 }, (_, i) => i + 2).map(age => (
                    <option key={age} value={age}>{age} {t('create.childAgeUnit')}</option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-xs text-kidoria-muted bg-kidoria-cream rounded-xl px-3 py-2.5 leading-relaxed">
              <span className="font-semibold">{t('create.tipLabel')}</span> {t('create.childTip')}
            </p>
          </div>
        )}

        {/* ── Visual style (quick mode, preset only) ── */}
        {!isAdvanced && (
          <div className="card space-y-4">
            <h2 className="font-display text-xl">{t('create.styleSection')}</h2>
            <div className="space-y-3">
              {VISUAL_STYLES.filter(s => s.value !== 'custom').map(s => (
                <button key={s.value} type="button" onClick={() => {
                  set('visual_style', s.value as VisualStyle)
                  setForm(prev => ({ ...prev, style_profile: { references: [], generatedPrompt: s.prompt } }))
                }}
                  className={`w-full rounded-2xl border-2 p-4 text-left flex items-center gap-3 transition-all ${
                    form.visual_style === s.value
                      ? 'border-kidoria-rose bg-kidoria-rose/10'
                      : 'border-gray-200 hover:border-kidoria-rose/50'
                  }`}>
                  <div>
                    <div className="font-bold text-sm">{t(`styles.${s.value}_label`)}</div>
                    <div className="text-xs text-kidoria-muted">{t(`styles.${s.value}_desc`)}</div>
                  </div>
                  {form.visual_style === s.value && <span className="ml-auto text-kidoria-rose text-xl">✓</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Characters (advanced mode) ── */}
        {isAdvanced && (
          <div className="card space-y-6">
            <div>
              <h2 className="font-display text-xl">{t('create.charactersSection')}</h2>
              <p className="text-sm text-kidoria-muted mt-1">
                {t('create.charactersSub')}
              </p>
            </div>
            <CharacterSection
              characters={form.characters ?? []}
              onChange={(chars: Character[]) => setForm(prev => ({ ...prev, characters: chars }))}
            />
          </div>
        )}

        {/* ── Genre (always visible) ── */}
        <div className="card space-y-6">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-full bg-kidoria-rose text-white text-xs font-black flex items-center justify-center shrink-0">2</span>
            <h2 className="font-display text-xl">{t('create.genreSection')}</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {GENRES.map(g => (
              <button key={g.value} type="button" onClick={() => set('genre', g.value)}
                className={`rounded-2xl border-2 p-3 text-left transition-all ${
                  form.genre === g.value
                    ? 'border-kidoria-rose bg-kidoria-rose/10 font-bold'
                    : 'border-gray-200 hover:border-kidoria-rose/50 bg-white'
                }`}>
                <div className="text-sm font-semibold">{t(`genres.${g.value}`)}</div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Moral value (always visible) ── */}
        <div className="card space-y-6">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-full bg-kidoria-rose text-white text-xs font-black flex items-center justify-center shrink-0">3</span>
            <h2 className="font-display text-xl">{t('create.moralSection')}</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {MORAL_VALUES.map(v => (
              <button key={v.value} type="button" onClick={() => set('moral_value', v.value)}
                className={`rounded-2xl border-2 p-3 text-center transition-all ${
                  form.moral_value === v.value
                    ? 'border-kidoria-rose bg-kidoria-rose/10 font-bold'
                    : 'border-gray-200 hover:border-kidoria-rose/50 bg-white'
                }`}>
                <div className="text-xs font-semibold leading-tight">{t(`morals.${v.value}`)}</div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Advanced-only fields ── */}
        {isAdvanced && (
          <>
            {/* Visual style */}
            <div className="card space-y-6">
              <h2 className="font-display text-xl">{t('create.styleSection')}</h2>

              {/* Style tabs */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-kidoria-lavender/40 rounded-xl">
                <button type="button" onClick={() => {
                  setStyleTab('preset')
                  if (form.visual_style === 'custom') {
                    set('visual_style', 'aquarelle')
                    setForm(prev => ({ ...prev, style_profile: undefined }))
                  }
                }} className={`rounded-lg py-2 text-sm font-semibold transition-all ${
                  styleTab === 'preset' ? 'bg-white text-kidoria-text shadow-sm' : 'text-kidoria-muted hover:text-kidoria-text'
                }`}>
                  {t('create.styleTabPreset')}
                </button>
                <button type="button" onClick={() => {
                  if (!subscription?.isActive) return
                  setStyleTab('references')
                }} className={`rounded-lg py-2 text-sm font-semibold transition-all relative ${
                  styleTab === 'references' ? 'bg-white text-kidoria-text shadow-sm' : 'text-kidoria-muted hover:text-kidoria-text'
                } ${!subscription?.isActive ? 'opacity-60 cursor-not-allowed' : ''}`}>
                  {t('create.styleTabRef')}
                  {!subscription?.isActive && <span className="ml-1 text-[10px] bg-kidoria-rose/20 text-kidoria-rose rounded-full px-1.5 py-0.5">Plus</span>}
                </button>
              </div>

              {styleTab === 'preset' ? (
                <div className="space-y-3">
                  {VISUAL_STYLES.filter(s => s.value !== 'custom').map(s => (
                    <button key={s.value} type="button" onClick={() => {
                      set('visual_style', s.value as VisualStyle)
                      setForm(prev => ({ ...prev, style_profile: { references: [], generatedPrompt: s.prompt } }))
                    }}
                      className={`w-full rounded-2xl border-2 p-4 text-left flex items-center gap-3 transition-all ${
                        form.visual_style === s.value
                          ? 'border-kidoria-rose bg-kidoria-rose/10'
                          : 'border-gray-200 hover:border-kidoria-rose/50'
                      }`}>
                      <div>
                        <div className="font-bold text-sm">{t(`styles.${s.value}_label`)}</div>
                        <div className="text-xs text-kidoria-muted">{t(`styles.${s.value}_desc`)}</div>
                      </div>
                      {form.visual_style === s.value && <span className="ml-auto text-kidoria-rose text-xl">✓</span>}
                    </button>
                  ))}
                </div>
              ) : subscription?.isActive ? (
                <div className="space-y-4">
                  <p className="text-sm text-kidoria-muted leading-relaxed">
                    {t('create.refImageDesc')}
                  </p>
                  <StyleExplorer
                    selected={form.style_profile ?? null}
                    onSelect={(profile: StyleProfile) => {
                      set('visual_style', 'custom')
                      setForm(prev => ({ ...prev, style_profile: profile }))
                    }}
                    onClear={() => {
                      set('visual_style', 'aquarelle')
                      setForm(prev => ({ ...prev, style_profile: undefined }))
                    }}
                  />
                </div>
              ) : null}
            </div>

            {/* Book language */}
            {<div className="card space-y-6">
              <h2 className="font-display text-xl">{t('create.languageSection')}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {BOOK_LANGUAGES.map(l => (
                  <button key={l.value} type="button" onClick={() => set('language', l.value as BookLanguage)}
                    className={`rounded-2xl border-2 p-3 text-center transition-all ${
                      form.language === l.value
                        ? 'border-kidoria-rose bg-kidoria-rose/10 font-bold'
                        : 'border-gray-200 hover:border-kidoria-rose/50'
                    }`}>
                    <div className="text-2xl mb-1">{l.flag}</div>
                    <div className="text-xs font-semibold leading-tight">{t(`bookLanguages.${l.value}`)}</div>
                  </button>
                ))}
              </div>
            </div>}

            {/* Story idea — free text */}
            <div className="card space-y-6">
              <div>
                <h2 className="font-black text-lg mb-1">{t('create.storyIdeaSection')}</h2>
                <p className="text-sm text-kidoria-muted leading-relaxed">{t('create.storyIdeaIntro')}</p>
              </div>

              <textarea
                className="input resize-none leading-relaxed"
                rows={5}
                placeholder={t('create.storyIdeaPlaceholder')}
                value={form.custom_story_idea}
                onChange={e => set('custom_story_idea', e.target.value)}
                maxLength={1000}
              />

              <div className="flex justify-end">
                <span className="text-xs text-kidoria-muted">{form.custom_story_idea.length}/1000</span>
              </div>

              <p className="text-xs text-kidoria-muted italic">{t('create.storyIdeaOptional')}</p>

              {/* Example chips */}
              <div>
                <p className="text-xs font-semibold text-kidoria-muted mb-2">{t('create.storyIdeaExamples')}</p>
                <div className="flex flex-col gap-2">
                  {EXAMPLES.map((ex, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => fillExample(ex)}
                      className="text-left text-xs bg-kidoria-cream hover:bg-kidoria-rose/10 border border-kidoria-rose/20 hover:border-kidoria-rose/50 rounded-xl px-3 py-2.5 text-kidoria-muted hover:text-kidoria-text transition-all leading-relaxed"
                    >
                      <span className="text-kidoria-rose mr-1.5">→</span>{ex}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 font-medium">{error}</div>
        )}

        {/* Submit */}
        <div className="card text-center bg-kidoria-lavender/20">
          <p className="text-kidoria-muted text-sm mb-4">{t('create.summaryNote')}</p>
          {subscription?.isActive && subscription.booksRemaining > 0 ? (
            <button type="button" onClick={handleGenerateWithSub} disabled={loading}
              className="btn-primary text-base px-8 py-3.5 w-full sm:w-auto">
              {loading ? '…' : t('create.generateButton')}
            </button>
          ) : trialEligible ? (
            <button type="button" onClick={handleGenerateWithSub} disabled={loading}
              className="btn-primary text-base px-8 py-3.5 w-full sm:w-auto">
              {loading ? '…' : t('create.trialButton')}
            </button>
          ) : (
            <button type="button" onClick={handlePayNow} disabled={loading}
              className="btn-primary text-base px-8 py-3.5 w-full sm:w-auto">
              {loading ? '…' : t('create.payButton2')}
            </button>
          )}
          <p className="text-xs text-kidoria-muted mt-3">
            {subscription?.isActive && subscription.booksRemaining > 0
              ? t('create.includedInSub', { count: subscription.booksRemaining })
              : trialEligible
                ? t('create.trialNote')
                : t('create.paySecure')}
          </p>
        </div>
      </form>
    </div>
  )
}
