import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'

export function GeneratingBook() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const bookId = searchParams.get('book_id')
  const [stepIndex, setStepIndex] = useState(0)
  const [status, setStatus] = useState<string>('generating')

  const steps = [
    t('generating.step1'),
    t('generating.step2'),
    t('generating.step3'),
    t('generating.step4'),
    t('generating.step5'),
  ]

  useEffect(() => {
    if (!bookId) return
    const interval = setInterval(async () => {
      const { data } = await supabase.from('books').select('status').eq('id', bookId).single()
      if (data?.status === 'completed') { clearInterval(interval); navigate(`/livre/${bookId}`) }
      else if (data?.status === 'failed') { clearInterval(interval); setStatus('failed') }
      else setStatus(data?.status ?? 'generating')
    }, 3000)
    return () => clearInterval(interval)
  }, [bookId, navigate])

  useEffect(() => {
    const t = setInterval(() => setStepIndex(prev => Math.min(prev + 1, steps.length - 1)), 4000)
    return () => clearInterval(t)
  }, [steps.length])

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

        <h1 className="text-3xl font-black mb-3">{t('generating.title')}</h1>
        <p className="text-kidoria-muted mb-10">{t('generating.subtitle')}</p>

        <div className="card text-left space-y-3">
          {steps.map((step, i) => (
            <div key={i} className={`flex items-center gap-3 transition-all duration-500 ${i <= stepIndex ? 'opacity-100' : 'opacity-30'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                i < stepIndex ? 'bg-green-400 text-white' :
                i === stepIndex ? 'bg-kidoria-rose text-white animate-pulse' :
                'bg-gray-200 text-gray-400'
              }`}>
                {i < stepIndex ? '✓' : i + 1}
              </div>
              <span className={`text-sm font-semibold ${i <= stepIndex ? 'text-kidoria-text' : 'text-gray-400'}`}>{step}</span>
              {i === stepIndex && i > 0 && (
                <div className="ml-auto">
                  <div className="w-4 h-4 border-2 border-kidoria-rose border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          ))}
        </div>

        <p className="text-xs text-kidoria-muted mt-6">{t('generating.dontClose')}</p>
      </div>
    </div>
  )
}
