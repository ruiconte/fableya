import type { VercelRequest, VercelResponse } from '@vercel/node'

const COUNTRY_TO_LANG: Record<string, string> = {
  // Français
  FR: 'fr', BE: 'fr', CH: 'fr', MC: 'fr', LU: 'fr', SN: 'fr', CI: 'fr',
  MA: 'fr', TN: 'fr', DZ: 'fr', CM: 'fr', MG: 'fr', CD: 'fr', CG: 'fr',
  // Japonais
  JP: 'ja',
  // Espagnol
  ES: 'es', MX: 'es', AR: 'es', CO: 'es', CL: 'es', PE: 'es', VE: 'es',
  EC: 'es', BO: 'es', PY: 'es', UY: 'es', GT: 'es', HN: 'es', SV: 'es',
  NI: 'es', CR: 'es', PA: 'es', DO: 'es', CU: 'es', PR: 'es',
  // Allemand
  DE: 'de', AT: 'de', LI: 'de',
  // Italien
  IT: 'it', SM: 'it', VA: 'it',
  // Portugais
  PT: 'pt', BR: 'pt', AO: 'pt', MZ: 'pt', CV: 'pt',
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  const country = (req.headers['x-vercel-ip-country'] as string) ?? ''
  const lang = COUNTRY_TO_LANG[country.toUpperCase()] ?? 'en'
  res.setHeader('Cache-Control', 'no-store')
  res.json({ country, lang })
}
