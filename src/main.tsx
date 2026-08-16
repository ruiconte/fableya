import React from 'react'
import ReactDOM from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.tsx'
import './index.css'
import './i18n'
import i18n from './i18n'

const LANG_KEY = 'fableya_lang'
const SUPPORTED = ['fr', 'en', 'ja', 'es', 'de', 'it', 'pt']

const root = document.getElementById('root')!

async function detectAndRender() {
  if (!localStorage.getItem(LANG_KEY)) {
    try {
      const res = await fetch('/api/geo')
      if (res.ok) {
        const { lang } = await res.json()
        if (lang && SUPPORTED.includes(lang)) {
          i18n.changeLanguage(lang)
          localStorage.setItem(LANG_KEY, lang)
        }
      }
    } catch {
      // Silently fall back to browser language detection
    }
  }

  const app = (
    <React.StrictMode>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </React.StrictMode>
  )

  if (root.hasChildNodes()) {
    ReactDOM.hydrateRoot(root, app)
  } else {
    ReactDOM.createRoot(root).render(app)
  }
}

detectAndRender()
