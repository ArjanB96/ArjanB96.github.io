import { useEffect, useMemo, useRef, useState } from 'react'
import { Mood } from '../../components/Bert'
import SeatedBert from '../../components/Throne'
import { BETS, BOOM, FREE, H, MAX_WIN, METER, PAYS, RETRIGGER, SCALE, SYMS, Spin, W, WILD, cryptoRng, spin } from './logic'
import { DRINKS, START, line, load, resetState, save, speak } from '../../services'
import { sfx } from '../../services/music'

/** Tijden (ms) van de animatie per cascade: invallen, oplichten van de winst, wegploffen, ontploffen */
const DROP = 580, GLOW = 600, POP = 280, BLAST = 650
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))
const eur = (n: number) => '€' + n.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const cents = (n: number) => Math.round(n * 100) / 100

export default function Kluis({ onExit }: { onExit: () => void }) {
  const init = useMemo(load, [])
  const [bal, setBal] = useState(init.balance), [speech, setSpeech] = useState(init.speech), [bi, setBi] = useState(2)
  const [grid, setGrid] = useState<number[]>(() => spin(1, cryptoRng).steps[0].grid), [fall, setFall] = useState<number[]>(() => new Array(W * H).fill(H))
  const [hits, setHits] = useState<number[]>([]), [phase, setPhase] = useState<'drop' | 'glow' | 'pop' | 'boom'>('drop'), [gen, setGen] = useState(0)
  const [busy, setBusy] = useState(false), [win, setWin] = useState(0), [meter, setMeter] = useState(0), [free, setFree] = useState<{ left: number; mult: number } | null>(null)
  const [banner, setBanner] = useState(''), [info, setInfo] = useState(false)
  const [mood, setMood] = useState<Mood>('idle'), [said, setSaid] = useState(''), [talk, setTalk] = useState(false)
  const alive = useRef(true), idle = useRef(0), bet = BETS[bi]

  const say = (t: string, m: Mood = 'idle') => { setSaid(t); setMood(m); setTalk(true); speak(t, speech); setTimeout(() => setTalk(false), 1800); window.clearTimeout(idle.current)
    idle.current = window.setTimeout(() => { setMood('idle'); setSaid('') }, 5000) }
  useEffect(() => { say(line('kluisWelcome')); return () => { alive.current = false; window.clearTimeout(idle.current); speechSynthesis?.cancel?.() } }, [])
  useEffect(() => { save({ balance: bal, speech }) }, [bal, speech])

  /** Speelt alle cascades van één spin af; geeft het aantal weggeblazen symbolen terug */
  const animate = async (s: Spin) => {
    let removed = 0; setMeter(0)
    for (const st of s.steps) {
      if (!alive.current) return removed
      setGrid(st.grid); setFall(st.fall); setHits([]); setPhase('drop'); setGen(g => g + 1); sfx('tik', speech, 0.6)
      await sleep(DROP)
      if (st.kind === 'end') break
      setHits(st.hits)
      if (st.kind === 'win') { setPhase('glow'); setWin(w => cents(w + st.win)); sfx('pop', speech); await sleep(GLOW); setPhase('pop'); await sleep(POP) }
      else { setPhase('boom'); sfx('boom', speech); if (Math.random() < 0.5) say(line('boom'), 'wow'); await sleep(BLAST) }
      removed += st.hits.length; setMeter(removed)
    }
    return removed
  }

  const play = async () => {
    if (busy) return
    if (bet > bal) return say(bal < BETS[0] ? line('broke') : 'Die inzet kan je niet betalen, pikkie!')
    setBusy(true); setWin(0); setBal(b => cents(b - bet))
    let total = 0
    const base = spin(bet, cryptoRng); await animate(base); total += base.total
    if (base.removed >= METER && alive.current) {
      setBanner('DE OVERVAL!'); say(line('overval'), 'win'); await sleep(2200); setBanner('')
      let left = FREE, mult = 1
      while (left > 0 && alive.current && total < MAX_WIN * bet) {
        left--; setFree({ left, mult })
        const f = spin(bet, cryptoRng, true, mult); await animate(f); mult = f.mult; total += f.total
        if (f.removed >= METER) { left += RETRIGGER; setBanner(`+${RETRIGGER} SPINS!`); await sleep(1400); setBanner('') }
        setFree({ left, mult })
      }
      setFree(null)
    }
    total = cents(Math.min(total, MAX_WIN * bet)); setWin(total)
    if (!alive.current) return
    setBal(b => cents(b + total)); setBusy(false)
    if (total >= bet * 20) say(line('kluisBig'), 'win')
    else if (total > 0 && Math.random() < 0.35) say(line('kluisWin'), 'win')
  }
  const reset = () => { if (busy || !confirm(`Alles terug naar ${eur(START)}?`)) return; const s = resetState(load()); setBal(s.balance); save(s) }

  return (
    <div className="room kluis">
      <header className="bar"><button className="btn" onClick={onExit}>← Beginscherm</button>
        <b className="gold">{init.name && <span className="who">{DRINKS[init.drink || 'bier'].icon} {init.name} · </span>}Saldo {eur(bal)}</b>
        <button className="btn" onClick={() => setSpeech(!speech)}>{speech ? '🤐 Laat Bert zijn bek houden' : '🔊 Luister naar Bert zijn stem'}</button><button className="btn" onClick={reset}>Reset</button></header>
      <h2 className="logo ktitle">Berts <span>Kluis</span></h2>
      <div className="stage kstage">
        <SeatedBert mood={mood} talking={talk} said={said} />
        <div className="kwrap">
          <div className={`kgrid ${phase === 'boom' ? 'shake' : ''}`}>
            {grid.map((s, i) => { const hit = hits.includes(i)
              return <div key={`${gen}-${i}`} className={`kc ${hit ? phase : ''} ${s === WILD ? 'wild' : s === BOOM ? 'tnt' : ''}`} style={{ ['--f' as string]: fall[i], animationDelay: `${(i % W) * 25}ms` }}><span>{SYMS[s].icon}</span></div> })}
            {banner && <div className="kbanner">{banner}</div>}
          </div>
          <div className="kmeter" title={`Kluismeter: ${meter}/${METER}`}><i style={{ width: `${Math.min(100, (meter / METER) * 100)}%` }} /><span>🔐 Kluismeter {Math.min(meter, METER)}/{METER}</span></div>
          {free && <div className="kfree">🔫 De Overval · {free.left} gratis spins · ×{free.mult}</div>}
        </div>
      </div>
      <div className="info"><span>Winst: <b className={win > 0 ? 'plus' : ''}>{eur(win)}</b></span></div>
      <div className="acts">
        <button className="btn" disabled={busy || bi === 0} onClick={() => setBi(bi - 1)} aria-label="Lagere inzet">−</button>
        <b className="kbet">Inzet {eur(bet)}</b>
        <button className="btn" disabled={busy || bi === BETS.length - 1} onClick={() => setBi(bi + 1)} aria-label="Hogere inzet">+</button>
        <button className="btn spin kspin" disabled={busy} onClick={play}>{busy ? (free ? 'Overval bezig…' : 'Kraken…') : 'KRAAK!'}</button>
        <button className={`btn ${info ? 'on' : ''}`} onClick={() => setInfo(!info)}>ℹ️ Uitleg</button>
      </div>
      {info && <div className="kinfo">
        <p><b>Clusters:</b> 5 of meer dezelfde symbolen die horizontaal of verticaal aan elkaar grenzen, winnen. Ze verdwijnen en er vallen nieuwe in.
          <b> 🅱️ Bert-wild</b> telt mee voor elk cluster. <b>🧨 Dynamiet</b> ontploft als er niets meer valt en blaast 3×3 weg.</p>
        <p><b>🔐 Kluismeter:</b> blaas {METER} symbolen weg in één spin en <b>De Overval</b> begint: {FREE} gratis spins met een vermenigvuldiger die bij elke winst +1 stijgt (meter opnieuw vol = +{RETRIGGER} spins). Maximaal {MAX_WIN}× je inzet.</p>
        <table><thead><tr><th>Symbool</th><th>5</th><th>8</th><th>10+</th><th>15+</th></tr></thead>
          <tbody>{PAYS.map((p, s) => <tr key={s}><td>{SYMS[s].icon}</td>{[0, 3, 5, 7].map(k => <td key={k}>{eur(p[k] * SCALE * bet)}</td>)}</tr>)}</tbody></table>
      </div>}
      {bal < BETS[0] && !busy && <p className="gold">Pech! Druk op Reset voor weer {eur(START)}.</p>}
    </div>
  )
}
