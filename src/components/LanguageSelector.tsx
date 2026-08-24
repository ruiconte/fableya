import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { SUPPORTED_LANGUAGES, type SiteLang } from '../i18n'

export function LanguageSelector() {
  const { i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const current = SUPPORTED_LANGUAGES.find(l => l.code === i18n.language)
    ?? SUPPORTED_LANGUAGES[1] // fallback to English

  const changeLanguage = (code: SiteLang) => {
    i18n.changeLanguage(code)
    localStorage.setItem('kidoria_lang', code)
    setOpen(false)
  }

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-sm font-semibold text-kidoria-muted hover:text-kidoria-text transition-colors px-2 py-1.5 rounded-lg hover:bg-kidoria-cream"
        aria-label="Change language"
        aria-expanded={open}
      >
        <span>{current.code.toUpperCase()}</span>
        <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-10 bg-white rounded-2xl shadow-soft border border-gray-100 py-1.5 min-w-[140px] z-50">
          {SUPPORTED_LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code as SiteLang)}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-kidoria-cream ${
                lang.code === i18n.language ? 'text-kidoria-text bg-kidoria-rose/10' : 'text-kidoria-muted'
              }`}
            >
              <span className="w-8 text-xs font-bold text-kidoria-muted">{lang.code.toUpperCase()}</span>
              <span>{lang.label}</span>
              {lang.code === i18n.language && <span className="ml-auto text-kidoria-rose">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
