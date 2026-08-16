import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export function Contact() {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    window.location.href = `mailto:contact@kidoria.com?subject=Message de ${encodeURIComponent(name)}&body=${encodeURIComponent(message)}%0A%0A-- ${encodeURIComponent(name)} (${encodeURIComponent(email)})`
    setSent(true)
  }

  if (sent) {
    return (
      <div className="page-container max-w-xl text-center">
        <div className="text-5xl mb-4">📨</div>
        <h1 className="text-2xl font-black mb-3">{t('legal.sentTitle')}</h1>
        <p className="text-kidoria-muted">{t('legal.sentSub')}</p>
      </div>
    )
  }

  return (
    <div className="page-container max-w-xl">
      <div className="text-center mb-8">
        <div className="text-4xl mb-3">💌</div>
        <h1 className="text-3xl font-black mb-2">{t('legal.contactTitle')}</h1>
        <p className="text-kidoria-muted">{t('legal.contactSub')}</p>
      </div>
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label" htmlFor="name">{t('legal.name')}</label>
            <input id="name" type="text" className="input" placeholder={t('legal.namePlaceholder')}
              value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div>
            <label className="label" htmlFor="email">{t('auth.email')}</label>
            <input id="email" type="email" className="input" placeholder={t('legal.emailPlaceholder')}
              value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="label" htmlFor="message">{t('legal.message')}</label>
            <textarea id="message" className="input resize-none" rows={5}
              placeholder={t('legal.messagePlaceholder')}
              value={message} onChange={e => setMessage(e.target.value)} required />
          </div>
          <button type="submit" className="btn-primary w-full justify-center">{t('legal.send')}</button>
        </form>
        <div className="mt-6 pt-6 border-t border-gray-100 text-center text-sm text-kidoria-muted">
          {t('legal.directContact')}{' '}
          <a href="mailto:contact@kidoria.com" className="text-kidoria-rose font-semibold">contact@kidoria.com</a>
        </div>
      </div>
    </div>
  )
}
