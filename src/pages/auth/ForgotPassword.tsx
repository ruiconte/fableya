import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation, Trans } from 'react-i18next'
import { supabase } from '../../lib/supabase'

export function ForgotPassword() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/nouveau-mot-de-passe`,
    })
    if (error) { setError(error.message); setLoading(false) }
    else setSent(true)
  }

  if (sent) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center card">
          <div className="text-5xl mb-4">📧</div>
          <h1 className="text-2xl font-black mb-3">{t('auth.emailSentTitle')}</h1>
          <p className="text-kidoria-muted leading-relaxed">
            <Trans i18nKey="auth.emailSentSub" values={{ email }} components={[<strong key="0" />]} />
          </p>
          <Link to="/connexion" className="btn-secondary mt-6 inline-flex">{t('auth.backToLogin')}</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-4xl">📚</Link>
          <h1 className="text-3xl font-black mt-4 mb-2">{t('auth.forgotTitle')}</h1>
          <p className="text-kidoria-muted">{t('auth.forgotSub')}</p>
        </div>
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="email">{t('auth.email')}</label>
              <input id="email" type="email" className="input" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
            </div>
            {error && <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 font-medium">{error}</div>}
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
              {loading ? t('auth.sending') : t('auth.sendLink')}
            </button>
          </form>
        </div>
        <p className="text-center mt-6 text-sm text-kidoria-muted">
          <Link to="/connexion" className="text-kidoria-rose font-bold hover:underline">← {t('auth.backToLogin')}</Link>
        </p>
      </div>
    </div>
  )
}
