import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation, Trans } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import { PageSEO } from '../../components/PageSEO'

export function Register() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < 8) { setError(t('auth.passwordTooShort')); return }
    if (password !== confirm) { setError(t('auth.passwordMismatch')); return }

    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/bibliotheque` },
    })
    if (error) { setError(error.message); setLoading(false) }
    else setSuccess(true)
  }

  const handleGoogle = async () => {
    setGoogleLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  if (success) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center card">
          <div className="w-12 h-12 mb-4 mx-auto rounded-full bg-kidoria-rose/10 flex items-center justify-center">
            <svg className="w-6 h-6 text-kidoria-rose" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          </div>
          <h1 className="text-2xl font-black mb-3">{t('auth.confirmEmailTitle')}</h1>
          <p className="text-kidoria-muted leading-relaxed">
            <Trans i18nKey="auth.confirmEmailSub" values={{ email }} components={[<strong key="0" />]} />
          </p>
          <Link to="/connexion" className="btn-secondary mt-6 inline-flex">{t('auth.backToLogin')}</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <PageSEO title="Créer un compte" description="Créez votre compte Fableya gratuitement et commencez à créer des livres personnalisés pour votre enfant." canonical="/inscription" />
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="font-display font-bold text-xl text-kidoria-text">Fableya</Link>
          <h1 className="text-3xl font-black mt-4 mb-2">{t('auth.createTitle')}</h1>
          <p className="text-kidoria-muted">{t('auth.createSub')}</p>
        </div>

        <div className="card">
          <button onClick={handleGoogle} disabled={googleLoading} className="btn-secondary w-full justify-center mb-6 gap-3">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {googleLoading ? t('common.redirecting') : t('auth.continueGoogle')}
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-sm text-kidoria-muted font-medium">{t('auth.or')}</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="label" htmlFor="email">{t('auth.email')}</label>
              <input id="email" type="email" className="input" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
            </div>
            <div>
              <label className="label" htmlFor="password">{t('auth.password')}</label>
              <input id="password" type="password" className="input" placeholder={t('auth.passwordMin')}
                value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" />
            </div>
            <div>
              <label className="label" htmlFor="confirm">{t('auth.confirmPassword')}</label>
              <input id="confirm" type="password" className="input" placeholder="••••••••"
                value={confirm} onChange={e => setConfirm(e.target.value)} required autoComplete="new-password" />
            </div>
            {error && <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 font-medium">{error}</div>}
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-2">
              {loading ? t('auth.creating') : t('auth.createTitle')}
            </button>
          </form>

          <p className="text-xs text-kidoria-muted text-center mt-4 leading-relaxed">
            <Trans
              i18nKey="auth.agreeTerms"
              components={[
                <Link key="0" to="/cgu" className="underline" />,
                <span key="1" />,
                <Link key="2" to="/confidentialite" className="underline" />,
              ]}
            />
          </p>
        </div>

        <p className="text-center mt-6 text-sm text-kidoria-muted">
          {t('auth.alreadyAccount')}{' '}
          <Link to="/connexion" className="text-kidoria-rose font-bold hover:underline">{t('auth.login2')}</Link>
        </p>
      </div>
    </div>
  )
}
