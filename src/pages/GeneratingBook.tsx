import { useEffect, useState, useRef } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'

const TOTAL_PAGES = 15

export function GeneratingBook() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const bookId = searchParams.get('book_id')
  const source = searchParams.get('source') // 'paid' | 'sub' | 'trial'
  const [status, setStatus] = useState<string>('queued')
  const [pagesCount, setPagesCount] = useState(0)
  const [, setTick] = useState(0) // forces re-render every second for elapsed-time steps
  const generatingStartedAt = useRef<number | null>(null)

  // Time-based thresholds (ms since generation started)
  const STEP2_AT = 30_000  // character → story after 30s
  const STEP3_AT = 90_000  // story → illustration after 90s (or when pages > 0)

  const getStepIndex = () => {
    if (status === 'completed') return 4
    if (pagesCount >= TOTAL_PAGES - 1) return 4
    if (pagesCount > 0) return 3
    if (status === 'generating' || status === 'queued') {
      const elapsed = generatingStartedAt.current ? Date.now() - generatingStartedAt.current : 0
      if (elapsed >= STEP3_AT) return 3
      if (elapsed >= STEP2_AT) return 2
      if (generatingStartedAt.current) return 1
    }
    return 0
  }

  const stepIndex = getStepIndex()

  const steps = [
    source === 'paid' ? t('generating.step1Paid') : t('generating.step1Auth'),
    t('generating.step2'),
    t('generating.step3'),
    t('generating.step4'),
    t('generating.step5'),
  ]

  useEffect(() => {
    if (!bookId) return

    const kickoff = async () => {
      const { data: book } = await supabase.from('books').select('status').eq('id', bookId).single()
      if (book?.status === 'draft' || book?.status === 'queued' || book?.status === 'pending' || book?.status === 'paid') {
        if (!generatingStartedAt.current) generatingStartedAt.current = Date.now()
        const { error } = await supabase.functions.invoke('generate-book', { body: { book_id: bookId } })
        if (error) { setStatus('failed'); return }
      }
    }
    kickoff()

    // UI tick every second to advance time-based steps
    const ticker = setInterval(() => setTick(n => n + 1), 1000)

    const interval = setInterval(async () => {
      const [{ data: book }, { count }] = await Promise.all([
        supabase.from('books').select('status').eq('id', bookId).single(),
        supabase.from('book_pages').select('id', { count: 'exact', head: true }).eq('book_id', bookId),
      ])

      const newStatus = book?.status ?? 'generating'
      const newPages = count ?? 0

      if ((newStatus === 'generating' || newStatus === 'queued') && !generatingStartedAt.current) {
        generatingStartedAt.current = Date.now()
      }

      setPagesCount(newPages)
      setStatus(newStatus)

      if (newStatus === 'completed') {
        clearInterval(interval)
        clearInterval(ticker)
        navigate(`/livre/${bookId}`)
      } else if (newStatus === 'failed') {
        clearInterval(interval)
        clearInterval(ticker)
      }
    }, 3000)

    return () => { clearInterval(interval); clearInterval(ticker) }
  }, [bookId, navigate])

  if (status === 'failed') {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <div className="text-center card max-w-md">
          <div className="text-5xl mb-4">😔</div>
          <h1 className="text-2xl font-black mb-3">{t('generating.failedTitle')}</h1>
          <p className="text-kidoria-muted mb-6">{t('generating.failedSub')}</p>
          <Link to="/bibliotheque" className="btn-secondary">{t('generating.backToLibrary')}</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="text-center max-w-md w-full">
        <div className="relative w-32 h-32 mx-auto mb-8">
          <div className="absolute inset-0 bg-kidoria-rose/20 rounded-full animate-ping" />
          <div className="absolute inset-4 bg-kidoria-rose/30 rounded-full animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center text-5xl">✨</div>
        </div>

        <h1 className="text-3xl font-black mb-2">{t('generating.title')}</h1>
        <p className="text-kidoria-muted mb-3">{t('generating.subtitle')}</p>

        {/* Duration badge */}
        <div className="inline-flex items-center gap-2 bg-kidoria-lavender/50 text-kidoria-text text-sm font-semibold px-4 py-2 rounded-full mb-8">
          {t('generating.duration')}
        </div>

        <div className="card text-left space-y-3 mb-4">
          {steps.map((step, i) => {
            const done = i < stepIndex
            const active = i === stepIndex
            const pending = i > stepIndex
            return (
              <div key={i} className={`flex items-center gap-3 transition-all duration-500 ${pending ? 'opacity-30' : 'opacity-100'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                  done ? 'bg-green-400 text-white' :
                  active ? 'bg-kidoria-rose text-white' :
                  'bg-gray-200 text-gray-400'
                }`}>
                  {done ? '✓' : i + 1}
                </div>
                <span className={`text-sm font-semibold flex-1 ${pending ? 'text-gray-400' : 'text-kidoria-text'}`}>{step}</span>
                {active && i > 0 && (
                  <div className="w-4 h-4 border-2 border-kidoria-rose border-t-transparent rounded-full animate-spin" />
                )}
                {active && i === 3 && pagesCount > 0 && (
                  <span className="text-xs text-kidoria-muted font-semibold">{pagesCount}/{TOTAL_PAGES}</span>
                )}
              </div>
            )
          })}
        </div>

        {/* Quality explanation */}
        <div className="bg-kidoria-sky/40 rounded-2xl px-4 py-3 text-left mb-4">
          <p className="text-xs text-kidoria-muted leading-relaxed">{t('generating.qualityNote')}</p>
        </div>

        <p className="text-xs text-kidoria-muted">{t('generating.dontClose')}</p>
      </div>
    </div>
  )
}
