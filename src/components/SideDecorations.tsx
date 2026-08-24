export function SideDecorations() {
  return (
    <div aria-hidden="true" className="pointer-events-none select-none fixed inset-0 overflow-hidden hidden xl:block z-0">

      {/* ══════════════ LEFT SIDE ══════════════ */}

      {/* Rabbit reading a book — top left */}
      <div className="deco-float-a absolute" style={{ left: '2%', top: '10%' }}>
        <svg viewBox="0 0 90 120" width="90" height="120" opacity="0.72">
          {/* Left ear */}
          <ellipse cx="30" cy="16" rx="9" ry="20" fill="#F0E8DF"/>
          <ellipse cx="30" cy="16" rx="5" ry="14" fill="#F2B8B0"/>
          {/* Right ear */}
          <ellipse cx="56" cy="16" rx="9" ry="20" fill="#F0E8DF"/>
          <ellipse cx="56" cy="16" rx="5" ry="14" fill="#F2B8B0"/>
          {/* Body */}
          <ellipse cx="43" cy="82" rx="28" ry="32" fill="#F0E8DF"/>
          {/* Belly */}
          <ellipse cx="43" cy="88" rx="17" ry="20" fill="#FAF5EE"/>
          {/* Head */}
          <circle cx="43" cy="44" r="26" fill="#F0E8DF"/>
          {/* Eyes */}
          <circle cx="33" cy="41" r="4.5" fill="#2D2A26"/>
          <circle cx="53" cy="41" r="4.5" fill="#2D2A26"/>
          <circle cx="34.5" cy="39.5" r="1.8" fill="white"/>
          <circle cx="54.5" cy="39.5" r="1.8" fill="white"/>
          {/* Nose */}
          <ellipse cx="43" cy="49" rx="4" ry="3" fill="#E89898"/>
          {/* Mouth */}
          <path d="M38 54 Q43 59 48 54" stroke="#C47C5A" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
          {/* Cheeks */}
          <ellipse cx="25" cy="47" rx="7" ry="4.5" fill="#F2A0A0" opacity="0.28"/>
          <ellipse cx="61" cy="47" rx="7" ry="4.5" fill="#F2A0A0" opacity="0.28"/>
          {/* Left arm */}
          <path d="M18 76 C10 82 10 92 16 98" stroke="#E8D0C0" strokeWidth="11" strokeLinecap="round" fill="none"/>
          {/* Right arm */}
          <path d="M68 76 C76 82 76 92 70 98" stroke="#E8D0C0" strokeWidth="11" strokeLinecap="round" fill="none"/>
          {/* Book left page */}
          <rect x="10" y="93" width="32" height="24" rx="3" fill="#C47C5A"/>
          {/* Book right page */}
          <rect x="44" y="93" width="32" height="24" rx="3" fill="#D4956E"/>
          {/* Book spine */}
          <rect x="40" y="91" width="6" height="28" rx="2" fill="#8B4A2A" opacity="0.35"/>
          {/* Book lines */}
          <line x1="16" y1="102" x2="36" y2="102" stroke="#FAF5EE" strokeWidth="1.5" opacity="0.55"/>
          <line x1="16" y1="108" x2="32" y2="108" stroke="#FAF5EE" strokeWidth="1.5" opacity="0.55"/>
          <line x1="50" y1="102" x2="70" y2="102" stroke="#FAF5EE" strokeWidth="1.5" opacity="0.55"/>
          <line x1="50" y1="108" x2="66" y2="108" stroke="#FAF5EE" strokeWidth="1.5" opacity="0.55"/>
          {/* Stars */}
          <path d="M78 22 l1.5 4.5h4.7l-3.8 2.7 1.4 4.5-3.8-2.8-3.8 2.8 1.4-4.5-3.8-2.7h4.7z" fill="#C47C5A" opacity="0.6"/>
          <path d="M6 30 l1 3h3l-2.5 1.8 1 3-2.5-1.8-2.5 1.8 1-3L2 33h3z" fill="#7B9EA8" opacity="0.6"/>
        </svg>
      </div>

      {/* Crescent moon with stars — middle left */}
      <div className="deco-float-c absolute" style={{ left: '1.5%', top: '44%' }}>
        <svg viewBox="0 0 90 110" width="90" height="110" opacity="0.68">
          {/* Moon body */}
          <path d="M55 10 A38 38 0 1 0 55 86 A26 26 0 1 1 55 10Z" fill="#F2C87A"/>
          {/* Moon face — closed sleeping eyes */}
          <path d="M32 44 Q38 40 44 44" stroke="#2D2A26" strokeWidth="2" fill="none" strokeLinecap="round"/>
          <path d="M32 44 Q38 48 44 44" stroke="#2D2A26" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.4"/>
          <path d="M20 50 Q26 46 32 50" stroke="#2D2A26" strokeWidth="2" fill="none" strokeLinecap="round"/>
          {/* Blush */}
          <ellipse cx="20" cy="55" rx="6" ry="4" fill="#F2A06A" opacity="0.35"/>
          <ellipse cx="45" cy="52" rx="6" ry="4" fill="#F2A06A" opacity="0.35"/>
          {/* Stars around */}
          <path d="M72 15 l2 6h6.3l-5.1 3.7 1.9 6-5.1-3.7-5.1 3.7 1.9-6-5.1-3.7h6.3z" fill="#C47C5A" opacity="0.7"/>
          <path d="M78 50 l1.2 3.6h3.8l-3.1 2.2 1.2 3.6-3.1-2.3-3.1 2.3 1.2-3.6-3.1-2.2h3.8z" fill="#7B9EA8" opacity="0.65"/>
          <path d="M65 88 l1 3h3.2l-2.6 1.9 1 3-2.6-1.9-2.6 1.9 1-3-2.6-1.9h3.2z" fill="#C47C5A" opacity="0.55"/>
          <circle cx="82" cy="80" r="3" fill="#F2C87A" opacity="0.5"/>
          <circle cx="68" cy="4"  r="2.5" fill="#F2C87A" opacity="0.5"/>
          {/* Small sparkles */}
          <line x1="78" y1="32" x2="78" y2="40" stroke="#F2C87A" strokeWidth="1.5" opacity="0.5"/>
          <line x1="74" y1="36" x2="82" y2="36" stroke="#F2C87A" strokeWidth="1.5" opacity="0.5"/>
        </svg>
      </div>

      {/* Little mushrooms + sparkles — bottom left */}
      <div className="deco-float-b absolute" style={{ left: '2%', top: '76%' }}>
        <svg viewBox="0 0 100 90" width="100" height="90" opacity="0.65">
          {/* Big mushroom */}
          <rect x="34" y="52" width="12" height="26" rx="4" fill="#F0E8DF"/>
          <ellipse cx="40" cy="54" rx="22" ry="16" fill="#C47C5A"/>
          <ellipse cx="30" cy="50" rx="6" ry="4" fill="#D4956E" opacity="0.6"/>
          <ellipse cx="50" cy="48" rx="5" ry="3.5" fill="#D4956E" opacity="0.6"/>
          <ellipse cx="40" cy="45" rx="5" ry="3.5" fill="#D4956E" opacity="0.6"/>
          {/* Small mushroom right */}
          <rect x="66" y="62" width="8" height="18" rx="3" fill="#F0E8DF"/>
          <ellipse cx="70" cy="63" rx="14" ry="10" fill="#7B9EA8"/>
          <ellipse cx="63" cy="60" rx="4" ry="3" fill="#9AB4BC" opacity="0.6"/>
          <ellipse cx="73" cy="58" rx="3.5" ry="2.5" fill="#9AB4BC" opacity="0.6"/>
          {/* Small mushroom left */}
          <rect x="16" y="65" width="7" height="15" rx="3" fill="#F0E8DF"/>
          <ellipse cx="19" cy="66" rx="12" ry="8" fill="#B8C4A8"/>
          {/* Grass dots */}
          <ellipse cx="40" cy="80" rx="38" ry="5" fill="#B8C4A8" opacity="0.3"/>
          {/* Sparkles */}
          <path d="M8 40 l1 3.5h3.7l-3 2.2 1.1 3.5-3-2.2-3 2.2 1.1-3.5-3-2.2h3.7z" fill="#F2C87A" opacity="0.7"/>
          <path d="M82 38 l1.2 4h4.5l-3.6 2.6 1.3 4.2-3.6-2.6-3.6 2.6 1.3-4.2-3.6-2.6h4.5z" fill="#C47C5A" opacity="0.6"/>
          <circle cx="92" cy="55" r="3" fill="#F2C87A" opacity="0.55"/>
          <circle cx="5"  cy="57" r="2.5" fill="#C47C5A" opacity="0.5"/>
        </svg>
      </div>

      {/* ══════════════ RIGHT SIDE ══════════════ */}

      {/* Stack of books with stars — top right */}
      <div className="deco-float-b absolute" style={{ right: '1.5%', top: '8%' }}>
        <svg viewBox="0 0 100 120" width="100" height="120" opacity="0.70">
          {/* Bottom book — teal */}
          <rect x="8" y="84" width="72" height="18" rx="4" fill="#7B9EA8" transform="rotate(-4 44 93)"/>
          <rect x="8" y="84" width="10" height="18" rx="3" fill="#5A8290" transform="rotate(-4 44 93)"/>
          <line x1="22" y1="90" x2="74" y2="88" stroke="#FAF5EE" strokeWidth="1.5" opacity="0.5" transform="rotate(-4 44 93)"/>
          <line x1="22" y1="96" x2="70" y2="94" stroke="#FAF5EE" strokeWidth="1.5" opacity="0.4" transform="rotate(-4 44 93)"/>
          {/* Middle book — sage green */}
          <rect x="12" y="62" width="68" height="18" rx="4" fill="#B8C4A8" transform="rotate(3 46 71)"/>
          <rect x="12" y="62" width="10" height="18" rx="3" fill="#96A88A" transform="rotate(3 46 71)"/>
          <line x1="26" y1="69" x2="74" y2="70" stroke="#FAF5EE" strokeWidth="1.5" opacity="0.5" transform="rotate(3 46 71)"/>
          {/* Top book — terracotta */}
          <rect x="16" y="40" width="64" height="18" rx="4" fill="#C47C5A" transform="rotate(-2 48 49)"/>
          <rect x="16" y="40" width="10" height="18" rx="3" fill="#A05A3A" transform="rotate(-2 48 49)"/>
          <line x1="30" y1="47" x2="74" y2="46" stroke="#FAF5EE" strokeWidth="1.5" opacity="0.5" transform="rotate(-2 48 49)"/>
          <line x1="30" y1="52" x2="68" y2="51" stroke="#FAF5EE" strokeWidth="1.5" opacity="0.4" transform="rotate(-2 48 49)"/>
          {/* Stars above */}
          <path d="M48 6 l2.5 7.5h7.9l-6.4 4.6 2.4 7.5-6.4-4.7-6.4 4.7 2.4-7.5-6.4-4.6h7.9z" fill="#F2C87A"/>
          <path d="M76 18 l1.4 4.2h4.4l-3.6 2.6 1.4 4.4-3.6-2.6-3.6 2.6 1.4-4.4-3.6-2.6h4.4z" fill="#C47C5A" opacity="0.7"/>
          <path d="M18 22 l1.2 3.5h3.7l-3 2.2 1.1 3.5-3-2.2-3 2.2 1.1-3.5-3-2.2h3.7z" fill="#7B9EA8" opacity="0.7"/>
          <circle cx="88" cy="38" r="3" fill="#F2C87A" opacity="0.6"/>
          <circle cx="8"  cy="36" r="2.5" fill="#C47C5A" opacity="0.55"/>
        </svg>
      </div>

      {/* Owl on a branch — middle right */}
      <div className="deco-float-d absolute" style={{ right: '1.5%', top: '42%' }}>
        <svg viewBox="0 0 100 120" width="100" height="120" opacity="0.68">
          {/* Branch */}
          <path d="M5 98 Q50 90 95 96" stroke="#8B6A4A" strokeWidth="8" strokeLinecap="round" fill="none"/>
          <path d="M5 98 Q50 90 95 96" stroke="#A87E5A" strokeWidth="5" strokeLinecap="round" fill="none"/>
          {/* Body */}
          <ellipse cx="50" cy="72" rx="24" ry="28" fill="#7B9EA8"/>
          {/* Belly */}
          <ellipse cx="50" cy="78" rx="14" ry="17" fill="#C4D8DC"/>
          {/* Belly stripes */}
          <ellipse cx="50" cy="72" rx="10" ry="6" fill="#A8C4CA" opacity="0.5"/>
          <ellipse cx="50" cy="80" rx="9"  ry="5" fill="#A8C4CA" opacity="0.4"/>
          {/* Wings */}
          <ellipse cx="29" cy="75" rx="10" ry="18" fill="#5A8290" transform="rotate(-10 29 75)"/>
          <ellipse cx="71" cy="75" rx="10" ry="18" fill="#5A8290" transform="rotate(10 71 75)"/>
          {/* Head */}
          <circle cx="50" cy="46" r="22" fill="#7B9EA8"/>
          {/* Ear tufts */}
          <polygon points="38,26 34,14 42,22" fill="#5A8290"/>
          <polygon points="62,26 66,14 58,22" fill="#5A8290"/>
          {/* Left eye disk */}
          <circle cx="40" cy="46" r="10" fill="#FAF5EE"/>
          <circle cx="40" cy="46" r="7"  fill="#F2C87A"/>
          <circle cx="40" cy="46" r="4"  fill="#2D2A26"/>
          <circle cx="41.5" cy="44.5" r="1.5" fill="white"/>
          {/* Right eye disk */}
          <circle cx="60" cy="46" r="10" fill="#FAF5EE"/>
          <circle cx="60" cy="46" r="7"  fill="#F2C87A"/>
          <circle cx="60" cy="46" r="4"  fill="#2D2A26"/>
          <circle cx="61.5" cy="44.5" r="1.5" fill="white"/>
          {/* Beak */}
          <polygon points="50,52 46,60 54,60" fill="#F2A06A"/>
          {/* Feet */}
          <line x1="40" y1="98" x2="36" y2="104" stroke="#8B6A4A" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="40" y1="98" x2="40" y2="106" stroke="#8B6A4A" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="40" y1="98" x2="44" y2="104" stroke="#8B6A4A" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="60" y1="98" x2="56" y2="104" stroke="#8B6A4A" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="60" y1="98" x2="60" y2="106" stroke="#8B6A4A" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="60" y1="98" x2="64" y2="104" stroke="#8B6A4A" strokeWidth="2.5" strokeLinecap="round"/>
          {/* Stars */}
          <path d="M88 20 l1.5 4.5h4.7l-3.8 2.8 1.4 4.5-3.8-2.8-3.8 2.8 1.4-4.5-3.8-2.8h4.7z" fill="#C47C5A" opacity="0.65"/>
          <path d="M8 30 l1.2 3.6h3.8l-3.1 2.2 1.2 3.6-3.1-2.2-3.1 2.2 1.2-3.6-3.1-2.2h3.8z" fill="#F2C87A" opacity="0.6"/>
        </svg>
      </div>

      {/* Magic wand + sparkles — bottom right */}
      <div className="deco-float-a absolute" style={{ right: '2.5%', top: '76%' }}>
        <svg viewBox="0 0 90 100" width="90" height="100" opacity="0.66">
          {/* Wand stick */}
          <line x1="25" y1="80" x2="68" y2="28" stroke="#8B6A4A" strokeWidth="5" strokeLinecap="round"/>
          <line x1="25" y1="80" x2="68" y2="28" stroke="#C4A882" strokeWidth="3" strokeLinecap="round"/>
          {/* Star at tip */}
          <path d="M68 16 l2.8 8.5h8.9l-7.2 5.2 2.7 8.5-7.2-5.2-7.2 5.2 2.7-8.5-7.2-5.2h8.9z" fill="#F2C87A"/>
          <path d="M68 16 l2.8 8.5h8.9l-7.2 5.2 2.7 8.5-7.2-5.2-7.2 5.2 2.7-8.5-7.2-5.2h8.9z" fill="white" opacity="0.35"/>
          {/* Sparkle trails */}
          <path d="M52 36 l1 3h3.2l-2.6 1.9 1 3-2.6-1.9-2.6 1.9 1-3-2.6-1.9h3.2z" fill="#C47C5A" opacity="0.7"/>
          <path d="M40 50 l.8 2.4h2.5l-2 1.4.8 2.4-2-1.5-2 1.5.8-2.4-2-1.4h2.5z" fill="#7B9EA8" opacity="0.65"/>
          <path d="M30 65 l1.2 3.6h3.8l-3 2.2 1.1 3.6-3.1-2.2-3.1 2.2 1.1-3.6-3-2.2h3.8z" fill="#F2C87A" opacity="0.7"/>
          <circle cx="18" cy="50" r="3.5" fill="#C47C5A" opacity="0.5"/>
          <circle cx="78" cy="54" r="2.5" fill="#F2C87A" opacity="0.55"/>
          <circle cx="8"  cy="70" r="2"   fill="#7B9EA8" opacity="0.5"/>
          {/* Small crossing sparkle lines */}
          <line x1="82" y1="70" x2="82" y2="80" stroke="#F2C87A" strokeWidth="2" opacity="0.5"/>
          <line x1="77" y1="75" x2="87" y2="75" stroke="#F2C87A" strokeWidth="2" opacity="0.5"/>
          <line x1="12" y1="34" x2="12" y2="42" stroke="#C47C5A" strokeWidth="2" opacity="0.45"/>
          <line x1="8"  y1="38" x2="16" y2="38" stroke="#C47C5A" strokeWidth="2" opacity="0.45"/>
        </svg>
      </div>

    </div>
  )
}
