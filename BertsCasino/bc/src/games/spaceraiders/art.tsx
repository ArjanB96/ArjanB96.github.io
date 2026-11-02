import { PORTAL, WILD, symColor } from './engine/config'

/** Kleuren per bemanning/symboolkleur: licht, donker */
export const HUES = [['#ff7a8a', '#a3001b'], ['#7fd4ff', '#1546b8'], ['#8dffa6', '#0b8a3a'], ['#fff2a8', '#b8860b']]

/** Gedeelde verlopen, één keer in de pagina zodat 30 vakjes niet elk hun eigen defs hebben */
export function SrDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        {HUES.map(([l, d], i) => <g key={i}>
          <radialGradient id={`sr-p${i}`} cx="35%" cy="30%"><stop offset="0" stopColor="#fff"/><stop offset=".25" stopColor={l}/><stop offset="1" stopColor={d}/></radialGradient>
          <linearGradient id={`sr-g${i}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff"/><stop offset=".3" stopColor={l}/><stop offset="1" stopColor={d}/></linearGradient>
        </g>)}
        <linearGradient id="sr-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff6c8"/><stop offset=".5" stopColor="#d4a017"/><stop offset="1" stopColor="#7a5a05"/></linearGradient>
        <radialGradient id="sr-portal"><stop offset="0" stopColor="#fff"/><stop offset=".25" stopColor="#e07bff"/><stop offset=".7" stopColor="#5a1a9e"/><stop offset="1" stopColor="#14002e"/></radialGradient>
      </defs>
    </svg>
  )
}

/** Symbool op het speelveld: planeet (laag), edelsteen (hoog), Bert-badge (wild) of sterrenpoort (scatter) */
export function SymbolArt({ s }: { s: number }) {
  if (s === WILD) return (
    <svg viewBox="0 0 100 100" className="sym wild" aria-label="Bert-badge (wild)">
      <circle cx="50" cy="50" r="40" fill="url(#sr-gold)" stroke="#7a5a05" strokeWidth="3"/>
      <circle cx="50" cy="50" r="31" fill="none" stroke="#fff6c8" strokeWidth="2" strokeDasharray="4 4"/>
      <text x="50" y="64" textAnchor="middle" fontFamily="Palatino Linotype,Georgia,serif" fontWeight="700" fontSize="42" fill="#5a0f1c">B</text>
      <path d="M82 14l3 7 7 3-7 3-3 7-3-7-7-3 7-3z M18 72l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#fff"/>
    </svg>)
  if (s === PORTAL) return (
    <svg viewBox="0 0 100 100" className="sym portal" aria-label="Sterrenpoort">
      <circle cx="50" cy="50" r="42" fill="url(#sr-portal)"/>
      <g className="swirl" fill="none" stroke="#fff" strokeLinecap="round" opacity=".85">
        <path d="M50 50 m0 -8 a8 8 0 1 1 -8 8 a16 16 0 1 1 16 16 a24 24 0 1 1 -24 -24" strokeWidth="3"/>
      </g>
      <circle cx="50" cy="50" r="42" fill="none" stroke="#e07bff" strokeWidth="3"/>
    </svg>)
  const c = symColor(s)
  if (s % 2 === 0) return (
    <svg viewBox="0 0 100 100" className="sym planet" aria-label="Planeet">
      <ellipse cx="50" cy="54" rx="46" ry="12" fill="none" stroke={HUES[c][0]} strokeWidth="4" opacity=".55" transform="rotate(-18 50 54)"/>
      <circle cx="50" cy="50" r="30" fill={`url(#sr-p${c})`}/>
      <circle cx="40" cy="58" r="5" fill="#0002"/><circle cx="60" cy="42" r="3.5" fill="#0002"/><circle cx="58" cy="62" r="2.5" fill="#0002"/>
      <path d="M8 62 A46 12 -18 0 0 92 40" fill="none" stroke={HUES[c][0]} strokeWidth="4" transform="rotate(-18 50 54) rotate(18 50 54)"/>
    </svg>)
  return (
    <svg viewBox="0 0 100 100" className="sym gem" aria-label="Edelsteen">
      <path d="M50 8 L84 32 L72 86 L28 86 L16 32Z" fill={`url(#sr-g${c})`} stroke="#fff" strokeWidth="2"/>
      <path d="M50 8 L50 86 M16 32 L84 32 M16 32 L50 50 L84 32 M28 86 L50 50 L72 86" stroke="#ffffff70" strokeWidth="1.5" fill="none"/>
      <path d="M36 20 L44 14 L40 30Z" fill="#fff" opacity=".8"/>
    </svg>)
}

/** De vier bemanningsleden, eigen ontwerp */
export function CrewArt({ c }: { c: number }) {
  if (c === 0) return ( // Kapitein Kreeftenschaar – ruimtepiraat
    <svg viewBox="0 0 100 100" className="crew-art" aria-hidden="true">
      <path d="M14 52 q-10 -14 2 -24 q4 10 12 8 q-6 8 -2 16z M86 52 q10 -14 -2 -24 q-4 10 -12 8 q6 8 2 16z" fill="#e8344a" stroke="#7a0012" strokeWidth="2"/>
      <ellipse cx="50" cy="64" rx="32" ry="24" fill="url(#sr-p0)" stroke="#7a0012" strokeWidth="2"/>
      <path d="M38 44 v-12 M62 44 v-12" stroke="#a3001b" strokeWidth="4"/>
      <circle cx="38" cy="30" r="8" fill="#fff"/><circle cx="39" cy="31" r="3.5" fill="#111"/>
      <circle cx="62" cy="30" r="8" fill="#111"/><path d="M52 24 L72 36" stroke="#111" strokeWidth="2"/>
      <path d="M30 22 Q50 2 70 22 Z" fill="#1a1a2e"/><rect x="28" y="20" width="44" height="5" rx="2" fill="#d4a017"/>
      <circle cx="50" cy="14" r="4" fill="#d4a017"/>
      <path d="M40 70 q10 8 20 0" stroke="#7a0012" strokeWidth="3" fill="none"/>
      <path d="M26 84 l-6 10 M36 87 l-3 10 M64 87 l3 10 M74 84 l6 10" stroke="#a3001b" strokeWidth="4" strokeLinecap="round"/>
    </svg>)
  if (c === 1) return ( // Blauwe Donny – blauwe alien met drie ogen
    <svg viewBox="0 0 100 100" className="crew-art" aria-hidden="true">
      <path d="M50 4 v14" stroke="#1546b8" strokeWidth="3"/><circle cx="50" cy="6" r="5" fill="#bff3ff" className="blink"/>
      <path d="M18 92 Q8 50 30 26 Q50 12 70 26 Q92 50 82 92 Q66 84 50 92 Q34 84 18 92Z" fill="url(#sr-p1)" stroke="#0b2e7a" strokeWidth="2"/>
      {[[34, 46], [50, 38], [66, 46]].map(([x, y]) => <g key={x}><circle cx={x} cy={y} r="8" fill="#fff"/><circle cx={x + 1} cy={y + 1} r="4" fill="#111"/></g>)}
      <path d="M36 66 q14 12 28 0" stroke="#0b2e7a" strokeWidth="3" fill="#0b2e7a"/>
      <circle cx="28" cy="62" r="4" fill="#ff9ad5" opacity=".6"/><circle cx="72" cy="62" r="4" fill="#ff9ad5" opacity=".6"/>
    </svg>)
  if (c === 2) return ( // Sjonnie Snotroggel – groen slijmwezen
    <svg viewBox="0 0 100 100" className="crew-art" aria-hidden="true">
      <path d="M14 80 Q10 30 50 22 Q90 30 86 80 Q86 92 78 86 Q74 96 66 88 Q58 98 50 88 Q42 98 34 88 Q26 96 22 86 Q14 92 14 80Z" fill="url(#sr-p2)" stroke="#065c25" strokeWidth="2"/>
      <circle cx="50" cy="48" r="15" fill="#fff"/><circle cx="53" cy="50" r="7" fill="#111"/><circle cx="56" cy="46" r="2.5" fill="#fff"/>
      <path d="M38 70 q12 10 24 0" stroke="#065c25" strokeWidth="3" fill="none"/><path d="M48 74 q4 8 8 0" fill="#ff6f91"/>
      <circle cx="26" cy="34" r="4" fill="#b8ffca" opacity=".8"/><circle cx="76" cy="30" r="3" fill="#b8ffca" opacity=".8"/>
    </svg>)
  return ( // Robo-Bert 3000 – gouden robot met Berts zonnebril en baard
    <svg viewBox="0 0 100 100" className="crew-art" aria-hidden="true">
      <path d="M50 4 v12" stroke="#7a5a05" strokeWidth="3"/><circle cx="50" cy="6" r="5" fill="#ff4d4d" className="blink"/>
      <rect x="22" y="16" width="56" height="46" rx="10" fill="url(#sr-gold)" stroke="#7a5a05" strokeWidth="2"/>
      <rect x="29" y="23" width="42" height="32" rx="6" fill="#1a1a2e"/>
      <rect x="32" y="30" width="15" height="9" rx="3" fill="#111" stroke="#7fd4ff"/><rect x="53" y="30" width="15" height="9" rx="3" fill="#111" stroke="#7fd4ff"/>
      <path d="M36 46 h28 v5 h-28z" fill="#c9c9cf"/>
      <rect x="14" y="30" width="8" height="16" rx="3" fill="#b8860b"/><rect x="78" y="30" width="8" height="16" rx="3" fill="#b8860b"/>
      <rect x="30" y="64" width="40" height="28" rx="6" fill="url(#sr-gold)" stroke="#7a5a05" strokeWidth="2"/>
      <path d="M36 66 Q50 82 64 66" stroke="#fff6c8" strokeWidth="3" fill="none"/><circle cx="50" cy="80" r="5" fill="#d4a017" stroke="#7a5a05"/>
    </svg>)
}

/** Berts ruimteschip */
export function Ship() {
  return (
    <svg viewBox="0 0 200 90" className="ship" aria-hidden="true">
      <path d="M8 46 Q20 30 40 40" stroke="#ff9a3c" strokeWidth="8" strokeLinecap="round" className="flame"/>
      <path d="M30 50 Q40 22 110 20 Q178 22 192 46 Q178 66 110 68 Q40 68 30 50Z" fill="url(#sr-gold)" stroke="#7a5a05" strokeWidth="3"/>
      <path d="M86 22 Q110 -6 140 22Z" fill="#7fd4ff" opacity=".85" stroke="#fff" strokeWidth="2"/>
      <path d="M40 48 H186" stroke="#a5101f" strokeWidth="6"/>
      {[70, 100, 130, 160].map(x => <circle key={x} cx={x} cy="58" r="4" fill="#fff6c8" className="blink"/>)}
      <text x="112" y="45" textAnchor="middle" fontFamily="Palatino Linotype,Georgia,serif" fontWeight="700" fontSize="14" fill="#5a0f1c">BC-1</text>
    </svg>
  )
}

/** Kapiteinspet voor Bert tijdens de Ruimte-expeditie */
export function CaptainHat() {
  return (
    <svg viewBox="0 0 120 60" className="cap" aria-hidden="true">
      <path d="M10 44 Q60 0 110 44Z" fill="#1a1a2e" stroke="#d4a017" strokeWidth="3"/>
      <path d="M6 44 h108 q-4 12 -54 12 q-50 0 -54 -12z" fill="#111"/>
      <path d="M50 26 l10 -10 l10 10 l-10 10z" fill="url(#sr-gold)"/>
      <path d="M20 44 Q60 36 100 44" stroke="#d4a017" strokeWidth="3" fill="none"/>
    </svg>
  )
}
