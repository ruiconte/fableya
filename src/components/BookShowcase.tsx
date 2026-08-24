import { useEffect, useState } from 'react'

// Positions of books around the form — mirrors the reference design
const BOOK_SLOTS = [
  // Left side
  { side: 'left', top: '4%',  left: '0%',   rotate: -14, size: 'lg' },
  { side: 'left', top: '36%', left: '1%',   rotate: -6,  size: 'md' },
  { side: 'left', top: '68%', left: '0%',   rotate: 12,  size: 'sm' },
  // Right side
  { side: 'right', top: '6%',  right: '0%', rotate: 10,  size: 'lg' },
  { side: 'right', top: '38%', right: '1%', rotate: -7,  size: 'md' },
  { side: 'right', top: '66%', right: '0%', rotate: -12, size: 'sm' },
] as const

const SIZE = { lg: 200, md: 168, sm: 138 } as const

// Scattered stars — positions, colors, sizes
const STARS = [
  { top: '14%', left: '22%',  color: '#E8834A', size: 26 },
  { top: '8%',  left: '38%',  color: '#7B9EA8', size: 18 },
  { top: '22%', right: '28%', color: '#D4829A', size: 22 },
  { top: '10%', right: '18%', color: '#E8834A', size: 16 },
  { top: '52%', left: '18%',  color: '#D4829A', size: 20 },
  { top: '60%', right: '20%', color: '#7B9EA8', size: 24 },
  { top: '78%', left: '26%',  color: '#E8834A', size: 14 },
  { top: '80%', right: '26%', color: '#D4829A', size: 18 },
  { top: '32%', left: '14%',  color: '#F0C060', size: 16 },
  { top: '42%', right: '16%', color: '#F0C060', size: 20 },
]

// Queries designed to produce illustrated, colorful, children's-book-feeling images
const QUERIES = [
  'watercolor children fairy tale illustration',
  'colorful fantasy children book illustration',
  'adventure storybook children illustration',
  'magical picture book children illustration',
  'nature animals children book illustration',
  'enchanted forest children book illustration',
]

async function fetchIllustrations(): Promise<string[]> {
  const results = await Promise.allSettled(
    QUERIES.map(async (q, i) => {
      // Stagger slightly so not all hit at once
      await new Promise(r => setTimeout(r, i * 120))
      const url = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(q)}&license_type=commercial&source=rawpixel,nypl&page_size=4`
      const res = await fetch(url, { headers: { Accept: 'application/json' } })
      if (!res.ok) return []
      const data = await res.json()
      return (data.results || [])
        .filter((img: { thumbnail?: string }) => img.thumbnail)
        .map((img: { thumbnail: string }) => img.thumbnail)
        .slice(0, 1) as string[]
    })
  )
  return results
    .filter(r => r.status === 'fulfilled')
    .flatMap(r => (r as PromiseFulfilledResult<string[]>).value)
    .filter(Boolean)
}

function StarShape({ size, color }: { size: number; color: string }) {
  // 5-pointed star
  const pts = Array.from({ length: 5 }, (_, i) => {
    const outer = (Math.PI * 2 * i) / 5 - Math.PI / 2
    const inner = outer + Math.PI / 5
    const ro = size / 2, ri = size / 4
    return [
      Math.cos(outer) * ro + ro, Math.sin(outer) * ro + ro,
      Math.cos(inner) * ri + ro, Math.sin(inner) * ri + ro,
    ]
  })
  const d = pts.map(([ox, oy, ix, iy], i) =>
    `${i === 0 ? 'M' : 'L'}${ox},${oy} L${ix},${iy}`
  ).join(' ') + ' Z'
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <path d={d} fill={color} />
    </svg>
  )
}

function BookCover({ src, slot, loaded }: {
  src?: string
  slot: typeof BOOK_SLOTS[number]
  loaded: boolean
}) {
  const [hovered, setHovered] = useState(false)
  const w = SIZE[slot.size]
  const h = Math.round(w * 1.38)

  const posStyle: React.CSSProperties = {
    position: 'fixed',
    top: slot.top,
    ...(slot.side === 'left'
      ? { left: (slot as { left: string }).left }
      : { right: (slot as { right: string }).right }),
    width: w,
    transform: `rotate(${slot.rotate}deg) ${hovered ? 'scale(1.06) translateY(-6px)' : 'scale(1)'}`,
    transition: 'transform 0.45s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.4s ease, opacity 0.6s ease',
    opacity: loaded && src ? 0.9 : 0,
    pointerEvents: src ? 'auto' : 'none',
    zIndex: hovered ? 10 : 1,
    cursor: 'default',
  }

  return (
    <div
      style={posStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        borderRadius: 8,
        overflow: 'hidden',
        boxShadow: hovered
          ? `${slot.side === 'left' ? '-' : ''}6px 12px 36px rgba(0,0,0,0.28), 0 2px 8px rgba(0,0,0,0.14)`
          : `${slot.side === 'left' ? '-' : ''}3px 6px 20px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.1)`,
        transition: 'box-shadow 0.4s ease',
        background: '#e8e0d4',
      }}>
        {/* Book spine */}
        <div style={{
          position: 'absolute',
          top: 0, bottom: 0,
          [slot.side === 'left' ? 'left' : 'right']: 0,
          width: 14,
          background: 'rgba(0,0,0,0.18)',
          zIndex: 2,
        }}/>
        {src && (
          <img
            src={src}
            alt=""
            loading="lazy"
            decoding="async"
            style={{ width: w, height: h, objectFit: 'cover', display: 'block' }}
            onError={e => { (e.target as HTMLImageElement).parentElement!.parentElement!.style.opacity = '0' }}
          />
        )}
      </div>
    </div>
  )
}

export function BookShowcase() {
  const [images, setImages] = useState<string[]>([])
  const [loaded, setLoaded]  = useState(false)
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    const timer = setTimeout(async () => {
      const imgs = await fetchIllustrations()
      setImages(imgs)
      setLoaded(true)
    }, 600)
    return () => clearTimeout(timer)
  }, [])

  // Only on xl screens — below that width there's no room
  return (
    <>
      {/* Stars — always visible on xl, no API needed */}
      <div aria-hidden="true" className="hidden xl:block pointer-events-none">
        {STARS.map((s, i) => (
          <div key={i} style={{ position: 'fixed', ...s, zIndex: 0 }}>
            <StarShape size={s.size} color={s.color} />
          </div>
        ))}
      </div>

      {/* Book covers — xl only */}
      {!prefersReducedMotion && (
        <div aria-hidden="true" className="hidden xl:block">
          {BOOK_SLOTS.map((slot, i) => (
            <BookCover
              key={i}
              src={images[i]}
              slot={slot}
              loaded={loaded}
            />
          ))}
        </div>
      )}
    </>
  )
}
