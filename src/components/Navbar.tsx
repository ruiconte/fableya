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
    <nav className="bg-white border-b border-kidoria-sky sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <img
            src="/logo.png"
            alt="Fableya"
            className="w-8 h-8 object-contain"
            style={{ mixBlendMode: 'multiply' }}
          />
          <span className="font-display font-bold text-lg text-kidoria-text tracking-tight">Fableya</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-1">
          <LanguageSelector />

          {user ? (
            <>
              <Link
                to="/bibliotheque"
                className="text-kidoria-muted font-medium hover:text-kidoria-text transition-colors px-4 py-2 rounded-lg hover:bg-kidoria-lavender text-sm"
              >
                {t('nav.myBooks')}
              </Link>
              <Link to="/creer" className="btn-primary text-sm px-5 py-2 ml-1">
                {t('nav.createBook')}
              </Link>
              <div className="relative ml-1">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="w-8 h-8 rounded-full bg-kidoria-lavender flex items-center justify-center font-semibold text-kidoria-text text-sm hover:bg-kidoria-sky transition-colors"
                  aria-label={t('nav.myAccount')}
                >
                  {user.email?.[0].toUpperCase() ?? '?'}
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-11 bg-white rounded-xl border border-kidoria-sky shadow-soft py-1 min-w-[176px] z-50">
                    <Link
                      to="/compte"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2.5 text-sm font-medium hover:bg-kidoria-lavender transition-colors"
                    >
                      {t('nav.myAccount')}
                    </Link>
                    <div className="h-px bg-kidoria-sky mx-3 my-1" />
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                    >
                      {t('nav.logout')}
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/connexion" className="btn-secondary text-sm px-5 py-2">
                {t('nav.login')}
              </Link>
              <Link to="/creer" className="btn-primary text-sm px-5 py-2 ml-1">
                {t('nav.createCTA')}
              </Link>
            </>
          )}
        </div>

        {/* Mobile: lang + hamburger */}
        <div className="sm:hidden flex items-center gap-2">
          <LanguageSelector />
          <button
            className="p-2 rounded-lg hover:bg-kidoria-lavender transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <div className="w-5 flex flex-col gap-[5px]">
              <span className={`block h-[1.5px] bg-kidoria-text rounded-full transition-all ${menuOpen ? 'rotate-45 translate-y-[6.5px]' : ''}`} />
              <span className={`block h-[1.5px] bg-kidoria-text rounded-full transition-all ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-[1.5px] bg-kidoria-text rounded-full transition-all ${menuOpen ? '-rotate-45 -translate-y-[6.5px]' : ''}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden bg-white border-t border-kidoria-sky px-6 py-5 flex flex-col gap-3">
          {user ? (
            <>
              <Link to="/bibliotheque" onClick={() => setMenuOpen(false)} className="font-medium py-2 text-sm">{t('nav.myBooks')}</Link>
              <Link to="/creer" onClick={() => setMenuOpen(false)} className="btn-primary justify-center text-sm">{t('nav.createBook')}</Link>
              <Link to="/compte" onClick={() => setMenuOpen(false)} className="font-medium py-2 text-sm">{t('nav.myAccount')}</Link>
              <button onClick={handleSignOut} className="text-left font-medium text-red-500 py-2 text-sm">{t('nav.logout')}</button>
            </>
          ) : (
            <>
              <Link to="/connexion" onClick={() => setMenuOpen(false)} className="btn-secondary justify-center text-sm">{t('nav.login')}</Link>
              <Link to="/creer" onClick={() => setMenuOpen(false)} className="btn-primary justify-center text-sm">{t('nav.createCTA')}</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
