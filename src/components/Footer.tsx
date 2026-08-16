import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="bg-white border-t border-kidoria-rose/20 mt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 font-black text-xl mb-3">
              <img src="/logo.png" alt="Fableya" className="w-14 h-14 object-contain rounded-2xl" style={{ mixBlendMode: 'multiply' }} />
              <span>Fableya</span>
            </div>
            <p className="text-sm text-kidoria-muted leading-relaxed">{t('footer.tagline')}</p>
          </div>

          <div>
            <h3 className="font-bold mb-3 text-kidoria-text">{t('footer.links')}</h3>
            <ul className="space-y-2 text-sm text-kidoria-muted">
              <li><Link to="/" className="hover:text-kidoria-text transition-colors">{t('footer.home')}</Link></li>
              <li><Link to="/creer" className="hover:text-kidoria-text transition-colors">{t('footer.create')}</Link></li>
              <li><Link to="/bibliotheque" className="hover:text-kidoria-text transition-colors">{t('footer.library')}</Link></li>
              <li><Link to="/contact" className="hover:text-kidoria-text transition-colors">{t('footer.contact')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-3 text-kidoria-text">{t('footer.legal')}</h3>
            <ul className="space-y-2 text-sm text-kidoria-muted">
              <li><Link to="/cgu" className="hover:text-kidoria-text transition-colors">{t('footer.cgu')}</Link></li>
              <li><Link to="/confidentialite" className="hover:text-kidoria-text transition-colors">{t('footer.privacy')}</Link></li>
              <li><Link to="/mentions-legales" className="hover:text-kidoria-text transition-colors">{t('footer.mentions')}</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center text-sm text-kidoria-muted">
          © {new Date().getFullYear()} Fableya. {t('footer.rights')}
        </div>
      </div>
    </footer>
  )
}
