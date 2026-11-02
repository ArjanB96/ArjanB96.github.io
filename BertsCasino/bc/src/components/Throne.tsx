import { useId } from 'react'
import Bert, { Mood } from './Bert'

/** Gouden troon; front = zitting en armleuningen die vóór Bert komen */
function Throne({ front }: { front?: boolean }) {
  const id = useId().replace(/:/g, ''), tg = `url(#tg${id})`
  return (
    <svg viewBox="0 0 300 420" className={front ? 'throne front' : 'throne'} aria-hidden="true">
      <defs>
        <linearGradient id={`tg${id}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff2a8"/><stop offset=".5" stopColor="#d4a017"/><stop offset="1" stopColor="#7a5a05"/></linearGradient>
        <pattern id={`tuft${id}`} width="22" height="22" patternUnits="userSpaceOnUse"><rect width="22" height="22" fill="#8a0c22"/><path d="M0 0L22 22M22 0L0 22" stroke="#5e0616" strokeWidth="2"/><circle cx="11" cy="11" r="2.4" fill="#d4a017"/></pattern>
      </defs>
      {front ? <>
        <path d="M30 300 Q150 280 270 300 L262 340 Q150 322 38 340Z" fill="#8a0c22" stroke={tg} strokeWidth="4"/>
        <path d="M10 230 Q10 205 40 205 L52 205 L56 400 L22 400Z M290 230 Q290 205 260 205 L248 205 L244 400 L278 400Z" fill={tg}/>
        <circle cx="31" cy="214" r="16" fill={tg}/><circle cx="269" cy="214" r="16" fill={tg}/>
        <path d="M14 400 h50 l-6 18 h-38z M236 400 h50 l-6 18 h-38z" fill="#7a5a05"/>
      </> : <>
        <path d="M40 330 L40 80 Q40 20 150 8 Q260 20 260 80 L260 330Z" fill={tg}/>
        <path d="M60 320 L60 90 Q60 40 150 30 Q240 40 240 90 L240 320Z" fill={`url(#tuft${id})`}/>
        <path d="M110 6 L122 -18 L136 0 L150 -26 L164 0 L178 -18 L190 6Z" fill={tg}/>
        <circle cx="150" cy="-14" r="5" fill="#c4122f"/>
        <text x="150" y="80" textAnchor="middle" fontFamily="Palatino Linotype,Georgia,serif" fontSize="40" fontWeight="700" fill={tg}>B</text>
        <path d="M60 340 h180 v60 h-180z" fill="#5e0616"/>
      </>}
    </svg>
  )
}

/** Bert op zijn troon (homepage, roulette en de kamer van Bert) */
export default function SeatedBert({ mood, talking, said }: { mood: Mood; talking: boolean; said: string }) {
  return <div className="seat"><Throne/><div className="sbert"><Bert mood={mood} talking={talking} said={said}/></div><Throne front/></div>
}
