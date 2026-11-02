import { FormEvent, useEffect, useState } from 'react'
import SeatedBert from './Throne'
import { Chandelier } from './Decor'
import { WHEEL, colorOf } from '../games/roulette/logic'
import { DRINKS, DrinkId, LADY, line, load, save, speak } from '../services'
import { doorSound } from '../services/music'

/** Entree: grote deuren gaan open, je loopt de kamer van Bert in, daarna pas naar de tafel */
const ARRIVE = 3600
/** Na het kiezen van je drankje (ms): meisje loopt naar de bar, pakt het, komt terug; daarna de 'bana'-opmerking */
const FETCH_AT = 1500, AT_BAR = 1200, BACK = 3400
/** Leestijd van een tekstballon: giechel + ±75 ms per teken, met een pauze erna (PAUSE) */
const PAUSE = 1500, readTime = (t: string) => 1200 + t.length * 75 + PAUSE
const GIGGLE = { pitch: 1.9, rate: 1.35 }
const S = 360 / 37, fill = { red: '#a5101f', black: '#111', green: '#0a7a3a' }

const heart = (x: number, y: number, s = 1) => `M${x} ${y + 2 * s}c${-3 * s} ${-4 * s} ${-8 * s} 0 0 ${6 * s}c${8 * s} ${-6 * s} ${3 * s} ${-10 * s} 0 ${-6 * s}z`
/** Verliefde dame in bikini; hoofd gekanteld richting Bert (flip = rechts van de troon) */
function Lady({ suit, hair, skin, flip, delay, said, extra = '', hold }: { suit: string; hair: string; skin: string; flip?: boolean; delay: number; said?: string; extra?: string; hold?: string }) {
  return (
    <div className={`ladybox ${extra}`}>
      {said && <div className="bubble">{said}</div>}
      {hold && <span className="hold">{hold}</span>}
      <svg viewBox="0 0 120 300" className={flip ? 'lady flip' : 'lady'} style={{ animationDelay: `${delay}s` }} aria-hidden="true">
        <g className="hearts" fill="#ff2d6f">{[[30, 20, 0], [92, 8, 1.1], [64, -6, 2.2]].map(([x, y, d]) => <path key={x} d={heart(x, y, 1.4)} style={{ animationDelay: `${d + delay}s` }}/>)}</g>
        <ellipse cx="62" cy="56" rx="32" ry="40" fill={hair}/>
        <path d="M30 66 Q24 120 38 138 L46 96Z M94 66 Q100 120 86 138 L78 96Z" fill={hair}/>
        <rect x="55" y="78" width="11" height="20" fill={skin}/>
        <path d="M42 98 Q60 92 78 98 L80 150 Q82 172 78 188 L42 188 Q38 172 40 150Z" fill={skin}/>
        <path d="M44 186 L57 186 L55 286 L46 286Z M63 186 L76 186 L74 286 L65 286Z" fill={skin}/>
        <path d="M43 284 h14 l2 8 h-18z M63 284 h14 l2 8 h-18z" fill="#c4122f"/>
        <path d="M44 112 L58 112 L52 128Z M62 112 L76 112 L68 128Z" fill={suit}/><path d="M42 112 h36" stroke={suit} strokeWidth="2"/>
        <path d="M42 178 L78 178 L66 198 L54 198Z" fill={suit}/>
        <path d="M80 102 Q98 118 94 140" stroke={skin} strokeWidth="7" fill="none" strokeLinecap="round"/>
        <path d="M86 120 l14 0 l-7 12z" fill="#fff4c0" stroke="#fff" strokeWidth=".8" opacity=".9"/><path d="M93 132v10M88 143h10" stroke="#fff" strokeWidth="1.5"/>
        <path d="M40 102 Q28 130 36 156" stroke={skin} strokeWidth="7" fill="none" strokeLinecap="round"/>
        <g transform="rotate(10 60 80)">
          <ellipse cx="60" cy="60" rx="19" ry="23" fill={skin}/>
          <path d="M40 52 Q48 28 78 40 Q70 30 60 30 Q40 30 40 52Z" fill={hair}/>
          <path d={heart(53, 54, 1.1)} fill="#e0103c"/><path d={heart(67, 54, 1.1)} fill="#e0103c"/>
          <ellipse cx="47" cy="68" rx="5" ry="3" fill="#ff7a9a" opacity=".7"/><ellipse cx="73" cy="68" rx="5" ry="3" fill="#ff7a9a" opacity=".7"/>
          <path d="M54 72 Q60 79 66 72" stroke="#c4122f" strokeWidth="3" fill="#c4122f"/>
          <circle cx="41" cy="66" r="2.5" fill="#fff2a8"/><circle cx="79" cy="66" r="2.5" fill="#fff2a8"/>
        </g>
      </svg>
    </div>
  )
}

