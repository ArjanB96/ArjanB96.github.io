import { useEffect, useMemo, useRef, useState } from 'react'
import { DRINKS, load, save, speak } from '../../services'
import { cryptoRng } from '../../services/rng'
import { hofText, submitScore } from '../../services/hof'
import { sfx } from '../../services/music'
import { HORSES, HorseId, byId } from './engine/horses'
import { payoutFor, settle, targetChances } from './engine/odds'
import { Comment, Cue, LENGTH, Race, RaceEvent, positionsAt, simulateRace } from './engine/race'
import HorseArt from './components/HorseArt'
import HorseCard from './components/HorseCard'
import Booth from './components/Booth'
import WinnerScreen from './components/WinnerScreen'
import Grandstand from './components/Grandstand'
import './dekhengsten.css'

/** Startfase vóór het startschot (s), start- en finishlijn op de baan (%) */
const INTRO = 4, START_X = 6, FINISH_X = 90
const CHIPS = [1, 5, 10, 25, 50, 100]
const HK = 'bc.race'
const eur = (n: number) => '€' + n.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
interface HistoryItem { round: number; date: string; winner: HorseId; odds: number; horse: HorseId; stake: number; payout: number }
const loadHistory = (): { round: number; list: HistoryItem[] } => { try { return { round: 0, list: [], ...JSON.parse(localStorage.getItem(HK) || '{}') } } catch { return { round: 0, list: [] } } }

