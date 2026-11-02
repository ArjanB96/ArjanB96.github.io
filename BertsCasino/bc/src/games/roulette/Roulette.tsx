import { useEffect, useMemo, useRef, useState } from 'react'
import { Mood } from '../../components/Bert'
import SeatedBert from '../../components/Throne'
import Wheel from './Wheel'
import { Bet, WHEEL, buildTargets, colorOf, payout, spinResult } from './logic'
import { DRINKS, START, line, load, resetState, save, speak } from '../../services'
import { sfx } from '../../services/music'

const CHIPS = [1, 5, 10, 25, 50, 100, 500]
/** Balletje: baan langs de rand, straal van de vakjes, vluchttijd uit Berts mond en rol-/stuitertijd (ms) */
const S = 360 / 37, TRACK = 176, POCKET = 121, FLY = 900, ROLL = 9000
export default function Roulette({ onExit }: { onExit: () => void }) {
  const init = useMemo(load, [])
  const [bal, setBal] = useState(init.balance), [hist, setHist] = useState<number[]>(init.history), [speech, setSpeech] = useState(init.speech)
  const [chip, setChip] = useState(5), [bets, setBets] = useState<Record<string, Bet>>({}), [stack, setStack] = useState<string[]>([])
  const [last, setLast] = useState<Bet[]>([]), [erase, setErase] = useState(false), [busy, setBusy] = useState(false)
  const [res, setRes] = useState<number | null>(null), [net, setNet] = useState<number | null>(null)
  const [mood, setMood] = useState<Mood>('idle'), [said, setSaid] = useState(''), [talk, setTalk] = useState(false)
  const [anim, setAnim] = useState<{ deg: number; ball: number | null; r: number }>({ deg: 0, ball: null, r: TRACK })
  const [fly, setFly] = useState<{ x: number; y: number; s: number } | null>(null), stage = useRef<HTMLDivElement>(null)
  const deg0 = useRef(0), idle = useRef(0)
  const targets = useMemo(buildTargets, [])
  const total = Object.values(bets).reduce((s, b) => s + b.amount, 0)
  const free = bal - total

  const say = (t: string, m: Mood = 'idle') => { setSaid(t); setMood(m); setTalk(true); speak(t, speech); setTimeout(() => setTalk(false), 1800); window.clearTimeout(idle.current)
    idle.current = window.setTimeout(() => { setMood('idle'); setSaid('') }, 5000) }
  useEffect(() => { say(line('welcome')); return () => { window.clearTimeout(idle.current); speechSynthesis?.cancel?.() } }, [])
  useEffect(() => { save({ balance: bal, sound: true, speech, history: hist }) }, [bal, speech, hist])
  useEffect(() => { if (busy) return; const t = setTimeout(() => say(line('idle')), 30000); return () => clearTimeout(t) }, [said, busy])

  const place = (t: { nums: number[]; label: string; cx: number; cy: number }) => {
    if (busy) return
    const key = t.nums.join(',')
    if (erase) { setBets(b => { const n = { ...b }; delete n[key]; return n }); setStack(s => s.filter(k => k !== key)); return }
    if (chip > free) { say('Niet genoeg saldo, pikkie!'); return }
    setBets(b => ({ ...b, [key]: { key, nums: t.nums, label: t.label, cx: t.cx, cy: t.cy, amount: (b[key]?.amount || 0) + chip } }))
    setStack(s => [...s, key])
    if (chip >= 100) say(line('big'), 'wow')
  }
  const undo = () => { const k = stack[stack.length - 1]; if (!k || busy) return
    setBets(b => { const n = { ...b }; const bt = n[k]; if (bt.amount > chip) n[k] = { ...bt, amount: bt.amount - chip }; else delete n[k]; return n }); setStack(s => s.slice(0, -1)) }
  const clear = () => { if (!busy) { setBets({}); setStack([]) } }
  const repeat = () => { if (busy || !last.length) return; const t = last.reduce((s, b) => s + b.amount, 0); if (t > bal) return say('Dat kan je niet betalen, a neef!')
    setBets(Object.fromEntries(last.map(b => [b.key, b]))); setStack(last.map(b => b.key)) }
  const reset = () => { if (!confirm('Alles terug naar €1.000 en geschiedenis wissen?')) return
    const s = resetState(load()); setBal(s.balance); setHist(s.history); setBets({}); setStack([]); setRes(null); setNet(null) }

  const spin = () => {
    if (busy || total === 0) return say('Eerst een inzet, pikkie!')
    const result = spinResult(), placed = Object.values(bets), idx = WHEEL.indexOf(result)
    const mouth = stage.current?.querySelector('.bert svg')?.getBoundingClientRect(), wr = stage.current?.querySelector('.wheel')?.getBoundingClientRect()
    if (!mouth || !wr) return
    setBusy(true); setRes(null); setNet(null); say(line('close'), 'spin')
    // Schermposities: Berts mond en het punt op de baan dat naar Bert toe wijst
    const k = wr.width / 400, cx = wr.left + wr.width / 2, cy = wr.top + wr.height / 2
    const mx = mouth.left + (mouth.width * 110) / 220, my = mouth.top + (mouth.height * 130) / 280
    const a0 = (Math.atan2(mx - cx, cy - my) * 180) / Math.PI, rad = (a0 * Math.PI) / 180
    const lx = cx + TRACK * k * Math.sin(rad), ly = cy - TRACK * k * Math.cos(rad)
    // Tijdlijn (ms): wiel draait aan, Bert spuugt, balletje rolt uit
    const T0 = 700, TL = T0 + FLY, TE = TL + ROLL, w0 = deg0.current, W = 900 + Math.random() * 360
    const rotor = (ms: number) => w0 + W * (1 - Math.pow(1 - Math.min(1, ms / TE), 2))
    // Aantal extra rondjes zó gekozen dat het balletje begint waar Bert het neerlegt en eindigt in het uitkomstvak
    const K = 360 * 8 + (((a0 - rotor(TL) - idx * S) % 360) + 360) % 360
    const st = performance.now(); let phase = 0, hop = -1
    const tick = (now: number) => {
      const ms = now - st, deg = rotor(ms)
      if (ms < T0) setAnim({ deg, ball: null, r: TRACK })
      else if (ms < TL) {
        if (phase === 0) { phase = 1; setMood('spit'); sfx('spit', speech) }
        const u = (ms - T0) / FLY
        setFly({ x: mx + (lx - mx) * u, y: my + (ly - my) * u - 90 * 4 * u * (1 - u), s: 6 + (12 * k - 6) * u })
        setAnim({ deg, ball: null, r: TRACK })
      } else {
        if (phase === 1) { phase = 2; setFly(null); setMood('spin') }
        const t = Math.min(1, (ms - TL) / ROLL)
        let off = K * Math.pow(1 - t, 2.5), r
        if (t < 0.62) r = TRACK + Math.sin(t * 60) * 1.2
        else if (t < 0.74) { const v = (t - 0.62) / 0.12; r = TRACK - (TRACK - POCKET) * v * v }
        else { // stuiteren over de vakjes tot het balletje stil ligt
          const u = (t - 0.74) / 0.26, b = Math.floor(u * 5)
          r = POCKET + 20 * Math.abs(Math.sin(u * Math.PI * 5)) * Math.pow(1 - u, 1.6)
          off += S * 1.6 * Math.sin(u * Math.PI * 5) * Math.pow(1 - u, 2)
          if (b > hop && b < 5) { hop = b; sfx('tik', speech, 1 - u) }
        }
        setAnim({ deg, ball: deg + idx * S + off, r })
        if (t >= 1) {
          deg0.current = deg % 360
          const back = placed.reduce((s, b) => s + payout(b, result), 0), n = back - total, nb = bal + n
          setBal(nb); setRes(result); setNet(n); setHist(h => [result, ...h].slice(0, 15)); setLast(placed); setBets({}); setStack([]); setBusy(false)
          say(n > 0 ? line('win') : nb < 1 ? line('broke') : line('lose'), n > 0 ? 'win' : n < 0 ? 'lose' : 'idle')
          return
        }
      }
      requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }
  const eur = (n: number) => '€' + n.toLocaleString('nl-NL')
  return (
    <div className="room">
      <header className="bar"><button className="btn" onClick={onExit}>← Beginscherm</button><b className="gold">{init.name && <span className="who">{DRINKS[init.drink || 'bier'].icon} {init.name} · </span>}Saldo {eur(free)}</b>
        <button className="btn" onClick={() => setSpeech(!speech)}>{speech ? '🤐 Laat Bert zijn bek houden' : '🔊 Luister naar Bert zijn stem'}</button><button className="btn" onClick={reset}>Reset</button></header>
      <div className="stage" ref={stage}><SeatedBert mood={mood} talking={talk} said={said} /><Wheel {...anim} /></div>
      {fly && <span className="spit" style={{ left: fly.x, top: fly.y, width: fly.s, height: fly.s }} />}
      <div className="info"><span>Totale inzet: <b>{eur(total)}</b></span>
        {res !== null && <span className={`res ${colorOf(res)}`}>{res}</span>}
        {net !== null && <span className={net >= 0 ? 'plus' : 'min'}>{net >= 0 ? '+' : ''}{eur(net)}</span>}</div>
      <div className="hist">{hist.map((n, i) => <i key={i} className={colorOf(n)}>{n}</i>)}</div>
      <div className="tw"><div className="table">
        {targets.map((t, i) => <button key={i} className={`c ${t.cls}`} aria-label={t.label} style={{ left: t.cx + '%', top: t.cy + '%', width: t.w + '%', height: t.h + '%', zIndex: t.z }} onClick={() => place(t)}>{t.text}</button>)}
        {Object.values(bets).map(b => <span key={b.key} className="stk" style={{ left: b.cx + '%', top: b.cy + '%' }}>{b.amount}</span>)}
      </div></div>
      <div className="chips">{CHIPS.map(c => <button key={c} className={`chip c${c} ${chip === c ? 'sel' : ''}`} onClick={() => setChip(c)}>{c}</button>)}</div>
      <div className="acts"><button className="btn" onClick={undo}>↶ Terug</button><button className={`btn ${erase ? 'on' : ''}`} onClick={() => setErase(!erase)}>🧽 Gum</button>
        <button className="btn" onClick={clear}>Wis alles</button><button className="btn" onClick={repeat}>↻ Herhaal</button>
        <button className="btn spin" disabled={busy} onClick={spin}>{busy ? 'Het wiel draait…' : 'DRAAI!'}</button></div>
      {bal < 1 && !busy && <p className="gold">Pech! Druk op Reset voor weer {eur(START)}.</p>}
    </div>
  )
}