/** Bar links van de dames: toog met flessen, glazen en een biertap */
function Bar() {
  return (
    <svg viewBox="0 0 180 200" className="sbar" aria-hidden="true">
      <rect x="6" y="20" width="168" height="8" rx="2" fill="#d4a017"/><rect x="6" y="62" width="168" height="8" rx="2" fill="#d4a017"/>
      {[['#3a1a06', 16], ['#0b5d2a', 38], ['#e8e2c8', 58], ['#7a1426', 80], ['#c9781a', 102], ['#2a4fa3', 124], ['#3a1a06', 146]].map(([c, x], i) =>
        <g key={i}><rect x={+x} y={i % 2 ? -4 : -10} width="12" height={i % 2 ? 24 : 30} rx="4" fill={c as string} stroke="#fff3" /><rect x={+x + 4} y={i % 2 ? -10 : -16} width="4" height="8" fill={c as string}/></g>)}
      {[20, 46, 72, 98, 124, 150].map(x => <path key={x} d={`M${x} 40h14l-3 22h-8z`} fill="#e9f6ff99" stroke="#fff8"/>)}
      <rect y="96" width="180" height="8" fill="#d4a017"/>
      <path d="M4 104 h172 l-6 96 h-160z" fill="#3b1a0b" stroke="#d4a017" strokeWidth="3"/>
      {[30, 70, 110, 150].map(x => <rect key={x} x={x - 14} y="116" width="28" height="70" rx="4" fill="none" stroke="#d4a01788" strokeWidth="2"/>)}
      <path d="M140 96 v-22 h10 v22" fill="#c9c9cf" stroke="#888"/><rect x="138" y="70" width="14" height="6" rx="2" fill="#d4a017"/>
    </svg>
  )
}

function Table() {
  return (
    <svg viewBox="0 0 800 220" className="etable" aria-hidden="true">
      <ellipse cx="400" cy="120" rx="390" ry="96" fill="#3b1a0b" stroke="#d4a017" strokeWidth="5"/>
      <ellipse cx="400" cy="114" rx="360" ry="80" fill="#0a5c2e"/>
      <g transform="translate(560 112) scale(1 .38)">
        <circle r="96" fill="#2a0f04" stroke="#d4a017" strokeWidth="5"/>
        <g className="espin">
          {WHEEL.map((n, i) => { const a = ((i * S - S / 2) * Math.PI) / 180, b = ((i * S + S / 2) * Math.PI) / 180
            return <path key={n} d={`M${80 * Math.sin(a)} ${-80 * Math.cos(a)}A80 80 0 0 1 ${80 * Math.sin(b)} ${-80 * Math.cos(b)}L${52 * Math.sin(b)} ${-52 * Math.cos(b)}A52 52 0 0 0 ${52 * Math.sin(a)} ${-52 * Math.cos(a)}Z`} fill={fill[colorOf(n)]} stroke="#d4a017" strokeWidth="1"/> })}
          <circle r="50" fill="#5a0f1c" stroke="#d4a017" strokeWidth="3"/><path d="M-30 0h60M0 -30v60" stroke="#d4a017" strokeWidth="6"/>
        </g>
      </g>
      <g stroke="#fffa" strokeWidth="2" fill="none">
        <path d="M150 80 L420 80 L440 150 L120 150Z"/>{[1, 2, 3, 4, 5].map(i => <path key={i} d={`M${150 + i * 45} 80 L${120 + i * 53.3} 150`}/>)}<path d="M135 115 L430 115"/>
      </g>
      {[[230, 98, '#a5101f'], [300, 130, '#1d4fa3'], [372, 100, '#111'], [190, 132, '#d9731a']].map(([x, y, c]) =>
        <g key={x}><ellipse cx={x} cy={+y + 4} rx="13" ry="6" fill="#0006"/><ellipse cx={x} cy={y} rx="13" ry="6" fill={c as string} stroke="#fff" strokeWidth="2" strokeDasharray="4 3"/></g>)}
    </svg>
  )
}

