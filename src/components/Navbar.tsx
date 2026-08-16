import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import { LanguageSelector } from './LanguageSelector'

export function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    setMenuOpen(false)
    navigate('/')
  }

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-kidoria-rose/20 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-black text-2xl text-kidoria-text shrink-0">
          <img src="/logo.png" alt="Fableya" className="w-14 h-14 object-contain rounded-2xl" style={{ mixBlendMode: 'multiply' }} />
          <span>Fableya</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-2">
          <LanguageSelector />

          {user ? (
            <>
              <Link to="/bibliotheque" className="text-kidoria-muted font-semibold hover:text-kidoria-text transition-colors px-3 py-2">
                {t('nav.myBooks')}
              </Link>
              <Link to="/creer" className="btn-primary text-sm px-5 py-2.5">
                {t('nav.createBook')}
              </Link>
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="w-9 h-9 rounded-full bg-kidoria-lavender flex items-center justify-center font-bold text-kidoria-text hover:brightness-95 transition-all"
                  aria-label={t('nav.myAccount')}
                >
                  {user.email?.[0].toUpperCase() ?? '?'}
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-12 bg-white rounded-2xl shadow-soft border border-gray-100 py-2 min-w-[180px] z-50">
                    <Link
                      to="/compte"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2.5 text-sm font-semibold hover:bg-kidoria-cream transition-colors"
                    >
                      {t('nav.myAccount')}
                    </Link>
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
                    >
                      {t('nav.logout')}
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/connexion" className="btn-secondary text-sm px-5 py-2.5">
                {t('nav.login')}
              </Link>
              <Link to="/creer" className="btn-primary text-sm px-5 py-2.5">
                {t('nav.createCTA')}
              </Link>
            </>
          )}
        </div>

        {/* Mobile: lang + hamburger */}
        <div className="sm:hidden flex items-center gap-2">
          <LanguageSelector />
          <button
            className="p-2 rounded-xl hover:bg-kidoria-cream transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <div className="w-6 flex flex-col gap-1.5">
              <span className={`block h-0.5 bg-kidoria-text rounded transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block h-0.5 bg-kidoria-text rounded transition-all ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 bg-kidoria-text rounded transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden bg-white border-t border-kidoria-rose/20 px-4 py-4 flex flex-col gap-3">
          {user ? (
            <>
              <Link to="/bibliotheque" onClick={() => setMenuOpen(false)} className="font-semibold py-2">{t('nav.myBooks')}</Link>
              <Link to="/creer" onClick={() => setMenuOpen(false)} className="btn-primary justify-center">{t('nav.createBook')}</Link>
              <Link to="/compte" onClick={() => setMenuOpen(false)} className="font-semibold py-2">{t('nav.myAccount')}</Link>
              <button onClick={handleSignOut} className="text-left font-semibold text-red-500 py-2">{t('nav.logout')}</button>
            </>
          ) : (
            <>
              <Link to="/connexion" onClick={() => setMenuOpen(false)} className="btn-secondary justify-center">{t('nav.login')}</Link>
              <Link to="/creer" onClick={() => setMenuOpen(false)} className="btn-primary justify-center">{t('nav.createCTA')}</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
