import { HorseId } from '../engine/horses'

/** Uiterlijk per paard: vacht, manen, hoeven */
const LOOK: Record<HorseId, { coat: string; shade: string; mane: string; hoof: string }> = {
  schlong: { coat: '#4a2a14', shade: '#2e190b', mane: '#111', hoof: '#222' },
  anabool: { coat: '#8b5a2b', shade: '#5e3a1a', mane: '#2a160c', hoof: '#d4a017' },
  smokkel: { coat: '#8c7b6b', shade: '#5f5246', mane: '#3a3029', hoof: '#333' },
  dekhengst: { coat: '#b5651d', shade: '#7c4010', mane: '#f2d16b', hoof: '#333' },
  tollie: { coat: '#e3c16f', shade: '#b8913a', mane: '#ff5fa2', hoof: '#555' },
  leroy: { coat: '#6b3f22', shade: '#4a2a14', mane: '#2a160c', hoof: '#3a2a1a' },
}

/** Eén been, scharnierend in de heup/schouder; 'far' = het been aan de andere kant (donkerder) */
function Leg({ x, y, color, hoof, far, front, className }: { x: number; y: number; color: string; hoof: string; far?: boolean; front?: boolean; className: string }) {
  return (
    <g className={className} style={{ transformOrigin: `${x}px ${y}px` }}>
      <path d={front ? `M${x - 5} ${y} L${x - 3} ${y + 22} L${x + 1} ${y + 38} L${x + 6} ${y + 38} L${x + 4} ${y + 22} L${x + 6} ${y}Z`
        : `M${x - 7} ${y} Q${x - 10} ${y + 16} ${x - 2} ${y + 24} L${x - 1} ${y + 38} L${x + 5} ${y + 38} L${x + 5} ${y + 22} Q${x + 8} ${y + 8} ${x + 6} ${y}Z`}
        fill={color} opacity={far ? 0.75 : 1}/>
      <rect x={x - 2} y={y + 36} width="9" height="5" rx="1.5" fill={hoof}/>
    </g>
  )
}