export default function Dekhengsten({ onExit }: { onExit: () => void }) {
  const init = useMemo(load, []), chances = useMemo(() => targetChances(), [])
  const fav = HORSES.reduce((a, b) => (b.odds < a.odds ? b : a)).id, out = HORSES.reduce((a, b) => (b.odds > a.odds ? b : a)).id
  const [bal, setBal] = useState(init.balance), [speech, setSpeech] = useState(init.speech)
  const [pickId, setPick] = useState<HorseId | null>(null), [stake, setStake] = useState(10)
  const [phase, setPhase] = useState<'paddock' | 'race' | 'result'>('paddock'), [race, setRace] = useState<Race | null>(null)
  const [count, setCount] = useState(0), [gates, setGates] = useState(false)
  const [standings, setStandings] = useState<number[]>([]), [active, setActive] = useState<Record<string, RaceEvent>>({})
  const [shout, setShout] = useState(''), [comment, setComment] = useState<Comment | null>(null), [lambo, setLambo] = useState(false)
  const [history, setHistory] = useState(loadHistory), [showHist, setShowHist] = useState(false)
  const [result, setResult] = useState<{ payout: number; line: string } | null>(null)
  const horseEls = useRef<(HTMLDivElement | null)[]>([]), alive = useRef(true), speechRef = useRef(speech), raf = useRef(0)
  const betRef = useRef<{ horse: HorseId; stake: number; odds: number } | null>(null), pending = useRef<{ payout: number } | null>(null)
  speechRef.current = speech

  useEffect(() => { save({ balance: bal, speech }) }, [bal, speech])
  useEffect(() => { try { localStorage.setItem(HK, JSON.stringify(history)) } catch {} }, [history])
  useEffect(() => () => {
    alive.current = false; cancelAnimationFrame(raf.current); speechSynthesis?.cancel?.()
    // Wegklikken tijdens de race: de uitslag stond al vast, dus de uitbetaling komt alsnog binnen
    if (pending.current?.payout) save({ balance: load().balance + pending.current.payout })
  }, [])

  const bet = pickId ? byId(pickId) : null
  const canStart = !!bet && stake > 0 && stake <= bal

  const start = () => {
    if (!bet || !canStart) return
    const r = simulateRace(cryptoRng) // de hele race ligt hierna vast
    const b = { horse: bet.id, stake, odds: bet.odds }, s = settle({ type: 'win', ...b }, r.order)
    betRef.current = b; pending.current = { payout: s.payout }
    setBal(x => Math.round((x - stake) * 100) / 100); setRace(r); setPhase('race'); setResult(null)
    setStandings(HORSES.map((_, i) => i)); setActive({}); setShout(''); setGates(false); setComment({ t: -INTRO, text: 'Paarden in de starthekken, dames en heren!', cue: 'drink' })
    speak('Paarden in de starthekken, dames en heren!', speechRef.current)
    play(r)
  }

  /** Speelt de vooraf berekende race af; posities rechtstreeks op de DOM voor soepele animatie op mobiel */
  const play = (r: Race) => {
    let last = performance.now(), t = -INTRO, ci = 0, si = 0, tick = 0, countShown = 99
    const frame = (now: number) => {
      if (!alive.current) return
      const dt = Math.min(0.1, (now - last) / 1000); last = now
      const w0 = r.finish[r.winner], slow = r.photo && t > w0 - 1.2 && t < w0 + 0.3
      t += dt * (slow ? 0.35 : 1)
      if (t < 0) { const c = Math.ceil(-t); if (c !== countShown && c <= 3) { countShown = c; setCount(c); sfx('tik', speechRef.current) } }
      else if (countShown) { countShown = 0; setCount(0); setGates(true); sfx('up', speechRef.current) }
      const pos = positionsAt(r, Math.max(0, t))
      pos.forEach((p, i) => { const el = horseEls.current[i]; if (el) el.style.left = `${START_X + (Math.min(p, LENGTH + 80) / LENGTH) * (FINISH_X - START_X)}%` })
      while (ci < r.comments.length && r.comments[ci].t <= t) { const c = r.comments[ci++]; setComment(c); speak(c.text, speechRef.current) }
      while (si < r.shouts.length && r.shouts[si].t <= t) { const s = r.shouts[si++]; setShout(s.text); setTimeout(() => alive.current && setShout(x => (x === s.text ? '' : x)), 2600) }
      if (now - tick > 200) { // trager bijwerken: stand, events, galopsnelheid
        tick = now
        const order = pos.map((_, i) => i).sort((a, b) => pos[b] - pos[a]); setStandings(order)
        const act: Record<string, RaceEvent> = {}; for (const e of r.events) if (t >= e.t && t < e.t + e.dur + 0.4) act[e.horse] = e
        setActive(act); setLambo(Object.values(act).some(e => e.key === 'lambo'))
        const later = positionsAt(r, Math.max(0, t) + 0.3)
        pos.forEach((p, i) => { const el = horseEls.current[i]; if (el) { const v = (later[i] - p) / 0.3; el.style.setProperty('--gait', `${Math.max(0.22, Math.min(0.9, 9 / Math.max(v, 1)))}s`); el.classList.toggle('lead', order[0] === i && t > 0) } })
      }
      if (t >= r.duration) return finish(r)
      raf.current = requestAnimationFrame(frame)
    }
    raf.current = requestAnimationFrame(frame)
  }

  const finish = (r: Race) => {
    const b = betRef.current!, payout = pending.current?.payout || 0; pending.current = null
    setBal(x => Math.round((x + payout) * 100) / 100)
    const name = load().name || 'a neef'
    const bertLine = payout ? `KASSA! ${name} wint ${eur(payout)}! Bert gaat volledig uit zijn dak!` : [`Helaas ${name}! Dat geld is nu van Bert.`, `Volgende keer beter, ${name}. Bert koopt er een nieuwe rolie van.`, `Op het verkeerde paard, ${name}! Proost!`][Math.floor(Math.random() * 3)]
    setResult({ payout, line: bertLine }); setPhase('result'); speak(bertLine, speechRef.current)
    setHistory(h => ({ round: h.round + 1, list: [{ round: h.round + 1, date: new Date().toISOString(), winner: r.winner, odds: byId(r.winner).odds, horse: b.horse, stake: b.stake, payout }, ...h.list].slice(0, 25) }))
    if (payout > b.stake) submitScore('race', payout - b.stake, b.stake).then(p => { if (p && alive.current) speak(hofText(p), speechRef.current, undefined, true) })
  }
  const next = () => { setPhase('paddock'); setRace(null); setComment(null) }

  const leroyIdx = HORSES.findIndex(h => h.id === 'leroy')
  return (
    <div className={`dh ph-${phase}`}>
      <header className="bar dh-bar">
        <button className="btn" onClick={onExit} disabled={phase === 'race'}>← Beginscherm</button>
        <b className="gold">{init.name && <span className="who">{DRINKS[init.drink || 'bier'].icon} {init.name} · </span>}Saldo {eur(bal)}</b>
        <span><button className={`btn ${showHist ? 'on' : ''}`} onClick={() => setShowHist(!showHist)}>📜 Geschiedenis</button>
          <button className="btn" onClick={() => setSpeech(!speech)}>{speech ? '🔊 Spraak aan' : '🔇 Spraak uit'}</button></span>
      </header>
      <h2 className="logo dh-title">DEKHENGSTEN <span>RACE</span></h2>

      {showHist && <section className="dh-hist"><h3>📜 Laatste races</h3>
        {!history.list.length ? <p>Nog geen races gereden.</p> : <ul>{history.list.map(h => <li key={h.round} className={h.payout ? 'won' : ''}>
          <b>#{h.round}</b> <span>{new Date(h.date).toLocaleString('nl-NL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
          <span>🏆 {byId(h.winner).name} ({h.odds}:1)</span><span>Jij: {eur(h.stake)} op {byId(h.horse).name}</span>
          <b className={h.payout ? 'plus' : 'min'}>{h.payout ? `+${eur(h.payout - h.stake)}` : `−${eur(h.stake)}`}</b></li>)}</ul>}
      </section>}

      {phase === 'paddock' && <>
        <p className="dh-explain">Kies je paard en zet in op de winnaar. <b>Odds 2:1</b> = twee keer je inzet winst, plus je inzet terug. <b>Lagere odds = grotere kans</b> om te winnen, maar minder uitbetaling.</p>
        <div className="paddock">{HORSES.map(h => <HorseCard key={h.id} horse={h} chance={chances[h.id]} selected={pickId === h.id} onSelect={() => setPick(h.id)}
          badge={h.id === fav ? 'FAVORIET' : h.id === out ? 'OUTSIDER' : undefined} />)}</div>
        <section className="betpanel">
          <div className="bp-row"><span>Paard</span><b>{bet ? `${bet.no}. ${bet.name}` : 'Kies een paard'}</b></div>
          <div className="bp-row"><span>Odds</span><b>{bet ? `${bet.odds}:1` : '–'}</b></div>
          <div className="bp-chips">{CHIPS.map(c => <button key={c} className={`chip c${c}`} onClick={() => setStake(s => Math.min(Math.round((s + c) * 100) / 100, bal))}>+{c}</button>)}
            <button className="btn" onClick={() => setStake(0)}>Wis</button></div>
          <div className="bp-row"><span>Inzet</span><b className="bp-stake"><button className="btn" onClick={() => setStake(s => Math.max(0, s - 1))} aria-label="Minder">−</button>{eur(stake)}<button className="btn" onClick={() => setStake(s => Math.min(bal, s + 1))} aria-label="Meer">+</button></b></div>
          <div className="bp-row big"><span>Mogelijke uitbetaling</span><b className="plus">{bet ? eur(payoutFor(stake, bet.odds)) : '–'}</b></div>
          <button className="btn spin bp-go" disabled={!canStart} onClick={start}>{!bet ? 'Kies eerst een paard' : stake > bal ? 'Te weinig saldo' : `🏁 Bevestig ${eur(stake)} op ${bet.name} & start`}</button>
        </section>
      </>}

      {(phase === 'race' || phase === 'result') && race && <section className="dh-race">
        <div className="stands" aria-hidden="true">
          <Grandstand />
          <div className={`lambo ${lambo ? 'go' : ''}`}>🏎️</div>
          <Booth cue={(comment?.cue as Cue) || 'drink'} text={comment?.text || ''} talking={!!comment} />
        </div>
        <div className={`track ${gates ? 'open' : ''}`}>
          <div className="startline" /><div className="finishline"><span>FINISH</span></div>
          {HORSES.map((h, i) => { const ev = active[h.id]
            return <div key={h.id} className="lane"><span className="lane-no" style={{ background: h.silks }}>{h.no}</span>
              <div className="sgate" />
              <div ref={el => { horseEls.current[i] = el }} className={`runner ${ev ? 'ev-' + ev.anim : ''} ${pickId === h.id ? 'mine' : ''}`} style={{ left: START_X + '%' }}>
                <HorseArt id={h.id} silks={h.silks} no={h.no} />
                {ev && <span className="evtag">{ev.icon} {ev.label}</span>}
                {i === leroyIdx && shout && <span className="shout">{shout}</span>}
              </div></div> })}
          {count > 0 && <div className="countdown" key={count}>{count}</div>}
        </div>
        <div className="standings">{standings.map((i, k) => <span key={HORSES[i].id} className={pickId === HORSES[i].id ? 'mine' : ''}><b>{k + 1}</b><i style={{ background: HORSES[i].silks }}>{HORSES[i].no}</i>{HORSES[i].name}</span>)}</div>
        {comment && <div className="ticker">🎙️ {comment.text}</div>}
      </section>}

      {phase === 'result' && race && result && betRef.current && <WinnerScreen race={race} bet={betRef.current} payout={result.payout} bertLine={result.line} onNext={next} />}
      <p className="fine">Alleen virtueel speelgeld zonder echte waarde.</p>
    </div>
  )
}
