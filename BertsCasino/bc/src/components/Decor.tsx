/** Foute gangster-zaal achter alles: panterprint, rood hoogpolig tapijt, fluwelen gordijnen en kroonluchters */
import { useId } from 'react'
const ARMS = [-70, -40, 40, 70]
export function Chandelier({ className = '' }: { className?: string }) {
  const id = useId().replace(/:/g, ''), cg = `url(#cg${id})`
  return (
    <svg viewBox="0 0 200 230" className={`chandelier ${className}`} aria-hidden="true">
      <defs>
        <linearGradient id={`cg${id}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff2a8"/><stop offset=".5" stopColor="#d4a017"/><stop offset="1" stopColor="#7a5a05"/></linearGradient>
        <radialGradient id={`glow${id}`}><stop offset="0" stopColor="#fff6c8"/><stop offset=".35" stopColor="#ffd36a" stopOpacity=".7"/><stop offset="1" stopColor="#ffb000" stopOpacity="0"/></radialGradient>
      </defs>
      <path d="M100 0v62" stroke={cg} strokeWidth="3" strokeDasharray="6 3"/>
      <ellipse cx="100" cy="150" rx="95" ry="70" fill={`url(#glow${id})`} className="halo"/>
      {ARMS.map(x => <path key={x} d={`M100 118 Q${100 + x * 0.6} 150 ${100 + x} 104`} stroke={cg} strokeWidth="4" fill="none"/>)}
      <path d="M100 118 Q100 150 100 104" stroke={cg} strokeWidth="4"/>
      <ellipse cx="100" cy="122" rx="46" ry="9" fill={cg}/>
      <path d="M86 70h28l-6 52h-16z" fill={cg}/>
      {[...ARMS, 0].map(x => <g key={x} className="flame"><rect x={96 + x} y="90" width="8" height="14" rx="2" fill="#fff8e6"/><ellipse cx={100 + x} cy="86" rx="4" ry="7" fill="#ffd36a"/></g>)}
      {Array.from({ length: 11 }, (_, i) => { const x = 58 + i * 8.4, l = 14 + 18 * Math.sin((i / 10) * Math.PI)
        return <g key={i}><path d={`M${x} 128v${l}`} stroke="#fff8" strokeWidth=".8"/><path d={`M${x} ${128 + l}l4 7-4 9-4-9z`} fill="#e9f6ff" stroke="#9cd" strokeWidth=".6" className="crystal"/></g> })}
      <path d="M100 131v40" stroke="#fff8"/><path d="M100 171l6 10-6 14-6-14z" fill="#e9f6ff" stroke="#9cd" className="crystal"/>
    </svg>
  )
}
export default function Decor() {
  return (
    <div className="decor" aria-hidden="true">
      <div className="wall" /><div className="carpet" />
      <div className="drape l" /><div className="drape r" />
      <Chandelier className="ch-l" /><Chandelier className="ch-r" />
    </div>
  )
}
