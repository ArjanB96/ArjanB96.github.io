import { memo } from 'react'

/** Vaste pseudo-willekeur, zodat het publiek bij elke render hetzelfde blijft */
function lcg(seed: number) { let s = seed; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296 }
const SKIN = ['#f1c9a5', '#e0b088', '#c98b5e', '#8a5a3c', '#5e3a1a', '#f6d7bc']
const SHIRT = ['#c4122f', '#1d4fa3', '#d4a017', '#111', '#fff', '#2f6b2f', '#9b30c9', '#ff7a3c', '#e9e3d6']
const HAIR = ['#111', '#3a2a1a', '#7a4a2a', '#d9b26a', '#888', '#b8321a']

/** Rijen met poppetjes: achterste rij klein, voorste groot (diepte) */
const ROWS = [{ y: 70, n: 30, s: 0.55 }, { y: 92, n: 26, s: 0.68 }, { y: 116, n: 22, s: 0.82 }, { y: 142, n: 18, s: 1 }]

function people() {
  const r = lcg(7), out: JSX.Element[] = []
  ROWS.forEach((row, ri) => {
    const step = 800 / row.n
    for (let i = 0; i < row.n; i++) {
      const x = step * (i + 0.5) + (r() - 0.5) * step * 0.4, s = row.s, k = out.length
      const skin = SKIN[Math.floor(r() * SKIN.length)], shirt = SHIRT[Math.floor(r() * SHIRT.length)], hair = HAIR[Math.floor(r() * HAIR.length)]
      const hat = r() < 0.18, up = r() < 0.35, prop = r(), g = `g${k % 5}`
      out.push(
        <g key={k} className={`fan ${g}`} transform={`translate(${x.toFixed(1)} ${row.y}) scale(${s})`}>
          {up ? <g className="arms" stroke={skin} strokeWidth="4" strokeLinecap="round"><path d="M-8 -16 L-15 -34"/><path d="M8 -16 L15 -34"/></g>
            : <g stroke={shirt} strokeWidth="5" strokeLinecap="round"><path d="M-9 -14 L-11 -2"/><path d="M9 -14 L11 -2"/></g>}
          {up && prop < 0.3 && <path d="M15 -34 v-14 l12 4 l-12 4" fill={ri % 2 ? '#d4a017' : '#c4122f'} stroke="#fff" strokeWidth="1"/>}
          {up && prop > 0.85 && <path d="M-18 -44 l6 0 l-2 9 h-2z" fill="#fff4c0" stroke="#fff"/>}
          <rect x="-10" y="-18" width="20" height="22" rx="7" fill={shirt}/>
          <circle cy="-26" r="8" fill={skin}/>
          {hat ? <g fill={ri % 2 ? '#111' : '#d4a017'}><rect x="-11" y="-33" width="22" height="3" rx="1"/><rect x="-6" y="-42" width="12" height="10" rx="2"/></g>
            : <path d="M-8 -28 Q-8 -36 0 -36 Q8 -36 8 -28 Q4 -32 0 -31 Q-4 -32 -8 -28Z" fill={hair}/>}
        </g>)
    }
  })
  return out
}

/** Luxe tribune met publiek boven de renbaan */
function Grandstand() {
  return (
    <svg viewBox="0 0 800 180" preserveAspectRatio="xMidYMax slice" className="grandstand" aria-hidden="true">
      <defs>
        <linearGradient id="gs-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1b1040"/><stop offset=".6" stopColor="#5a1a4a"/><stop offset="1" stopColor="#c2410c"/></linearGradient>
        <linearGradient id="gs-gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff2a8"/><stop offset=".5" stopColor="#d4a017"/><stop offset="1" stopColor="#7a5a05"/></linearGradient>
        <radialGradient id="gs-light"><stop offset="0" stopColor="#fff8d6" stopOpacity=".9"/><stop offset="1" stopColor="#fff8d6" stopOpacity="0"/></radialGradient>
        <pattern id="gs-panter" width="24" height="12" patternUnits="userSpaceOnUse"><rect width="24" height="12" fill="#c8913a"/><ellipse cx="6" cy="5" rx="3" ry="2" fill="#2a1606"/><ellipse cx="18" cy="8" rx="2.5" ry="1.8" fill="#2a1606"/></pattern>
      </defs>
      <rect width="800" height="180" fill="url(#gs-sky)"/>
      {/* lichtmasten */}
      {[40, 760].map(x => <g key={x}><rect x={x - 3} y="8" width="6" height="60" fill="#333"/><rect x={x - 16} y="4" width="32" height="10" rx="2" fill="#ddd"/><circle cx={x} cy="16" r="50" fill="url(#gs-light)" className="floodlight"/></g>)}
      {/* overkapping */}
      <path d="M0 22 L800 22 L800 36 L0 36Z" fill="#5a0f1c"/><rect y="34" width="800" height="4" fill="url(#gs-gold)"/>
      <path d="M0 22 Q100 8 200 22 Q300 8 400 22 Q500 8 600 22 Q700 8 800 22" fill="#7a1426" stroke="#d4a017" strokeWidth="2"/>
      {/* tribunerijen */}
      {ROWS.map((row, i) => <rect key={i} x="0" y={row.y - 30 * row.s} width="800" height={30 * row.s + 4} fill={i % 2 ? '#3b0a14' : '#4a0d18'}/>)}
      <rect y="38" width="800" height="12" fill="#2a0610"/>
      {[100, 300, 500, 700].map(x => <rect key={x} x={x - 3} y="36" width="6" height="110" fill="#2a0610" opacity=".6"/>)}
      <g className="crowd-people">{people()}</g>
      {/* VIP-balustrade */}
      <rect y="146" width="800" height="16" fill="url(#gs-panter)"/>
      <rect y="144" width="800" height="4" fill="url(#gs-gold)"/><rect y="160" width="800" height="4" fill="url(#gs-gold)"/>
      {Array.from({ length: 41 }, (_, i) => <rect key={i} x={i * 20 - 1} y="148" width="3" height="12" fill="#d4a017"/>)}
      <rect y="164" width="800" height="16" fill="#2a0610"/>
      <text x="400" y="176" textAnchor="middle" fontFamily="Palatino Linotype,Georgia,serif" fontWeight="700" fontSize="11" fill="#d4a017" letterSpacing="4">VIP · BERTS RENBAAN · MONACO</text>
    </svg>
  )
}
export default memo(Grandstand)
