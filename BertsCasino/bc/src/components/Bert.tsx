export type Mood = 'idle' | 'win' | 'lose' | 'wow' | 'spin' | 'spit'
export default function Bert({ mood, talking, said }: { mood: Mood; talking: boolean; said: string }) {
  return (
    <div className={`bert m-${mood}`}>
      {said && <div className="bubble">{said}</div>}
      <svg viewBox="0 0 220 280" aria-label="Bert">
        <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff2a8"/><stop offset=".5" stopColor="#d4a017"/><stop offset="1" stopColor="#7a5a05"/></linearGradient></defs>
        <path d="M30 280 Q40 150 110 140 Q180 150 190 280Z" fill="#5a0f1c"/>
        <path d="M95 142 L110 230 L125 142Z" fill="#d9a77a"/>
        <g className="chains" fill="none" stroke="url(#g)" strokeWidth="5"><path d="M78 148 Q110 215 142 148"/><path d="M84 150 Q110 190 136 150"/><path d="M90 152 Q110 170 130 152" strokeWidth="3"/></g>
        <circle cx="110" cy="205" r="9" fill="url(#g)"/>
        <g className="head">
          <ellipse cx="62" cy="88" rx="9" ry="14" fill="#d9a77a"/><ellipse cx="158" cy="88" rx="9" ry="14" fill="#d9a77a"/>
          <ellipse cx="110" cy="80" rx="50" ry="60" fill="#e0b088"/>
          <ellipse cx="92" cy="40" rx="14" ry="7" fill="#fff" opacity=".35"/>
          <path d="M62 95 Q64 150 110 156 Q156 150 158 95 Q150 118 110 120 Q70 118 62 95Z" fill="#c9c9cf"/>
          <path d="M88 122 Q110 112 132 122" stroke="#aaa" strokeWidth="8" fill="none" strokeLinecap="round"/>
          <g className="shades"><rect x="68" y="68" width="38" height="24" rx="8" fill="#111"/><rect x="114" y="68" width="38" height="24" rx="8" fill="#111"/><path d="M106 76h8" stroke="url(#g)" strokeWidth="3"/><rect x="72" y="71" width="12" height="4" rx="2" fill="#fff" opacity=".4"/></g>
          <ellipse className="mouth" cx="110" cy="130" rx="11" ry={mood === 'spit' ? 10 : talking ? 6 : mood === 'win' ? 7 : 2.5} fill="#3a0b12"/>
          <path d="M104 100 Q110 108 116 100" stroke="#b8845c" strokeWidth="3" fill="none"/>
        </g>
        <g className="arm"><path d="M170 175 Q205 160 198 120" stroke="#5a0f1c" strokeWidth="26" fill="none" strokeLinecap="round"/><circle cx="198" cy="112" r="13" fill="#e0b088"/><circle cx="196" cy="112" r="5" fill="url(#g)"/>
          <rect x="196" y="100" width="28" height="7" rx="3" fill="#7b4a1e" transform="rotate(-25 196 104)"/><circle className="ember" cx="222" cy="94" r="3" fill="#ff6a00"/>
          <g className="smoke"><circle cx="224" cy="80" r="5"/><circle cx="230" cy="66" r="7"/><circle cx="224" cy="50" r="9"/></g></g>
        <g className="beer"><rect x="6" y="196" width="30" height="40" rx="4" fill="#e8a317" opacity=".95"/><rect x="6" y="190" width="30" height="12" rx="6" fill="#fff"/><path d="M36 205q14 0 14 12t-14 12" stroke="#ddd" strokeWidth="4" fill="none"/></g>
      </svg>
    </div>
  )
}
