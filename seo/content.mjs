const string = { type: 'string' };
const strings = { type: 'array', items: string };
const object = (properties) => ({ type: 'object', properties, required: Object.keys(properties), additionalProperties: false });
export const articleSchema = object({
  title: string, slug: string, description: string, introduction: string,
  sections: { type: 'array', items: object({ heading: string, paragraphs: strings, source_ids: { type: 'array', items: { type: 'integer' } } }) },
  faq: { type: 'array', items: object({ question: string, answer: string }) },
  related_paths: strings,
});
export const reviewSchema = object({ issues: strings, unsupported_claims: strings, useful_to_reader: { type: 'boolean' } });
export const planSchema = object({ topic: string, rationale: string });
export const INTERNAL_PATHS = ['/', '/apercu', '/livre-prenom-enfant', '/cadeau-naissance', '/cadeau-anniversaire-enfant', '/idee-cadeau-noel-enfant', '/generateur-histoire-enfant-ia'];
export const LANGUAGES = ['fr', 'en', 'ja'];

export function safeUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === 'https:' && !u.username && !u.password && u.hostname.includes('.') &&
      !/^(localhost|127\.|10\.|192\.168\.|169\.254\.)/i.test(u.hostname) && !u.hostname.endsWith('.local');
  } catch { return false; }
}
export function textOnly(value) {
  return typeof value === 'string' && !/<\/?[a-z][^>]*>/i.test(value) && !/[\u0000-\u0008]/.test(value);
}
export function normalized(value) { return value.toLocaleLowerCase().normalize('NFKD').replace(/\p{M}/gu, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim(); }
export function similar(a, b) {
  const x = normalized(a), y = normalized(b);
  if (x === y) return true;
  const tokens = (s) => new Set(s.split(' ').filter(t => t.length > 2));
  const A = tokens(x), B = tokens(y);
  if (!A.size || !B.size) return false;
  return [...A].filter(t => B.has(t)).length / new Set([...A, ...B]).size >= 0.72;
}

export function validateDocument(d, language = 'fr') {
  const errors = [];
  if (!d || typeof d !== 'object') return { errors: ['Document manquant'], warnings: [] };
  for (const field of ['title','slug','description','introduction']) {
    if (!textOnly(d[field]) || !d[field].trim()) errors.push(`Champ invalide : ${field}`);
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(d.slug ?? '') || d.slug?.length > 120) errors.push('Slug invalide');
  if (d.title?.length > 150 || d.description?.length > 300) errors.push('Titre ou description trop longs');
  if (!Array.isArray(d.sources) || d.sources.length < 2 || d.sources.length > 20) errors.push('Deux à vingt sources vérifiables sont nécessaires');
  const sources = Array.isArray(d.sources) ? d.sources : [];
  if (sources.some((s,i) => !s || s.id !== i+1 || !safeUrl(s.url) || !textOnly(s.title) || !Number.isFinite(Date.parse(s.checked_at)))) errors.push('Source invalide');
  if (!Array.isArray(d.sections) || d.sections.length < 3 || d.sections.length > 20) errors.push('Trois à vingt sections sont nécessaires');
  const sections = Array.isArray(d.sections) ? d.sections : [];
  for (const s of sections) {
    if (!s || !textOnly(s.heading) || !s.heading.trim() || !Array.isArray(s.paragraphs) || !s.paragraphs.length || s.paragraphs.some(p => !textOnly(p) || !p.trim())) errors.push('Section invalide');
    if (!Array.isArray(s?.source_ids) || s.source_ids.some(id => !Number.isInteger(id) || id < 1 || id > sources.length)) errors.push('Référence de source inconnue');
  }
  if (!sections.some(s => s?.source_ids?.length)) errors.push('Aucune citation dans le corps du texte');
  if (!Array.isArray(d.faq) || d.faq.length < 2 || d.faq.length > 8 || d.faq.some(f => !f || !textOnly(f.question) || !textOnly(f.answer) || !f.question.trim() || !f.answer.trim())) errors.push('FAQ invalide');
  if (!Array.isArray(d.related_paths) || d.related_paths.length < 1 || d.related_paths.some(p => !INTERNAL_PATHS.includes(p))) errors.push('Liens internes non autorisés');
  const body = [d.introduction, ...sections.flatMap(s => s?.paragraphs ?? [])].join(' ');
  const length = language === 'ja' ? body.length : body.split(/\s+/).length;
  if (length < (language === 'ja' ? 1000 : 450)) errors.push('Contenu trop court pour ce format éditorial');
  if (/SOURCE À VÉRIFIER|\[TODO\]|lorem ipsum/i.test(body)) errors.push('Texte provisoire restant');
  if (JSON.stringify(d).length > 100_000) errors.push('Document trop volumineux');
  const warnings = [];
  if ((d.description?.length ?? 0) < 80) warnings.push('Description courte');
  return { errors: [...new Set(errors)], warnings };
}

// Gemini response format: response.candidates[0].content.parts[].text
// Grounding sources: response.candidates[0].groundingMetadata.groundingChunks[].web
export function sourcesFromResponse(response, checked = new Date().toISOString()) {
  const unique = new Map();
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
  for (const chunk of chunks) {
    const { uri, title } = chunk.web ?? {};
    if (uri && safeUrl(uri)) unique.set(uri, title || uri);
  }
  return [...unique].slice(0, 20).map(([url, title], i) => ({ id: i + 1, url, title, checked_at: checked }));
}
export function outputText(response) {
  const candidate = response.candidates?.[0];
  if (!candidate) throw new Error('Réponse IA incomplète : aucun article enregistré');
  const text = (candidate.content?.parts ?? []).map(p => p.text ?? '').join('\n');
  if (!text) throw new Error('Réponse IA vide ou refusée');
  return text;
}

export function escapeHtml(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c])); }
export const copy = {
  fr: { blog:'Le journal Fableya', home:'Accueil', intro:'Des idées et des guides pour imaginer des histoires avec les enfants.', disclosure:'Cet article est publié par Fableya, qui propose son propre service de livres personnalisés. Il a été préparé avec une assistance IA et relu avant publication.', sources:'Sources consultées', faq:'Questions fréquentes', related:'Pour aller plus loin', cta:'Créer mon livre', empty:'Les premiers articles arrivent bientôt.', updated:'Mis à jour le' },
  en: { blog:'The Fableya journal', home:'Home', intro:'Ideas and guides for creating stories with children.', disclosure:'Published by Fableya, which offers its own personalized book service. Prepared with AI assistance and reviewed before publication.', sources:'Sources consulted', faq:'Frequently asked questions', related:'Explore more', cta:'Create my book', empty:'The first articles are coming soon.', updated:'Updated on' },
  ja: { blog:'Fableyaの読みもの', home:'ホーム', intro:'子どもと物語を楽しむためのアイデアとガイド。', disclosure:'この記事はオリジナル絵本サービスを提供するFableyaが発行しています。AIを活用して作成し、公開前に確認しています。', sources:'参照元', faq:'よくある質問', related:'関連ページ', cta:'絵本を作る', empty:'記事を準備中です。', updated:'更新日' },
};
export function articleBody(d, language = 'fr') {
  const e = escapeHtml, t = copy[language] ?? copy.fr;
  return `<p class="disclosure">${e(t.disclosure)}</p><p class="lead">${e(d.introduction)}</p>` +
    d.sections.map(s => `<section><h2>${e(s.heading)}</h2>${s.paragraphs.map(p=>`<p>${e(p)}</p>`).join('')}<p class="citations">${s.source_ids.map(id=>`<a href="#source-${id}">[${id}]</a>`).join(' ')}</p></section>`).join('') +
    `<section><h2>${e(t.faq)}</h2>${d.faq.map(f=>`<h3>${e(f.question)}</h3><p>${e(f.answer)}</p>`).join('')}</section>` +
    `<section><h2>${e(t.sources)}</h2><ol>${d.sources.map(s=>`<li id="source-${s.id}"><a href="${e(safeUrl(s.url)?s.url:'#')}" rel="noopener noreferrer">${e(s.title)}</a> <small>(${e(s.checked_at.slice(0,10))})</small></li>`).join('')}</ol></section>` +
    `<section><h2>${e(t.related)}</h2><ul>${d.related_paths.filter(p=>INTERNAL_PATHS.includes(p)).map(p=>`<li><a href="${e(p)}">${e(p==='/'?'Fableya':p.slice(1).replaceAll('-',' '))}</a></li>`).join('')}</ul></section>`;
}

export function markdown(d, canonical, language = 'fr') {
  // Markdown is an export, never sent to a platform automatically.
  const text = (v) => String(v).replace(/[\\`*_{}\[\]<>]/g,'\\$&');
  return `# ${text(d.title)}\n\n${copy[language].disclosure}\n\n${text(d.introduction)}\n\n` +
    d.sections.map(s=>`## ${text(s.heading)}\n\n${s.paragraphs.map(text).join('\n\n')}\n\n${s.source_ids.map(id=>`[${id}]`).join(' ')}`).join('\n\n') +
    `\n\n## ${copy[language].faq}\n\n` + d.faq.map(f=>`### ${text(f.question)}\n\n${text(f.answer)}`).join('\n\n') +
    `\n\n## ${copy[language].sources}\n\n` + d.sources.map(s=>`${s.id}. [${text(s.title)}](${encodeURI(s.url).replaceAll(')','%29')})`).join('\n') + `\n\nOriginal : ${canonical}\n`;
}
