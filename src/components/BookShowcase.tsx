import { useEffect, useRef, useState } from 'react'

// Diverse style queries — each targets a different aesthetic direction
const STYLE_QUERIES = [
  { q: 'watercolor fairy tale children',      label: 'Aquarelle' },
  { q: 'vintage picture book illustration',   label: 'Vintage' },
  { q: 'colorful storybook art children',     label: 'Coloré' },
  { q: 'fantasy illustration children book',  label: 'Fantaisie' },
  { q: 'art nouveau fairy tale illustration', label: 'Art Nouveau' },
  { q: 'folk art children story picture',     label: 'Folk' },
  { q: 'ink drawing children adventure book', label: 'Encre' },
  { q: 'botanical nature children book art',  label: 'Nature' },
]

interface BookImg {
  src: string
  label: string
  rotate: number  // degrees
  frameStyle: 'page' | 'cover' | 'tilt'
}

async function fetchQueryImages(query: string, label: string, count = 2): Promise<BookImg[]> {
  try {
    const url = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(query)}&license_type=commercial&source=rawpixel,nypl,flickr&page_size=${count + 4}`
    const res = await fetch(url, { headers: { Accept: 'application/json' } })
    if (!res.ok) return []
    const data = await res.json()
    return (data.results || [])
      .filter((img: { thumbnail?: string }) => img.thumbnail)
      .slice(0, count)
      .map((img: { thumbnail: string }, i: number) => ({
        src: img.thumbnail,
        label,
        rotate: (i % 2 === 0 ? -1 : 1) * (1 + Math.random() * 2.5),
        frameStyle: (['page', 'cover', 'tilt'] as const)[Math.floor(Math.random() * 3)],
      }))
  } catch {
    return []
  }
}

function BookFrame({ img }: { img: BookImg; paused?: boolean }) {
  const [hovered, setHovered] = useState(false)

  const baseStyle: React.CSSProperties = {
    transform: `rotate(${img.rotate}deg) ${hovered ? 'scale(1.04) translateY(-4px)' : ''}`,
    transition: 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.4s ease',
    willChange: 'transform',
  }

  if (img.frameStyle === 'cover') {
    return (
      <div
        style={baseStyle}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative rounded-lg overflow-hidden cursor-default"
        title={img.label}
      >
        {/* Book spine */}
        <div className="absolute left-0 top-0 bottom-0 w-3 bg-black/20 z-10" style={{ borderRadius: '4px 0 0 4px' }}/>
        <img
          src={img.src}
          alt={img.label}
          loading="lazy"
          decoding="async"
          className="block w-full"
          style={{
            width: 160,
            height: 210,
            objectFit: 'cover',
            display: 'block',
            boxShadow: hovered
              ? '-6px 6px 24px rgba(0,0,0,0.25), -2px 2px 8px rgba(0,0,0,0.15)'
              : '-4px 4px 14px rgba(0,0,0,0.18), -1px 1px 4px rgba(0,0,0,0.1)',
          }}
          onError={e => { (e.target as HTMLImageElement).parentElement!.style.display = 'none' }}
        />
        {hovered && (
          <div className="absolute inset-0 bg-black/40 flex items-end p-2 transition-opacity">
            <span className="text-white text-[10px] font-semibold tracking-wide uppercase opacity-90">{img.label}</span>
          </div>
        )}
      </div>
    )
  }

  if (img.frameStyle === 'tilt') {
    return (
      <div
        style={{ ...baseStyle, transform: `rotate(${img.rotate + 3}deg) ${hovered ? 'scale(1.05) translateY(-4px)' : ''}` }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative cursor-default"
        title={img.label}
      >
        <div style={{
          background: 'white',
          padding: '6px 6px 28px 6px',
          boxShadow: hovered
            ? '0 12px 32px rgba(0,0,0,0.22), 0 2px 8px rgba(0,0,0,0.1)'
            : '0 6px 18px rgba(0,0,0,0.14), 0 1px 4px rgba(0,0,0,0.08)',
          borderRadius: 4,
        }}>
          <img
            src={img.src}
            alt={img.label}
            loading="lazy"
            decoding="async"
            style={{ width: 150, height: 150, objectFit: 'cover', display: 'block' }}
            onError={e => { (e.target as HTMLImageElement).parentElement!.parentElement!.style.display = 'none' }}
          />
        </div>
        {hovered && (
          <div className="absolute bottom-1 left-0 right-0 text-center">
            <span className="text-kidoria-muted text-[10px] font-semibold tracking-wide uppercase">{img.label}</span>
          </div>
        )}
      </div>
    )
  }

  // 'page' style — white mat frame
  return (
    <div
      style={baseStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative cursor-default"
      title={img.label}
    >
      <div style={{
        background: '#FDFAF6',
        padding: '8px',
        boxShadow: hovered
          ? '0 14px 36px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.1)'
          : '0 4px 20px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.07)',
        borderRadius: 6,
        border: '1px solid rgba(0,0,0,0.05)',
      }}>
        <img
          src={img.src}
          alt={img.label}
          loading="lazy"
          decoding="async"
          style={{ width: 156, height: 200, objectFit: 'cover', display: 'block', borderRadius: 2 }}
          onError={e => { (e.target as HTMLImageElement).parentElement!.parentElement!.style.display = 'none' }}
        />
      </div>
      {hovered && (
        <div className="absolute -bottom-5 left-0 right-0 text-center">
          <span className="text-kidoria-muted text-[10px] font-semibold tracking-wide uppercase">{img.label}</span>
        </div>
      )}
    </div>
  )
}

interface ColumnProps {
  images: BookImg[]
  direction: 'up' | 'down'
  duration: number
  paused: boolean
}

function ScrollColumn({ images, direction, duration, paused }: ColumnProps) {
  if (images.length === 0) return null
  // Duplicate for seamless loop
  const doubled = [...images, ...images]

  return (
    <div style={{ overflow: 'hidden', height: '100vh' }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 28,
          paddingTop: 40,
          paddingBottom: 40,
          animation: `${direction === 'up' ? 'showcase-up' : 'showcase-down'} ${duration}s linear infinite`,
          animationPlayState: paused ? 'paused' : 'running',
          willChange: 'transform',
        }}
      >
        {doubled.map((img, i) => (
          <BookFrame key={i} img={img} paused={paused} />
        ))}
      </div>
    </div>
  )
}

export function BookShowcase() {
  const [leftImgs, setLeftImgs]   = useState<BookImg[]>([])
  const [rightImgs, setRightImgs] = useState<BookImg[]>([])
  const [visible, setVisible]     = useState(false)
  const [paused, setPaused]       = useState(false)
  const reducedMotion = useRef(
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )

  useEffect(() => {
    // Defer fetch until after initial paint
    const timer = setTimeout(async () => {
      const results = await Promise.allSettled(
        STYLE_QUERIES.map(({ q, label }) => fetchQueryImages(q, label, 2))
      )
      const all: BookImg[] = results
        .filter(r => r.status === 'fulfilled')
        .flatMap(r => (r as PromiseFulfilledResult<BookImg[]>).value)

      if (all.length < 4) return

      // Alternate between queries to ensure visual diversity across columns
      const left:  BookImg[] = []
      const right: BookImg[] = []
      all.forEach((img, i) => (i % 2 === 0 ? left : right).push(img))

      setLeftImgs(left)
      setRightImgs(right)
      setVisible(true)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  // Reduced motion: render static grid instead of scroll
  if (reducedMotion.current) {
    return (
      <div className="hidden xl:block" aria-hidden="true">
        <div className="fixed left-0 top-1/2 -translate-y-1/2 w-48 flex flex-col gap-5 pl-4 pointer-events-none opacity-60">
          {leftImgs.slice(0, 3).map((img, i) => <BookFrame key={i} img={img} paused />)}
        </div>
        <div className="fixed right-0 top-1/2 -translate-y-1/2 w-48 flex flex-col gap-5 pr-4 pointer-events-none opacity-60">
          {rightImgs.slice(0, 3).map((img, i) => <BookFrame key={i} img={img} paused />)}
        </div>
      </div>
    )
  }

  return (
    <div
      aria-hidden="true"
      className="hidden xl:block pointer-events-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{ pointerEvents: 'none' }}
    >
      {/* Left column — scrolls upward */}
      <div className="fixed top-0 bottom-0 pointer-events-auto"
        style={{ left: '1.5%', width: 180, opacity: 0.78 }}>
        <ScrollColumn images={leftImgs} direction="up" duration={55} paused={paused} />
      </div>

      {/* Right column — scrolls downward */}
      <div className="fixed top-0 bottom-0 pointer-events-auto"
        style={{ right: '1.5%', width: 180, opacity: 0.78 }}>
        <ScrollColumn images={rightImgs} direction="down" duration={65} paused={paused} />
      </div>
    </div>
  )
}
