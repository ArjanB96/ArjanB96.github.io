import { WHEEL, colorOf } from './logic'
const S = 360 / 37, fill = { red: '#a5101f', black: '#111', green: '#0a7a3a' }
const pt = (a: number, r: number) => [200 + r * Math.sin((a * Math.PI) / 180), 200 - r * Math.cos((a * Math.PI) / 180)]
/** Ruitjes op de baan waar het balletje tegenaan kaatst (staan stil, draaien niet mee) */
const DIAMONDS = Array.from({ length: 8 }, (_, i) => i * 45 + 22.5)
/** ball = hoek in graden (null = geen balletje op het wiel), r = afstand tot het midden */
export default function Wheel({ deg, ball, r }: { deg: number; ball: number | null; r: number }) {
  const [bx, by] = ball === null ? [0, 0] : pt(ball, r)
  return (
    <svg viewBox="0 0 400 400" className="wheel">
      <defs>
        <radialGradient id="wood"><stop offset=".7" stopColor="#5a2a10"/><stop offset="1" stopColor="#2a0f04"/></radialGradient>
        <radialGradient id="track"><stop offset=".75" stopColor="#1a0a04"/><stop offset=".95" stopColor="#4a2410"/></radialGradient>
        <radialGradient id="cone"><stop offset="0" stopColor="#8a1a2c"/><stop offset="1" stopColor="#3a0812"/></radialGradient>
        <radialGradient id="ballg" cx="35%" cy="35%"><stop offset="0" stopColor="#fff"/><stop offset=".6" stopColor="#e8e8e8"/><stop offset="1" stopColor="#999"/></radialGradient>
        <linearGradient id="metal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff2a8"/><stop offset=".5" stopColor="#d4a017"/><stop offset="1" stopColor="#7a5a05"/></linearGradient>
      </defs>
      <circle cx="200" cy="200" r="196" fill="url(#wood)" stroke="#d4a017" strokeWidth="6"/>
      <circle cx="200" cy="200" r="188" fill="url(#track)" stroke="#d4a01788" strokeWidth="1"/>
      {DIAMONDS.map(a => { const [x, y] = pt(a, 164); return <rect key={a} x={x - 4} y={y - 4} width="8" height="8" fill="url(#metal)" transform={`rotate(${a + 45} ${x} ${y})`}/> })}
      <circle cx="200" cy="200" r="151" fill="#120604" stroke="#d4a017" strokeWidth="2"/>
      <g transform={`rotate(${deg} 200 200)`}>
        {WHEEL.map((n, i) => { const [x1, y1] = pt(i * S - S / 2, 150), [x2, y2] = pt(i * S + S / 2, 150), [x3, y3] = pt(i * S + S / 2, 108), [x4, y4] = pt(i * S - S / 2, 108), [tx, ty] = pt(i * S, 142)
          return <g key={n}><path d={`M${x1} ${y1}L${x2} ${y2}L${x3} ${y3}L${x4} ${y4}Z`} fill={fill[colorOf(n)]} stroke="#d4a017" strokeWidth="1"/>
            <text x={tx} y={ty} fill="#fff" fontSize="9" fontWeight="700" textAnchor="middle" dominantBaseline="middle" transform={`rotate(${i * S} ${tx} ${ty})`}>{n}</text></g> })}
        <circle cx="200" cy="200" r="134" fill="none" stroke="#d4a017" strokeWidth="1.2"/>
        <circle cx="200" cy="200" r="106" fill="url(#cone)" stroke="#d4a017" strokeWidth="3"/>
        <g stroke="url(#metal)" strokeWidth="6" strokeLinecap="round"><path d="M200 140v120M140 200h120"/></g>
        {[[200, 140], [200, 260], [140, 200], [260, 200]].map(([x, y]) => <circle key={x + '-' + y} cx={x} cy={y} r="7" fill="url(#metal)"/>)}
        <circle cx="200" cy="200" r="24" fill="url(#metal)" stroke="#7a5a05"/><circle cx="200" cy="200" r="8" fill="#fff2a8"/>
      </g>
      {ball !== null && <g><circle cx={bx + 2} cy={by + 3} r="6" fill="#000" opacity=".4"/><circle cx={bx} cy={by} r="6" fill="url(#ballg)"/></g>}
    </svg>
  )
}