/** Eigen state, zodat typen niet telkens de hele kamer opnieuw tekent (belangrijk op mobiel) */
function NameForm({ onName }: { onName: (n: string) => void }) {
  const [v, setV] = useState(() => load().name || '')
  // Alleen met muis/trackpad direct focussen; op een telefoon zou het toetsenbord meteen de scène bedekken
  const desk = typeof matchMedia !== 'undefined' && matchMedia('(pointer: fine)').matches
  const submit = (e: FormEvent) => { e.preventDefault(); onName(v.trim().slice(0, 20)) }
  return (
    <form className="ask askname" onSubmit={submit}>
      <input autoFocus={desk} maxLength={20} value={v} onChange={e => setV(e.target.value)} placeholder="Je naam" aria-label="Je naam"
        autoCapitalize="words" autoComplete="nickname" autoCorrect="off" spellCheck={false} enterKeyHint="go"/>
      <button className="btn spin">Dat ben ik</button>
    </form>
  )
}

export default function Entrance({ onDone }: { onDone: () => void }) {
  // Stappen: binnenlopen → naam → drankje → aan tafel
  const [step, setStep] = useState<'walk' | 'name' | 'drink' | 'done'>('walk'), [said, setSaid] = useState(''), [lady, setLady] = useState('')
  const [name, setName] = useState(''), [drink, setDrink] = useState<DrinkId>('bier'), [fetch, setFetch] = useState(''), [hold, setHold] = useState(''), [serve, setServe] = useState('')
  const on = load().speech
  const bert = (t: string) => { setSaid(t); speak(t, on) }
  useEffect(() => {
    if (on) doorSound()
    const t = setTimeout(() => { setStep('name'); bert(line('ask')) }, ARRIVE)
    return () => { clearTimeout(t); speechSynthesis?.cancel?.() }
  }, [])
  useEffect(() => { if (step !== 'done') return
    const sv = line('serve')
    const ts = [
      setTimeout(() => setFetch('fetch'), FETCH_AT),
      setTimeout(() => setHold(DRINKS[drink].icon), FETCH_AT + AT_BAR),
      setTimeout(() => { setSaid(''); setServe(sv); speak('Hihihihi!', on, GIGGLE, true); speak(sv, on, LADY, true) }, FETCH_AT + BACK),
      setTimeout(() => { const s = line('lady'); setServe(''); setLady(s); speak(s, on, LADY, true) }, FETCH_AT + BACK + readTime(sv))]
    return () => ts.forEach(clearTimeout) }, [step])
  const giveName = (n: string) => {
    if (!n) return bert('Kom op, gewoon je naam, swa!')
    save({ name: n }); setName(n); setStep('drink'); bert(`Ah ${n}! Natuurlijk, Volgens mij heb ik je ma nog een keertje geketst op Zuidplein. Wat wil je sippen?`) }
  const giveDrink = (d: DrinkId) => { save({ drink: d }); setDrink(d); setStep('done'); bert(`Een ${DRINKS[d].label} voor ${name}! Dames, fix dat.`) }
  return (
    <div className={`entrance ${step !== 'walk' ? 'here' : ''}`}>
      <div className="walk"><div className="sroom">
        <div className="swall"/><div className="sfloor"/>
        <div className="scurtain l"/><div className="scurtain r"/>
        <Chandelier className="schand"/>
        <div className="court">
          <Bar/>
          <Lady suit="#111" hair="#f2d16b" skin="#f1c9a5" delay={0} extra={fetch} hold={hold} said={serve}/>
          <Lady suit="#e0103c" hair="#2a160c" skin="#c98b5e" delay={-1.2} said={lady}/>
          <SeatedBert mood={lady || serve ? 'wow' : said ? 'win' : 'idle'} talking={!!said} said={said}/>
          <Lady suit="#d4a017" hair="#7a1d0c" skin="#e8b48c" flip delay={-0.6}/>
          <Lady suit="#7b2f9e" hair="#111" skin="#8a5a3c" flip delay={-1.8}/>
        </div>
        <Table/>
      </div></div>
      <div className="bigdoors"><div className="bd l"><i/></div><div className="bd r"><i/></div></div>
      {step !== 'walk' && <div className="arrive"><h2 className="logo">De kamer van <span>Bert</span></h2></div>}
      {step === 'name' && <NameForm onName={giveName}/>}
      {step === 'drink' && <div className="ask">{(Object.keys(DRINKS) as DrinkId[]).map(d => <button key={d} className="btn drink" onClick={() => giveDrink(d)}><span>{DRINKS[d].icon}</span>{DRINKS[d].label}</button>)}</div>}
      {step === 'done' && <button className="btn spin go" onClick={onDone}>🎰 Neem plaats aan de tafel</button>}
      {step === 'walk' && <button className="btn skip" onClick={onDone}>Overslaan ⏭</button>}
    </div>
  )
}
