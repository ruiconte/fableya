interface FableyaLogoProps {
  size?: number
  color?: string
  className?: string
}

export function FableyaLogo({ size = 40, color = '#8B4A2A', className = '' }: FableyaLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer circle */}
      <circle cx="100" cy="100" r="92" stroke={color} strokeWidth="3.5" fill="none"/>

      {/* Laurel branches - left */}
      <g stroke={color} strokeWidth="2" fill="none" strokeLinecap="round">
        <path d="M28 100 Q22 88 30 80" /><ellipse cx="26" cy="86" rx="5" ry="8" transform="rotate(-40 26 86)" stroke={color} strokeWidth="1.8" fill="none"/>
        <path d="M22 116 Q14 106 20 96" /><ellipse cx="17" cy="102" rx="5" ry="8" transform="rotate(-55 17 102)" stroke={color} strokeWidth="1.8" fill="none"/>
        <path d="M30 132 Q20 124 24 113" /><ellipse cx="22" cy="119" rx="5" ry="8" transform="rotate(-70 22 119)" stroke={color} strokeWidth="1.8" fill="none"/>
        <path d="M44 148 Q32 142 34 130" /><ellipse cx="34" cy="137" rx="5" ry="8" transform="rotate(-85 34 137)" stroke={color} strokeWidth="1.8" fill="none"/>
        <path d="M62 160 Q50 157 50 144" /><ellipse cx="50" cy="150" rx="5" ry="8" transform="rotate(-105 50 150)" stroke={color} strokeWidth="1.8" fill="none"/>
        {/* stem */}
        <path d="M28 100 Q35 115 44 130 Q52 145 62 160" strokeWidth="2"/>
      </g>

      {/* Laurel branches - right */}
      <g stroke={color} strokeWidth="2" fill="none" strokeLinecap="round">
        <path d="M172 100 Q178 88 170 80" /><ellipse cx="174" cy="86" rx="5" ry="8" transform="rotate(40 174 86)" stroke={color} strokeWidth="1.8" fill="none"/>
        <path d="M178 116 Q186 106 180 96" /><ellipse cx="183" cy="102" rx="5" ry="8" transform="rotate(55 183 102)" stroke={color} strokeWidth="1.8" fill="none"/>
        <path d="M170 132 Q180 124 176 113" /><ellipse cx="178" cy="119" rx="5" ry="8" transform="rotate(70 178 119)" stroke={color} strokeWidth="1.8" fill="none"/>
        <path d="M156 148 Q168 142 166 130" /><ellipse cx="166" cy="137" rx="5" ry="8" transform="rotate(85 166 137)" stroke={color} strokeWidth="1.8" fill="none"/>
        <path d="M138 160 Q150 157 150 144" /><ellipse cx="150" cy="150" rx="5" ry="8" transform="rotate(105 150 150)" stroke={color} strokeWidth="1.8" fill="none"/>
        {/* stem */}
        <path d="M172 100 Q165 115 156 130 Q148 145 138 160" strokeWidth="2"/>
      </g>

      {/* Open book */}
      <g stroke={color} strokeWidth="2.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* Pages stack left */}
        <path d="M46 140 Q46 105 100 98"/>
        <path d="M50 143 Q50 108 100 101"/>
        <path d="M54 145 Q54 110 100 103"/>
        {/* Pages stack right */}
        <path d="M154 140 Q154 105 100 98"/>
        <path d="M150 143 Q150 108 100 101"/>
        <path d="M146 145 Q146 110 100 103"/>
        {/* Cover left */}
        <path d="M42 145 Q42 100 100 95 L100 148 Q70 148 42 145Z"/>
        {/* Cover right */}
        <path d="M158 145 Q158 100 100 95 L100 148 Q130 148 158 145Z"/>
        {/* Spine bottom */}
        <path d="M88 148 Q100 152 112 148"/>
        {/* Center spine */}
        <line x1="100" y1="95" x2="100" y2="148"/>
      </g>

      {/* Stars above book */}
      {/* Large 4-pointed star */}
      <g stroke={color} strokeWidth="2" strokeLinecap="round">
        <line x1="84" y1="60" x2="84" y2="72"/>
        <line x1="78" y1="66" x2="90" y2="66"/>
        <line x1="80" y1="62" x2="88" y2="70"/>
        <line x1="88" y1="62" x2="80" y2="70"/>
      </g>

      {/* Medium 4-pointed star */}
      <g stroke={color} strokeWidth="1.8" strokeLinecap="round">
        <line x1="104" y1="72" x2="104" y2="82"/>
        <line x1="99" y1="77" x2="109" y2="77"/>
        <line x1="101" y1="74" x2="107" y2="80"/>
        <line x1="107" y1="74" x2="101" y2="80"/>
      </g>

      {/* Small star */}
      <g stroke={color} strokeWidth="1.5" strokeLinecap="round">
        <line x1="90" y1="80" x2="90" y2="87"/>
        <line x1="86.5" y1="83.5" x2="93.5" y2="83.5"/>
        <line x1="88" y1="81" x2="92" y2="86"/>
        <line x1="92" y1="81" x2="88" y2="86"/>
      </g>

      {/* Shooting star (top right) */}
      <g stroke={color} strokeWidth="1.8" strokeLinecap="round">
        <line x1="116" y1="58" x2="120" y2="64"/>
        <line x1="113" y1="61" x2="117" y2="55"/>
        <line x1="115" y1="58" x2="111" y2="61"/>
        <line x1="119" y1="62" x2="115" y2="65"/>
      </g>
      {/* Shooting star trail */}
      <path d="M112 65 Q118 60 126 54" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3" fill="none"/>
    </svg>
  )
}
