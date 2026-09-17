import { database } from './db.mjs';
import { articleBody, escapeHtml as e, copy } from './content.mjs';

const SITE = 'https://fableya.com';
const css = `*{box-sizing:border-box}body{margin:0;background:#fffaf6;color:#302b35;font:18px/1.75 system-ui,sans-serif}header,main,footer{max-width:820px;margin:auto;padding:28px 24px}header{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #eadfda}header strong{font-size:25px}a{color:#92556b;text-underline-offset:4px}h1{font-size:clamp(32px,6vw,50px);line-height:1.18;letter-spacing:-1px}h2{font-size:29px;line-height:1.3;margin-top:48px}h3{font-size:21px}.lead{font-size:22px}.disclosure,small,.meta{font-size:14px;color:#6f6370}.disclosure{background:#f3e9e5;padding:16px;border-radius:12px}section{overflow-wrap:anywhere}.cta{display:inline-block;border-radius:30px;background:#92556b;color:white;padding:12px 24px;text-decoration:none;margin:24px 0}.card{padding:24px 0;border-bottom:1px solid #eadfda}.card h2{margin:0;font-size:25px}footer{border-top:1px solid #eadfda;font-size:14px}.citations{font-size:14px}nav{display:flex;gap:16px;flex-wrap:wrap}input,button{font:inherit}li{margin:8px 0}`;
export function shell({title,description,canonical,language='fr',body,jsonLd}) {
  const t=copy[language]??copy.fr;
  const json = jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd).replaceAll('<','\\u003c')}</script>` : '';
  return `<!doctype html><html lang="${e(language)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${e(title)} | Fableya</title><meta name="description" content="${e(description)}"><link rel="canonical" href="${e(canonical)}"><meta property="og:title" content="${e(title)}"><meta property="og:description" content="${e(description)}"><meta property="og:url" content="${e(canonical)}"><meta property="og:type" content="article"><style>${css}</style>${json}</head><body><header><a href="/" aria-label="Fableya"><strong>Fableya</strong></a><nav><a href="/">${t.home}</a><a href="/blog?lang=${e(language)}">${t.blog}</a></nav></header><main>${body}</main><footer><a href="/contact">Contact</a> · <a href="/mentions-legales">Mentions légales</a> · <a href="/confidentialite">Confidentialité</a></footer></body></html>`;
}
export function renderArticle(post) {
  const d=post.document,t=copy[post.language],url=`${SITE}/blog/${post.slug}`;
  return shell({title:d.title,description:d.description,canonical:url,language:post.language,
    jsonLd:{'@context':'https://schema.org','@type':'Article',headline:d.title,description:d.description,inLanguage:post.language,
      datePublished:post.published_at,dateModified:post.updated_at,mainEntityOfPage:url,author:{'@type':'Organization',name:'Fableya',url:SITE},publisher:{'@type':'Organization',name:'Fableya',url:SITE}},
    body:`<article><h1>${e(d.title)}</h1><p class="meta">${t.updated} <time datetime="${e(post.updated_at)}">${e(post.updated_at.slice(0,10))}</time> · Fableya</p>${articleBody(d,post.language)}<a class="cta" href="/creer?utm_source=blog&amp;utm_medium=editorial&amp;utm_campaign=${e(post.slug)}">${t.cta}</a></article>`,
  });
}

export function publicHandler(dbFactory = () => database(process.env,fetch,true)) {
  return async (req,res) => {
    if(!['GET','HEAD'].includes(req.method)) return res.status(405).end();
    try {
      const db=dbFactory();
      const slug=typeof req.query.slug==='string'?req.query.slug:'';
      res.setHeader('Content-Type','text/html; charset=utf-8');
      res.setHeader('Cache-Control','public, max-age=0, s-maxage=60');
      if(req.query.format==='sitemap') {
        const posts=[];
        for(let offset=0;offset<50000;offset+=1000) {
          const page=await db.get(`blog_posts?select=slug,updated_at&order=slug&limit=1000&offset=${offset}`);
          posts.push(...page);if(page.length<1000) break;
        }
        res.setHeader('Content-Type','application/xml; charset=utf-8');
        return res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${SITE}/blog</loc></url>${posts.map(p=>`<url><loc>${SITE}/blog/${e(p.slug)}</loc><lastmod>${e(p.updated_at)}</lastmod></url>`).join('')}</urlset>`);
      }
      if(slug) {
        if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length>120) return res.status(404).send('Article introuvable');
        const [post]=await db.get(`blog_posts?slug=eq.${encodeURIComponent(slug)}`);
        if(!post) {res.setHeader('X-Robots-Tag','noindex');return res.status(404).send('Article introuvable');}
        return res.status(200).send(renderArticle(post));
      }
      const lang=Object.hasOwn(copy,req.query.lang)?req.query.lang:'fr',t=copy[lang];
      const page=Math.max(1,Math.min(2000,Math.trunc(Number(req.query.page)||1)));
      const posts=await db.get(`blog_posts?language=eq.${lang}&select=slug,document->>title,document->>description,updated_at&order=published_at.desc,id&limit=13&offset=${(page-1)*12}`);
      const suffix=`?lang=${lang}${page>1?`&page=${page}`:''}`;
      return res.status(200).send(shell({title:t.blog,description:t.intro,canonical:`${SITE}/blog${suffix}`,language:lang,
        body:`<h1>${t.blog}</h1><p class="lead">${t.intro}</p><nav><a href="/blog?lang=fr">Français</a><a href="/blog?lang=en">English</a><a href="/blog?lang=ja">日本語</a></nav>`+
          (posts.length?posts.slice(0,12).map(p=>`<article class="card"><h2><a href="/blog/${e(p.slug)}">${e(p.title)}</a></h2><p>${e(p.description)}</p></article>`).join(''):`<p>${t.empty}</p>`)+
          `<nav>${page>1?`<a rel="prev" href="/blog?lang=${lang}&amp;page=${page-1}">←</a>`:''}${posts.length>12?`<a rel="next" href="/blog?lang=${lang}&amp;page=${page+1}">→</a>`:''}</nav>`,
      }));
    } catch {
      res.setHeader('Cache-Control','no-store');res.setHeader('Retry-After','300');
      return res.status(503).send('Le journal est temporairement indisponible. Réessayez plus tard.');
    }
  };
}
