import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation, Trans } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function Account() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [displayName, setDisplayName] = useState(user?.user_metadata?.display_name ?? '')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [profileLoading, setProfileLoading] = useState(false)
  const [pwdLoading, setPwdLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [pwdMsg, setPwdMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const confirmWord = t('account.deleteConfirmWord')

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileLoading(true)
    setProfileMsg(null)
    const { error } = await supabase.auth.updateUser({ data: { display_name: displayName } })
    setProfileMsg(error ? { type: 'error', text: error.message } : { type: 'success', text: t('account.profileSaved') })
    setProfileLoading(false)
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwdMsg(null)
    if (newPwd.length < 8) { setPwdMsg({ type: 'error', text: t('auth.passwordTooShort') }); return }
    if (newPwd !== confirmPwd) { setPwdMsg({ type: 'error', text: t('auth.passwordMismatch') }); return }
    setPwdLoading(true)
    const { error } = await supabase.auth.updateUser({ password: newPwd })
    if (error) { setPwdMsg({ type: 'error', text: error.message }); return }
    // Invalidate all other sessions after password change
    await supabase.auth.signOut({ scope: 'others' })
    setPwdMsg({ type: 'success', text: t('account.passwordUpdated') })
    if (!error) { setNewPwd(''); setConfirmPwd('') }
    setPwdLoading(false)
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== confirmWord) return
    setDeleteLoading(true)
    const { error } = await supabase.functions.invoke('delete-account')
    if (error) { setDeleteLoading(false); alert(t('account.deleteError') + error.message); return }
    await signOut()
    navigate('/')
  }

  const msgClass = (type: 'success' | 'error') =>
    type === 'success' ? 'bg-green-50 text-green-700 text-sm rounded-xl px-4 py-3 font-medium'
                       : 'bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 font-medium'

  return (
    <div className="page-container max-w-2xl">
      <h1 className="text-3xl font-black mb-8">{t('account.title')}</h1>

      <div className="card mb-6">
        <h2 className="font-black text-lg mb-4">{t('account.profileSection')}</h2>
        <div className="text-sm text-kidoria-muted mb-4">
          <span className="font-semibold">{t('account.emailLabel')}</span>{user?.email}
        </div>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="label" htmlFor="display_name">{t('account.displayName')}</label>
            <input id="display_name" type="text" className="input" placeholder={t('account.displayNamePlaceholder')}
              value={displayName} onChange={e => setDisplayName(e.target.value)} maxLength={50} />
          </div>
          {profileMsg && <div className={msgClass(profileMsg.type)}>{profileMsg.text}</div>}
          <button type="submit" disabled={profileLoading} className="btn-primary">
            {profileLoading ? t('account.saving') : t('account.save')}
          </button>
        </form>
      </div>

      <div className="card mb-6">
        <h2 className="font-black text-lg mb-4">{t('account.passwordSection')}</h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="label" htmlFor="new_pwd">{t('account.newPassword')}</label>
            <input id="new_pwd" type="password" className="input" placeholder={t('auth.passwordMin')}
              value={newPwd} onChange={e => setNewPwd(e.target.value)} autoComplete="new-password" />
          </div>
          <div>
            <label className="label" htmlFor="confirm_pwd">{t('account.confirmPassword')}</label>
            <input id="confirm_pwd" type="password" className="input" placeholder="••••••••"
              value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} autoComplete="new-password" />
          </div>
          {pwdMsg && <div className={msgClass(pwdMsg.type)}>{pwdMsg.text}</div>}
          <button type="submit" disabled={pwdLoading} className="btn-primary">
            {pwdLoading ? t('account.changingPassword') : t('account.changePassword')}
          </button>
        </form>
      </div>

      <div className="card mb-6">
        <h2 className="font-black text-lg mb-4">{t('account.logoutSection')}</h2>
        <button onClick={async () => { await signOut(); navigate('/') }} className="btn-secondary">
          {t('account.logout')}
        </button>
      </div>

      <div className="card border-2 border-red-100">
        <h2 className="font-black text-lg mb-2 text-red-600">{t('account.deleteSection')}</h2>
        <p className="text-kidoria-muted text-sm mb-4">{t('account.deleteWarning')}</p>
        {!showDeleteConfirm ? (
          <button onClick={() => setShowDeleteConfirm(true)} className="text-red-500 font-semibold text-sm hover:underline">
            {t('account.deleteLink')}
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-red-600">
              <Trans i18nKey="account.deleteConfirmPrompt" components={[<code key="0" className="bg-red-50 px-2 py-0.5 rounded" />]} />
            </p>
            <input type="text" className="input border-red-200 focus:border-red-400"
              value={deleteConfirmText} onChange={e => setDeleteConfirmText(e.target.value)}
              placeholder={confirmWord} />
            <div className="flex gap-3">
              <button onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== confirmWord || deleteLoading}
                className="bg-red-500 text-white font-bold px-5 py-2.5 rounded-xl disabled:opacity-40 hover:bg-red-600 transition-colors">
                {deleteLoading ? t('account.deleting') : t('account.deleteConfirmButton')}
              </button>
              <button onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText('') }} className="btn-secondary">
                {t('account.cancel')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
