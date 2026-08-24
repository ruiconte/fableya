import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '../lib/supabase'

const BOOK_SLOTS = [
  { x: 0,  y: 3,  rotate: -14, size: 'lg', anchor: 'left'  },
  { x: 1,  y: 38, rotate: -5,  size: 'md', anchor: 'left'  },
  { x: 0,  y: 68, rotate: 11,  size: 'sm', anchor: 'left'  },
  { x: 0,  y: 5,  rotate: 13,  size: 'lg', anchor: 'right' },
  { x: 1,  y: 40, rotate: -8,  size: 'md', anchor: 'right' },
  { x: 0,  y: 67, rotate: -12, size: 'sm', anchor: 'right' },
] as const

const SIZE = { lg: 200, md: 168, sm: 138 } as const

const STARS = [
  { top: 12, left: 21,  color: '#E8834A', size: 26 },
  { top: 7,  left: 38,  color: '#7B9EA8', size: 18 },
  { top: 20, right: 26, color: '#D4829A', size: 22 },
  { top: 9,  right: 17, color: '#E8834A', size: 16 },
  { top: 50, left: 18,  color: '#D4829A', size: 20 },
  { top: 58, right: 19, color: '#7B9EA8', size: 24 },
  { top: 75, left: 24,  color: '#E8834A', size: 14 },
  { top: 77, right: 24, color: '#D4829A', size: 18 },
  { top: 30, left: 14,  color: '#F0C060', size: 16 },
  { top: 40, right: 15, color: '#F0C060', size: 20 },
]

const QUERIES = [
  'children fairy tale illustration',
  'watercolor children book illustration',
  'vintage fairy tale illustration children',
  'children adventure storybook illustration',
  'nature animals children illustration',
  'enchanted forest magic children illustration',
]

const COLORS: [string, string][] = [
  ['#C4A882', '#8B6B4A'],
  ['#8BB0C8', '#5C7A92'],
  ['#C89EAE', '#9B6878'],
  ['#A0C89A', '#6B9B68'],
  ['#C8BA82', '#9B8B4A'],
  ['#B09AC8', '#7B6B9B'],
]

async function fetchOpenverseImages(): Promise<string[]> {
  const results = await Promise.allSettled(
    QUERIES.map(async (q, i) => {
      await new Promise(r => setTimeout(r, i * 80))
      const url = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(q)}&source=rawpixel&page_size=8&license_type=commercial`
      const res = await fetch(url, { headers: { Accept: 'application/json' } })
      if (!res.ok) return null
      const data = await res.json()
      const imgs = (data.results || []).filter((img: { url?: string }) => img.url)
      if (!imgs.length) return null
      return imgs[Math.floor(Math.random() * Math.min(imgs.length, 4))].url as string
    })
  )
  return results
    .filter(r => r.status === 'fulfilled' && r.value)
    .map(r => (r as PromiseFulfilledResult<string | null>).value as string)
    .filter(Boolean)
}

async function fetchCovers(): Promise<string[]> {
  // 1. Real Fableya covers from Supabase
  try {
    const { data } = await supabase
      .from('books').select('cover_url')
      .not('cover_url', 'is', null)
      .order('created_at', { ascending: false }).limit(12)
    if (data && data.length >= 4) {
      return data.map((b: { cover_url: string }) => b.cover_url)
        .filter(Boolean).sort(() => Math.random() - 0.5).slice(0, 6)
    }
  } catch { /* ignore */ }

  // 2. Openverse/rawpixel illustrations
  return fetchOpenverseImages()
}

function Star({ s }: { s: typeof STARS[number] }) {
  const ro = s.size / 2, ri = s.size / 4
  const pts = Array.from({ length: 5 }, (_, i) => {
    const a = (Math.PI * 2 * i) / 5 - Math.PI / 2, b = a + Math.PI / 5
    return [Math.cos(a)*ro+ro, Math.sin(a)*ro+ro, Math.cos(b)*ri+ro, Math.sin(b)*ri+ro]
  })
  const d = pts.map(([ox,oy,ix,iy], i) => `${i===0?'M':'L'}${ox},${oy} L${ix},${iy}`).join(' ') + ' Z'
  const pos: React.CSSProperties = { position: 'fixed', top: `${s.top}%`, zIndex: 0 }
  if ('left' in s) pos.left = `${(s as {left:number}).left}%`
  else pos.right = `${(s as {right:number}).right}%`
  return (
    <div style={pos}>
      <svg width={s.size} height={s.size} viewBox={`0 0 ${s.size} ${s.size}`}><path d={d} fill={s.color}/></svg>
    </div>
  )
}

function Book({ slot, idx, src }: { slot: typeof BOOK_SLOTS[number]; idx: number; src?: string }) {
  const [hov, setHov] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [err, setErr] = useState(false)
  const w = SIZE[slot.size], h = Math.round(w * 1.4)
  const [light, dark] = COLORS[idx]

  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
      position: 'fixed',
      top: `${slot.y}%`,
      ...(slot.anchor === 'left' ? { left: `${slot.x}%` } : { right: `${slot.x}%` }),
      width: w,
      zIndex: 0,
      transform: `rotate(${slot.rotate}deg)${hov ? ' scale(1.06) translateY(-6px)' : ''}`,
      transition: 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)',
      pointerEvents: 'auto',
      cursor: 'default',
    }}>
      <div style={{
        borderRadius: 10, overflow: 'hidden', position: 'relative', width: w, height: h,
        background: `linear-gradient(135deg, ${light}, ${dark})`,
        boxShadow: hov
          ? '0 20px 48px rgba(0,0,0,0.28), 0 4px 12px rgba(0,0,0,0.14)'
          : '0 8px 28px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.09)',
        transition: 'box-shadow 0.4s ease',
      }}>
        <div style={{
          position:'absolute', top:0, bottom:0,
          [slot.anchor==='left'?'left':'right']: 0,
          width:14,
          background:'linear-gradient(to right, rgba(0,0,0,0.24), rgba(0,0,0,0.04))',
          zIndex:1,
        }}/>
        {src && (
          <img src={src} alt="" loading="eager" decoding="async"
            style={{
              position:'absolute', inset:0, width:w, height:h, objectFit:'cover',
              opacity: loaded && !err ? 1 : 0, transition:'opacity 0.8s ease',
            }}
            onLoad={() => setLoaded(true)} onError={() => setErr(true)}
          />
        )}
      </div>
    </div>
  )
}

export function BookShowcase() {
  const [images, setImages] = useState<string[]>([])

  useEffect(() => {
    fetchCovers().then(imgs => { if (imgs.length) setImages(imgs) })
  }, [])

  return createPortal(
    <div aria-hidden="true" style={{ pointerEvents: 'none' }}>
      {STARS.map((s, i) => <Star key={i} s={s} />)}
      {BOOK_SLOTS.map((slot, i) => <Book key={i} slot={slot} idx={i} src={images[i]} />)}
    </div>,
    document.body
  )
}
