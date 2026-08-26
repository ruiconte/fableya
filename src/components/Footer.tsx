import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="bg-white border-t border-kidoria-sky mt-20" style={{ position: 'relative', zIndex: 1 }}>
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="sm:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <img src="/logo.png" alt="Fableya" className="w-8 h-8 object-contain" style={{ mixBlendMode: 'multiply' }} />
              <span className="font-display font-bold text-lg text-kidoria-text">Fableya</span>
            </Link>
            <p className="text-sm text-kidoria-muted leading-relaxed max-w-xs">{t('footer.tagline')}</p>
          </div>

          {/* Quick links */}
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-kidoria-muted mb-4">{t('footer.links')}</p>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/" className="text-kidoria-muted hover:text-kidoria-text transition-colors">{t('footer.home')}</Link></li>
              <li><Link to="/creer" className="text-kidoria-muted hover:text-kidoria-text transition-colors">{t('footer.create')}</Link></li>
              <li><Link to="/bibliotheque" className="text-kidoria-muted hover:text-kidoria-text transition-colors">{t('footer.library')}</Link></li>
              <li><Link to="/contact" className="text-kidoria-muted hover:text-kidoria-text transition-colors">{t('footer.contact')}</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-kidoria-muted mb-4">{t('footer.legal')}</p>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/cgu" className="text-kidoria-muted hover:text-kidoria-text transition-colors">{t('footer.cgu')}</Link></li>
              <li><Link to="/confidentialite" className="text-kidoria-muted hover:text-kidoria-text transition-colors">{t('footer.privacy')}</Link></li>
              <li><Link to="/mentions-legales" className="text-kidoria-muted hover:text-kidoria-text transition-colors">{t('footer.mentions')}</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-kidoria-sky flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-kidoria-muted">
          <span>© {new Date().getFullYear()} Fableya. {t('footer.rights')}</span>
          <span className="text-kidoria-sky">—</span>
        </div>
      </div>
    </footer>
  )
}
