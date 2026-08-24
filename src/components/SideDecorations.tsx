/* Decorative floating elements that fill the side margins on wide screens.
   Hidden on small screens where there's no room. Pure CSS, no JS. */
export function SideDecorations() {
  return (
    <div aria-hidden="true" className="pointer-events-none select-none fixed inset-0 overflow-hidden hidden xl:block">

      {/* ── Left side ─────────────────────────────────────────── */}

      {/* Star top-left */}
      <svg className="deco deco-float-a absolute" style={{ left: '3%', top: '12%', opacity: 0.18 }}
        width="36" height="36" viewBox="0 0 36 36">
        <path fill="#C47C5A" d="M18 2l2.9 9h9.4l-7.6 5.5 2.9 9L18 21l-7.6 5.5 2.9-9L5.7 11h9.4z"/>
      </svg>

      {/* Moon left */}
      <svg className="deco deco-float-b absolute" style={{ left: '5%', top: '28%', opacity: 0.13 }}
        width="44" height="44" viewBox="0 0 44 44">
        <path fill="#7B9EA8" d="M22 4a18 18 0 1 0 18 18A18 18 0 0 0 22 4zm0 2a15.9 15.9 0 0 1 6 1.2A16 16 0 0 0 16 22a16 16 0 0 0 12 15.5A16 16 0 0 1 22 38 16 16 0 0 1 22 6z"/>
      </svg>

      {/* Small open book left */}
      <svg className="deco deco-float-c absolute" style={{ left: '2.5%', top: '46%', opacity: 0.12 }}
        width="52" height="40" viewBox="0 0 52 40">
        <rect x="1" y="4" width="24" height="32" rx="3" fill="#C47C5A"/>
        <rect x="27" y="4" width="24" height="32" rx="3" fill="#C47C5A"/>
        <line x1="26" y1="4" x2="26" y2="36" stroke="#F5F0E8" strokeWidth="2"/>
        <rect x="5" y="10" width="16" height="2" rx="1" fill="#F5F0E8" opacity=".5"/>
        <rect x="5" y="15" width="14" height="2" rx="1" fill="#F5F0E8" opacity=".4"/>
        <rect x="5" y="20" width="16" height="2" rx="1" fill="#F5F0E8" opacity=".5"/>
        <rect x="31" y="10" width="16" height="2" rx="1" fill="#F5F0E8" opacity=".5"/>
        <rect x="31" y="15" width="14" height="2" rx="1" fill="#F5F0E8" opacity=".4"/>
        <rect x="31" y="20" width="16" height="2" rx="1" fill="#F5F0E8" opacity=".5"/>
      </svg>

      {/* Sparkle dots left */}
      <svg className="deco deco-float-d absolute" style={{ left: '6%', top: '63%', opacity: 0.15 }}
        width="28" height="28" viewBox="0 0 28 28">
        <circle cx="14" cy="14" r="3" fill="#B8C4A8"/>
        <circle cx="4"  cy="4"  r="2" fill="#B8C4A8"/>
        <circle cx="24" cy="4"  r="2" fill="#B8C4A8"/>
        <circle cx="4"  cy="24" r="2" fill="#B8C4A8"/>
        <circle cx="24" cy="24" r="2" fill="#B8C4A8"/>
      </svg>

      {/* Feather/leaf left */}
      <svg className="deco deco-float-a absolute" style={{ left: '3.5%', top: '78%', opacity: 0.11 }}
        width="30" height="48" viewBox="0 0 30 48">
        <path fill="#B8C4A8" d="M15 2 C5 10 2 25 8 40 Q12 46 15 46 Q18 46 22 40 C28 25 25 10 15 2z"/>
        <line x1="15" y1="10" x2="15" y2="46" stroke="#F5F0E8" strokeWidth="1.5" opacity=".6"/>
        <line x1="15" y1="18" x2="8"  y2="24" stroke="#F5F0E8" strokeWidth="1" opacity=".5"/>
        <line x1="15" y1="24" x2="22" y2="30" stroke="#F5F0E8" strokeWidth="1" opacity=".5"/>
        <line x1="15" y1="30" x2="9"  y2="36" stroke="#F5F0E8" strokeWidth="1" opacity=".5"/>
      </svg>

      {/* Star small bottom-left */}
      <svg className="deco deco-float-b absolute" style={{ left: '7%', top: '90%', opacity: 0.14 }}
        width="20" height="20" viewBox="0 0 20 20">
        <path fill="#C47C5A" d="M10 1l1.6 5H18l-4.3 3.1 1.6 5L10 11.2l-5.3 3.9 1.6-5L2 6.9h6.4z"/>
      </svg>

      {/* ── Right side ────────────────────────────────────────── */}

      {/* Large star top-right */}
      <svg className="deco deco-float-b absolute" style={{ right: '4%', top: '8%', opacity: 0.15 }}
        width="40" height="40" viewBox="0 0 40 40">
        <path fill="#C47C5A" d="M20 2l2.5 8.5H32l-7.3 5.2 2.8 8.8L20 19.4l-7.5 5.1 2.8-8.8L8 10.5h9.5z"/>
      </svg>

      {/* Moon crescent right */}
      <svg className="deco deco-float-c absolute" style={{ right: '3%', top: '24%', opacity: 0.12 }}
        width="38" height="50" viewBox="0 0 38 50">
        <path fill="#7B9EA8" d="M28 4A22 22 0 1 0 28 46A16 16 0 0 1 28 4Z"/>
      </svg>

      {/* Sparkle right */}
      <svg className="deco deco-float-a absolute" style={{ right: '6%', top: '40%', opacity: 0.16 }}
        width="24" height="24" viewBox="0 0 24 24">
        <path fill="#C47C5A" d="M12 0l1.5 10.5L24 12l-10.5 1.5L12 24l-1.5-10.5L0 12l10.5-1.5z"/>
      </svg>

      {/* Book right middle */}
      <svg className="deco deco-float-d absolute" style={{ right: '2.5%', top: '55%', opacity: 0.11 }}
        width="42" height="54" viewBox="0 0 42 54">
        <rect x="1" y="1" width="36" height="50" rx="4" fill="#7B9EA8"/>
        <rect x="5" y="8"  width="28" height="2.5" rx="1" fill="#F5F0E8" opacity=".5"/>
        <rect x="5" y="14" width="22" height="2"   rx="1" fill="#F5F0E8" opacity=".4"/>
        <rect x="5" y="20" width="26" height="2"   rx="1" fill="#F5F0E8" opacity=".4"/>
        <rect x="5" y="26" width="20" height="2"   rx="1" fill="#F5F0E8" opacity=".4"/>
        <rect x="5" y="32" width="24" height="2"   rx="1" fill="#F5F0E8" opacity=".4"/>
        <rect x="5" y="38" width="18" height="2"   rx="1" fill="#F5F0E8" opacity=".4"/>
        <rect x="37" y="1" width="4" height="50" rx="2" fill="#C47C5A"/>
      </svg>

      {/* Leaf right lower */}
      <svg className="deco deco-float-b absolute" style={{ right: '5%', top: '72%', opacity: 0.12 }}
        width="28" height="44" viewBox="0 0 28 44">
        <path fill="#B8C4A8" d="M14 2 C4 10 2 22 8 36 Q11 42 14 42 Q17 42 20 36 C26 22 24 10 14 2z"/>
        <line x1="14" y1="8" x2="14" y2="42" stroke="#F5F0E8" strokeWidth="1.5" opacity=".6"/>
      </svg>

      {/* Dots cluster right */}
      <svg className="deco deco-float-a absolute" style={{ right: '3.5%', top: '86%', opacity: 0.14 }}
        width="36" height="20" viewBox="0 0 36 20">
        <circle cx="4"  cy="10" r="3" fill="#C47C5A"/>
        <circle cx="14" cy="10" r="2" fill="#C47C5A"/>
        <circle cx="22" cy="10" r="3" fill="#B8C4A8"/>
        <circle cx="32" cy="10" r="2" fill="#B8C4A8"/>
      </svg>

    </div>
  )
}
