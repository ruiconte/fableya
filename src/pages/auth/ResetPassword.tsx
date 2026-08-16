import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'

export function ResetPassword() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < 8) { setError(t('auth.passwordTooShort')); return }
    if (password !== confirm) { setError(t('auth.passwordMismatch')); return }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setError(error.message); setLoading(false) }
    else navigate('/connexion', { replace: true })
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl">🔐</div>
          <h1 className="text-3xl font-black mt-4 mb-2">{t('auth.resetTitle')}</h1>
          <p className="text-kidoria-muted">{t('auth.resetSub')}</p>
        </div>
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="password">{t('auth.newPassword')}</label>
              <input id="password" type="password" className="input" placeholder={t('auth.passwordMin')}
                value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" />
            </div>
            <div>
              <label className="label" htmlFor="confirm">{t('auth.confirm')}</label>
              <input id="confirm" type="password" className="input" placeholder="••••••••"
                value={confirm} onChange={e => setConfirm(e.target.value)} required autoComplete="new-password" />
            </div>
            {error && <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 font-medium">{error}</div>}
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
              {loading ? t('auth.updating') : t('auth.updatePassword')}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