/** Paard van opzij (kijkt naar rechts) met jockey. Benen, manen en staart worden met CSS geanimeerd. */
export default function HorseArt({ id, silks, no, jockey = true }: { id: HorseId; silks: string; no: number; jockey?: boolean }) {
  const L = LOOK[id]
  return (
    <svg viewBox="0 0 170 112" className={`horse h-${id}`} aria-hidden="true">
      {/* staart */}
      <path className="tail" d="M30 44 Q8 46 6 70 Q14 60 18 74 Q22 58 32 52Z" fill={L.mane} style={{ transformOrigin: '30px 46px' }}/>
      {/* benen aan de verre kant */}
      <Leg x={42} y={62} color={L.shade} hoof={L.hoof} far className="leg bl2"/>
      <Leg x={110} y={62} color={L.shade} hoof={L.hoof} far front className="leg fl2"/>
      {/* lijf */}
      <path d="M28 46 Q30 32 52 32 L104 32 Q122 32 124 50 Q124 68 104 70 L48 70 Q28 70 28 46Z" fill={L.coat}/>
      {id === 'anabool' && <g fill="#a87038" opacity=".8"><ellipse cx="46" cy="50" rx="14" ry="12"/><ellipse cx="108" cy="52" rx="11" ry="12"/><path d="M60 64 q20 6 40 0" stroke="#5e3a1a" strokeWidth="2" fill="none"/></g>}
      {id === 'dekhengst' && <path d="M40 38 Q70 30 104 36" stroke="#ffd9a8" strokeWidth="4" fill="none" opacity=".7"/>}
      {id === 'smokkel' && <g stroke="#2a2420" strokeWidth="1.6" fill="none"><path d="M40 48 l6 -6 l6 6 l-6 6z"/><path d="M46 42 v12"/></g>}
      {id === 'leroy' && <g fill="#f4efe6">
        <path d="M44 34 Q58 30 64 38 Q70 48 60 54 Q50 60 44 52 Q36 44 44 34Z"/>
        <path d="M82 44 Q92 38 100 46 Q106 56 96 62 Q86 66 84 58 Q76 52 82 44Z"/>
        <path d="M30 52 Q34 46 40 52 Q42 62 34 66 Q28 62 30 52Z"/>
        <path d="M70 60 Q78 58 80 66 L66 68 Q64 62 70 60Z"/>
      </g>}
      {/* hals en hoofd */}
      <path d="M100 48 Q104 30 124 16 Q132 10 140 14 L158 30 Q164 38 156 42 L144 40 Q136 44 126 54 Q116 62 104 60Z" fill={L.coat}/>
      {id === 'leroy' && <g fill="#f4efe6">
        <path d="M140 16 Q150 18 156 30 Q160 38 152 40 Q146 34 144 26 Q138 22 140 16Z"/>
        <path d="M112 38 Q120 30 126 38 Q124 46 116 48 Q110 46 112 38Z"/>
      </g>}
      {id === 'schlong' && <g stroke="#0d0905" strokeWidth="1.4" fill="none" opacity=".9"><path d="M110 44 q4 -6 8 0 t8 0"/><path d="M114 50 l4 4 l4 -4"/></g>}
      {/* oor, oog, neusgat */}
      <path d="M128 14 L130 2 L136 12Z" fill={L.shade}/>
      <circle cx="142" cy="24" r="2.6" fill="#111"/>
      {id === 'leroy' && <path d="M138.5 22.5 Q142 20 145.5 22.5" stroke={L.coat} strokeWidth="2.6" fill="none"/>}
      <circle cx="156" cy="36" r="1.4" fill="#111"/>
      {/* manen */}
      <path className="mane" style={{ transformOrigin: '120px 20px' }} fill={L.mane} d={
        id === 'dekhengst' ? 'M100 46 Q96 20 120 10 Q134 2 140 10 Q128 8 124 18 Q112 28 112 46Z'
        : id === 'tollie' ? 'M100 46 L92 30 L106 34 L98 18 L114 26 L112 8 L122 20 L130 4 L130 18 Q116 30 112 46Z'
        : id === 'smokkel' ? 'M100 46 L96 34 L104 36 L100 24 L110 28 L110 16 L118 22 L124 10 L126 18 Q114 30 110 46Z'
        : id === 'schlong' ? 'M100 46 Q98 26 114 16 Q124 6 138 8 Q126 14 122 22 Q112 32 110 46Z'
        : 'M100 46 Q100 28 116 18 Q124 12 130 12 Q122 20 118 26 Q110 36 110 46Z'}/>
      {/* accessoires */}
      {(id === 'schlong' || id === 'anabool' || id === 'smokkel' || id === 'leroy' || id === 'dekhengst') &&
        <g fill="none" stroke="#d4a017" strokeLinecap="round"><path d="M108 46 Q118 60 130 48" strokeWidth={id === 'schlong' ? 4 : 2.5}/>{id === 'schlong' && <path d="M106 50 Q118 68 132 52" strokeWidth="3"/>}</g>}
      {id === 'schlong' && <rect x="136" y="20" width="14" height="7" rx="2" fill="#111"/>}
      {id === 'anabool' && <path d="M135 20 h17 l-2 6 h-14z" fill="#1d4fa3" stroke="#bfe8ff" strokeWidth="1"/>}
      {id === 'smokkel' && <rect x="136" y="20" width="14" height="6" rx="1" fill="#2a2a2a" stroke="#666"/>}
      {id === 'tollie' && <g><rect x="134" y="16" width="15" height="7" rx="2" fill="#2fd3ff" transform="rotate(-14 140 20)"/><path d="M126 6 L134 -10 L140 6Z" fill="#ff5fa2"/><circle cx="134" cy="-10" r="3" fill="#ffd36a"/><path d="M158 40 q4 6 0 10" stroke="#ff7aa0" strokeWidth="4" fill="none" strokeLinecap="round"/></g>}
      {id === 'dekhengst' && <path d="M126 12 L130 2 L134 10 L138 0 L140 12Z" fill="#d4a017"/>}
      {id === 'leroy' && <g className="sjekkie">
        <path d="M156 41 L190 47" stroke="#f4f0e6" strokeWidth="2.2" strokeLinecap="round"/>
        <circle cx="190" cy="47" r="1.8" fill="#ff6a00" className="ember"/>
        <g className="smoke" fill="#e8e8e8"><circle cx="192" cy="40" r="3"/><circle cx="196" cy="32" r="4"/><circle cx="192" cy="22" r="5"/></g>
      </g>}
      {/* jockey */}
      {jockey && <g className="jockey" style={{ transformOrigin: '76px 32px' }}>
        <path d="M64 32 Q66 18 76 14 Q86 16 88 30Z" fill={silks}/>
        <path d="M84 20 L102 30" stroke={silks} strokeWidth="4" strokeLinecap="round"/>
        <circle cx="80" cy="9" r="6.5" fill="#f1c9a5"/><path d="M73 8 Q80 -2 87 8Z" fill={silks}/>
        <path d="M74 30 L72 42" stroke="#fff" strokeWidth="4" strokeLinecap="round"/>
        <text x="76" y="28" textAnchor="middle" fontSize="9" fontWeight="700" fill="#fff" fontFamily="Georgia,serif">{no}</text>
      </g>}
      {/* benen aan de dichte kant */}
      <Leg x={48} y={62} color={L.coat} hoof={L.hoof} className="leg bl1"/>
      <Leg x={104} y={62} color={L.coat} hoof={L.hoof} front className="leg fl1"/>
      {id === 'leroy' && <path d="M100 74 Q106 72 108 80 L100 84Z" fill="#f4efe6"/>}
    </svg>
  )
}
