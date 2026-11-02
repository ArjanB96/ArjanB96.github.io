import { useEffect, useMemo, useRef, useState } from 'react'
import Bert, { Mood } from '../../components/Bert'
import Wheel from './Wheel'
import { Bet, WHEEL, buildTargets, colorOf, payout, spinResult } from './logic'
import { START, line, load, resetState, save, speak } from '../../services'

const CHIPS = [1, 5, 10, 25, 50, 100, 500]
export default function Roulette({ onExit }: { onExit: () => void }) {
  const init = useMemo(load, [])
  const [bal, setBal] = useState(init.balance), [hist, setHist] = useState<number[]>(init.history), [speech, setSpeech] = useState(init.speech)
  const [chip, setChip] = useState(5), [bets, setBets] = useState<Record<string, Bet>>({}), [stack, setStack] = useState<string[]>([])
  const [last, setLast] = useState<Bet[]>([]), [erase, setErase] = useState(false), [busy, setBusy] = useState(false)
  const [res, setRes] = useState<number | null>(null), [net, setNet] = useState<number | null>(null)
  const [mood, setMood] = useState<Mood>('idle'), [said, setSaid] = useState(''), [talk, setTalk] = useState(false)
  const [anim, setAnim] = useState({ deg: 0, ball: 0, r: 175 })
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
    setBusy(true); setRes(null); setNet(null); say(line('close'), 'spin')
    const w0 = deg0.current, W = 1080 + Math.random() * 360, T = 7000, st = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - st) / T), e = 1 - Math.pow(1 - t, 3), deg = w0 + W * e
      const ball = deg + idx * (360 / 37) - (1 - e) * 360 * 7
      const settle = Math.max(0, (t - 0.6) / 0.4), r = 175 - 49 * Math.min(1, t / 0.7) * 0 - (175 - 128) * Math.pow(settle, 0.6) + Math.sin(settle * 40) * 8 * (1 - settle)
      setAnim({ deg, ball, r })
      if (t < 1) return requestAnimationFrame(tick)
      deg0.current = deg % 360
      const back = placed.reduce((s, b) => s + payout(b, result), 0), n = back - total, nb = bal + n
      setBal(nb); setRes(result); setNet(n); setHist(h => [result, ...h].slice(0, 15)); setLast(placed); setBets({}); setStack([]); setBusy(false)
      say(n > 0 ? line('win') : nb < 1 ? line('broke') : line('lose'), n > 0 ? 'win' : n < 0 ? 'lose' : 'idle')
    }
    requestAnimationFrame(tick)
  }
  const eur = (n: number) => '€' + n.toLocaleString('nl-NL')
  return (
    <div className="room">
      <header className="bar"><button className="btn" onClick={onExit}>← Foyer</button><b className="gold">Saldo {eur(free)}</b>
        <button className="btn" onClick={() => setSpeech(!speech)}>{speech ? '🔊 Bert praat' : '🔇 Stil'}</button><button className="btn" onClick={reset}>Reset</button></header>
      <div className="stage"><Bert mood={mood} talking={talk} said={said} /><Wheel {...anim} /></div>
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
