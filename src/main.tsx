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

function browserLang(): string | null {
  const langs = navigator.languages ?? [navigator.language]
  for (const l of langs) {
    const code = l.split('-')[0].toLowerCase()
    if (SUPPORTED.includes(code)) return code
  }
  return null
}

async function detectAndRender() {
  if (!localStorage.getItem(LANG_KEY)) {
    // 1. Instant client-side detection (no network)
    const clientLang = browserLang()
    if (clientLang) {
      i18n.changeLanguage(clientLang)
      localStorage.setItem(LANG_KEY, clientLang)
    }
    // 2. Geo refinement in background (after render) — 2s timeout
    setTimeout(async () => {
      try {
        const controller = new AbortController()
        const timer = setTimeout(() => controller.abort(), 2000)
        const res = await fetch('/api/geo', { signal: controller.signal })
        clearTimeout(timer)
        if (res.ok) {
          const { lang } = await res.json()
          if (lang && SUPPORTED.includes(lang) && !localStorage.getItem(LANG_KEY)) {
            i18n.changeLanguage(lang)
            localStorage.setItem(LANG_KEY, lang)
          }
        }
      } catch { /* ignore */ }
    }, 0)
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
