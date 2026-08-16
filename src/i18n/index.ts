import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import fr from './locales/fr.json'
import en from './locales/en.json'
import ja from './locales/ja.json'
import es from './locales/es.json'
import de from './locales/de.json'
import it from './locales/it.json'
import pt from './locales/pt.json'

export const SUPPORTED_LANGUAGES = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', label: 'Português', flag: '🇵🇹' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
] as const

export type SiteLang = 'fr' | 'en' | 'ja' | 'es' | 'de' | 'it' | 'pt'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
      en: { translation: en },
      ja: { translation: ja },
      es: { translation: es },
      de: { translation: de },
      it: { translation: it },
      pt: { translation: pt },
    },
    fallbackLng: 'en',
    supportedLngs: ['fr', 'en', 'ja', 'es', 'de', 'it', 'pt'],

    detection: {
      // localStorage first (manual choice), then browser language
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'fableya_lang',
      caches: ['localStorage'],
    },

    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
