import { WHEEL, colorOf } from './logic'
const S = 360 / 37, fill = { red: '#a5101f', black: '#111', green: '#0a7a3a' }
const pt = (a: number, r: number) => [200 + r * Math.sin((a * Math.PI) / 180), 200 - r * Math.cos((a * Math.PI) / 180)]
export default function Wheel({ deg, ball, r }: { deg: number; ball: number; r: number }) {
  const [bx, by] = pt(ball, r)
  return (
    <svg viewBox="0 0 400 400" className="wheel">
      <circle cx="200" cy="200" r="196" fill="#3b1a0b" stroke="#d4a017" strokeWidth="6"/>
      <circle cx="200" cy="200" r="150" fill="#2a1208" stroke="#d4a017" strokeWidth="2"/>
      <g transform={`rotate(${deg} 200 200)`}>
        {WHEEL.map((n, i) => { const [x1, y1] = pt(i * S - S / 2, 150), [x2, y2] = pt(i * S + S / 2, 150), [x3, y3] = pt(i * S + S / 2, 108), [x4, y4] = pt(i * S - S / 2, 108), [tx, ty] = pt(i * S, 128)
          return <g key={n}><path d={`M${x1} ${y1}L${x2} ${y2}L${x3} ${y3}L${x4} ${y4}Z`} fill={fill[colorOf(n)]} stroke="#d4a017" strokeWidth=".8"/>
            <text x={tx} y={ty} fill="#fff" fontSize="11" textAnchor="middle" dominantBaseline="middle" transform={`rotate(${i * S} ${tx} ${ty})`}>{n}</text></g> })}
        <circle cx="200" cy="200" r="104" fill="#5a0f1c" stroke="#d4a017" strokeWidth="3"/>
        <circle cx="200" cy="200" r="30" fill="#d4a017"/><path d="M200 120v160M120 200h160" stroke="#d4a017" strokeWidth="5"/>
      </g>
      <circle cx={bx} cy={by} r="6" fill="#fff" stroke="#999"/>
    </svg>
  )
}
