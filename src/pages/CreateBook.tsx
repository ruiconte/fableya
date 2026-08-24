import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import i18n from '../i18n'
import { PageSEO } from '../components/PageSEO'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { VISUAL_STYLES, MORAL_VALUES, GENRES, BOOK_LANGUAGES } from '../lib/constants'
import type { BookFormData, VisualStyle, BookLanguage, CreationMode } from '../lib/types'
import type { StyleProfile } from '../lib/providers/types'
import { StyleExplorer } from '../components/StyleExplorer'

const SUPPORTED_LANGUAGES: BookLanguage[] = ['fr', 'en', 'ja', 'es', 'de', 'it', 'pt']

function getSiteLang(): BookLanguage {
  const base = i18n.language?.split('-')[0] as BookLanguage
  return SUPPORTED_LANGUAGES.includes(base) ? base : 'fr'
}

export function CreateBook() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()
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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [styleTab, setStyleTab] = useState<'preset' | 'explorer'>('preset')

  const set = <K extends keyof BookFormData>(key: K, value: BookFormData[K]) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const setMode = (mode: CreationMode) => set('creation_mode', mode)
  const isAdvanced = form.creation_mode === 'advanced'

  const validate = () => {
    if (!user) {
      navigate('/connexion', { state: { from: { pathname: '/creer' } } })
      return false
    }
    if (!form.child_name.trim()) { setError(t('create.errorName')); return false }
    if (isAdvanced && !form.favorite_character.trim()) { setError(t('create.errorChar')); return false }
    return true
  }

  const handlePreview = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!validate()) return
    setLoading(true)
    try {
      const title = `${form.child_name} et ${form.favorite_character || form.genre}`
      const { data: book, error: bookError } = await supabase
        .from('books')
        .insert({ user_id: user!.id, title, status: 'pending', form_data: form })
        .select().single()
      if (bookError) throw bookError
      navigate(`/preview/${book.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'))
      setLoading(false)
    }
  }

  const handlePayNow = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!validate()) return
    setLoading(true)
    try {
      const title = `${form.child_name} et ${form.favorite_character || form.genre}`
      const { data: book, error: bookError } = await supabase
        .from('books')
        .insert({ user_id: user!.id, title, status: 'pending_payment', form_data: form })
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

  const handleSubmit = handlePreview

  const fillExample = (text: string) => set('custom_story_idea', text)

  const EXAMPLES = [
    t('create.storyIdeaExample1'),
    t('create.storyIdeaExample2'),
    t('create.storyIdeaExample3'),
    t('create.storyIdeaExample4'),
  ]

  return (
    <div className="page-container max-w-2xl">
      <PageSEO title="Créer un livre personnalisé" description="Personnalisez le livre de votre enfant : prénom, âge, thème, style d'illustration. Votre histoire unique est prête en quelques minutes." canonical="/creer" />
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="font-display text-4xl sm:text-5xl mb-3">{t('create.title')}</h1>
        <p className="text-kidoria-muted">{t('create.subtitle')}</p>
      </div>

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
            <span className="text-xl">⚡</span>
            <span className="font-black text-sm">{t('create.modeQuick')}</span>
            {!isAdvanced && <span className="ml-auto text-kidoria-rose">✓</span>}
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
            <span className="text-xl">🎨</span>
            <span className="font-black text-sm">{t('create.modeAdvanced')}</span>
            {isAdvanced && <span className="ml-auto text-kidoria-rose">✓</span>}
          </div>
          <p className="text-xs text-kidoria-muted leading-snug">{t('create.modeAdvancedDesc')}</p>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── Child info (always visible) ── */}
        <div className="card space-y-5">
          <h2 className="font-black text-lg">{t('create.childSection')}</h2>
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

          {/* Favorite character — advanced only */}
          {isAdvanced && (
            <div>
              <label className="label" htmlFor="favorite_character">{t('create.favoriteChar')}</label>
              <input id="favorite_character" type="text" className="input"
                placeholder={t('create.favoriteCharPlaceholder')}
                value={form.favorite_character} onChange={e => set('favorite_character', e.target.value)}
                maxLength={50} />
            </div>
          )}
        </div>

        {/* ── Genre (always visible) ── */}
        <div className="card space-y-4">
          <h2 className="font-black text-lg">{t('create.genreSection')}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {GENRES.map(g => (
              <button key={g.value} type="button" onClick={() => set('genre', g.value)}
                className={`rounded-2xl border-2 p-3 text-left transition-all ${
                  form.genre === g.value
                    ? 'border-kidoria-rose bg-kidoria-rose/10 font-bold'
                    : 'border-gray-200 hover:border-kidoria-rose/50'
                }`}>
                <div className="text-xl mb-1">{g.emoji}</div>
                <div className="text-sm font-semibold">{t(`genres.${g.value}`)}</div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Moral value (always visible) ── */}
        <div className="card space-y-4">
          <h2 className="font-black text-lg">{t('create.moralSection')}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {MORAL_VALUES.map(v => (
              <button key={v.value} type="button" onClick={() => set('moral_value', v.value)}
                className={`rounded-2xl border-2 p-3 text-center transition-all ${
                  form.moral_value === v.value
                    ? 'border-kidoria-rose bg-kidoria-rose/10 font-bold'
                    : 'border-gray-200 hover:border-kidoria-rose/50'
                }`}>
                <div className="text-xl mb-1">{v.emoji}</div>
                <div className="text-xs font-semibold leading-tight">{t(`morals.${v.value}`)}</div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Advanced-only fields ── */}
        {isAdvanced && (
          <>
            {/* Visual style */}
            <div className="card space-y-4">
              <h2 className="font-black text-lg">{t('create.styleSection')}</h2>

              {/* Style mode tabs */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-kidoria-lavender/40 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setStyleTab('preset')
                    if (form.visual_style === 'custom') set('visual_style', 'aquarelle')
                  }}
                  className={`rounded-lg py-2 text-sm font-semibold transition-all ${
                    styleTab === 'preset'
                      ? 'bg-white text-kidoria-text shadow-sm'
                      : 'text-kidoria-muted hover:text-kidoria-text'
                  }`}
                >
                  🎨 Styles Fableya
                </button>
                <button
                  type="button"
                  onClick={() => setStyleTab('explorer')}
                  className={`rounded-lg py-2 text-sm font-semibold transition-all ${
                    styleTab === 'explorer'
                      ? 'bg-white text-kidoria-text shadow-sm'
                      : 'text-kidoria-muted hover:text-kidoria-text'
                  }`}
                >
                  ✨ Trouver mon style
                </button>
              </div>

              {styleTab === 'preset' ? (
                <div className="space-y-3">
                  {VISUAL_STYLES.map(s => (
                    <button key={s.value} type="button" onClick={() => set('visual_style', s.value as VisualStyle)}
                      className={`w-full rounded-2xl border-2 p-4 text-left flex items-center gap-3 transition-all ${
                        form.visual_style === s.value
                          ? 'border-kidoria-rose bg-kidoria-rose/10'
                          : 'border-gray-200 hover:border-kidoria-rose/50'
                      }`}>
                      <span className="text-2xl">{s.emoji}</span>
                      <div>
                        <div className="font-bold text-sm">{t(`styles.${s.value}_label`)}</div>
                        <div className="text-xs text-kidoria-muted">{t(`styles.${s.value}_desc`)}</div>
                      </div>
                      {form.visual_style === s.value && <span className="ml-auto text-kidoria-rose text-xl">✓</span>}
                    </button>
                  ))}
                </div>
              ) : (
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
              )}
            </div>

            {/* Book language — advanced mode only */}
            {isAdvanced && <div className="card space-y-4">
              <h2 className="font-black text-lg">{t('create.languageSection')}</h2>
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
            <div className="card space-y-4">
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
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button type="submit" onClick={handlePreview} disabled={loading}
              className="btn-secondary text-base px-8 py-3.5 w-full sm:w-auto">
              {loading ? '…' : `👀 ${t('create.previewButton')}`}
            </button>
            <button type="button" onClick={handlePayNow} disabled={loading}
              className="btn-primary text-base px-8 py-3.5 w-full sm:w-auto">
              {loading ? '…' : `⚡ ${t('create.payButton2')}`}
            </button>
          </div>
          <p className="text-xs text-kidoria-muted mt-3">{t('create.paySecure')}</p>
        </div>
      </form>
    </div>
  )
}
