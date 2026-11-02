import { useEffect, useMemo, useRef, useState } from 'react'
import Bert, { Mood } from '../../components/Bert'
import { DRINKS, START, line, load, resetState, save, speak } from '../../services'
import { musicOn, musicSet, sfx } from '../../services/music'
import { hofText, submitScore } from '../../services/hof'
import { CONFIG, PORTAL } from './engine/config'
import { Crew, newCrew, progress } from './engine/crew'
import { GameEvent, playRound } from './engine/engine'
import { fillGrid } from './engine/grid'
import { clusterPay } from './engine/payout'
import { cryptoRng } from './engine/rng'
import { CaptainHat, CrewArt, HUES, Ship, SrDefs, SymbolArt } from './art'
import { CREW, abilityText } from './crewInfo'
import './spaceraiders.css'

const cfg = CONFIG
/** Basistijden (ms) per animatiestap; gedeeld door de gekozen snelheid */
const T = { drop: 560, glow: 650, pop: 300, collect: 260, level: 1000, laser: 700, teleport: 800, boost: 900, treasure: 900, bonus: 3400, retrigger: 1600, finale: 4200, big: 2400 }
const SPEEDS = [{ label: 'Normaal', f: 1 }, { label: 'Snel', f: 1.8 }, { label: 'Turbo', f: 3.2 }]
const SK = 'bc.space'
const eur = (n: number) => '€' + n.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const centre = (cells: number[]) => { const r = cells.reduce((s, i) => s + Math.floor(i / cfg.cols), 0) / cells.length, c = cells.reduce((s, i) => s + (i % cfg.cols), 0) / cells.length
  return { x: ((c + 0.5) / cfg.cols) * 100, y: ((r + 0.5) / cfg.rows) * 100 } }
interface Popup { id: number; text: string; x: number; y: number; cls: string }
type Overlay = null | { kind: 'bonus'; reason: string; spins: number } | { kind: 'retrigger'; add: number } | { kind: 'finale'; levels: number[]; parts: number[]; amount: number } | { kind: 'big'; amount: number }

export default function SpaceRaiders({ onExit }: { onExit: () => void }) {
  const init = useMemo(load, [])
  const [settings, setSettings] = useState(() => { try { return { speed: 0, reduced: false, ...JSON.parse(localStorage.getItem(SK) || '{}') } } catch { return { speed: 0, reduced: false } } })
  const [bal, setBal] = useState(init.balance), [speech, setSpeech] = useState(init.speech), [music, setMusic] = useState(musicOn), [bi, setBi] = useState(2)
  const [grid, setGrid] = useState(() => fillGrid(cryptoRng, cfg)), [fall, setFall] = useState<number[]>(() => new Array(cfg.cols * cfg.rows).fill(cfg.rows)), [gen, setGen] = useState(0)
  const [fx, setFx] = useState<Record<number, string>>({})
  const [crew, setCrew] = useState<Crew>(newCrew), [fuel, setFuel] = useState(0), [mult, setMult] = useState(1), [win, setWin] = useState(0)
  const [busy, setBusy] = useState(false), [free, setFree] = useState<number | null>(null), [bonus, setBonus] = useState(false)
  const [flash, setFlash] = useState<{ color: number; level: number } | null>(null), [popups, setPopups] = useState<Popup[]>([]), [overlay, setOverlay] = useState<Overlay>(null)
  const [panel, setPanel] = useState<'' | 'rules' | 'settings'>('')
  const [mood, setMood] = useState<Mood>('idle'), [said, setSaid] = useState(''), [talk, setTalk] = useState(false)
  const alive = useRef(true), pid = useRef(0), idle = useRef(0), speechRef = useRef(speech), speedRef = useRef(SPEEDS[settings.speed].f)
  speechRef.current = speech; speedRef.current = SPEEDS[settings.speed].f
  const bet = cfg.bets[bi]

  const wait = (ms: number) => new Promise(r => setTimeout(r, ms / speedRef.current))
  const say = (t: string, m: Mood = 'idle') => { setSaid(t); setMood(m); setTalk(true); speak(t, speechRef.current); setTimeout(() => setTalk(false), 1800); window.clearTimeout(idle.current)
    idle.current = window.setTimeout(() => { setMood('idle'); setSaid('') }, 4500) }
  const pop = (text: string, x: number, y: number, cls: string, life = 1400) => { const id = ++pid.current
    setPopups(p => [...p, { id, text, x, y, cls }]); setTimeout(() => setPopups(p => p.filter(q => q.id !== id)), life / speedRef.current) }
  const snd = (k: Parameters<typeof sfx>[0], v = 1) => sfx(k, speechRef.current, v)

  useEffect(() => { say(line('spaceWelcome')); return () => { alive.current = false; window.clearTimeout(idle.current); speechSynthesis?.cancel?.() } }, [])
  useEffect(() => { save({ balance: bal, speech }) }, [bal, speech])
  useEffect(() => { try { localStorage.setItem(SK, JSON.stringify(settings)) } catch {} }, [settings])

  /** Speelt de gebeurtenissen van de engine exact af */
  const play = async (events: GameEvent[], total: number) => {
    let shown = 0
    for (const e of events) {
      if (!alive.current) return
      switch (e.t) {
        case 'spin':
          if (e.free) setFree(e.left)
          else { setCrew(newCrew()); setFuel(0); setMult(1) }
          break
        case 'drop': setGrid(e.grid); setFall(e.fall); setFx({}); setGen(g => g + 1); snd('tik', 0.5); await wait(T.drop); break
        case 'win': {
          const f: Record<number, string> = {}; e.clusters.forEach(c => c.cells.forEach(i => { f[i] = 'glow' })); setFx(f)
          e.clusters.forEach(c => { const p = centre(c.cells); pop(eur(c.pay), p.x, p.y, 'pay') })
          shown += e.amount; setWin(Math.round(shown * 100) / 100); snd('pop'); await wait(T.glow); break
        }
        case 'pop': { const f: Record<number, string> = {}; e.cells.forEach(i => { f[i] = 'pop' }); setFx(f); await wait(T.pop); break }
        case 'collect': setCrew({ points: e.points, levels: e.levels }); setFuel(e.fuel); await wait(T.collect); break
        case 'levelup':
          setFlash(e); snd('up')
          if (e.level >= 3 && Math.random() < 0.5) say(line('spaceLevel'), 'wow')
          await wait(T.level); setFlash(null); break
        case 'laser': { const f: Record<number, string> = {}; e.cells.forEach(i => { f[i] = 'laser' }); setFx(f); snd('zap'); await wait(T.laser); break }
        case 'teleport': { const f: Record<number, string> = {}; e.cells.forEach(i => { f[i] = e.wilds.includes(i) ? 'morph wildnew' : 'morph' }); setGrid(e.grid); setFx(f); snd('zap', 0.6); await wait(T.teleport); break }
        case 'boost': setMult(e.mult); pop(`×${e.mult}`, 50, 45, 'mult', 1600); snd('up'); await wait(T.boost); break
        case 'treasure':
          shown += e.amount; setWin(Math.round(shown * 100) / 100); setFuel(e.fuel); pop(`+${eur(e.amount)}`, 50, 50, 'coin', 1600); snd('coin')
          if (e.jackpot) say(line('spaceBig'), 'win')
          await wait(T.treasure); break
        case 'bonus': setOverlay({ kind: 'bonus', reason: e.reason, spins: e.spins }); setBonus(true); say(line('spaceBonus'), 'win'); snd('boom'); await wait(T.bonus); setOverlay(null); break
        case 'retrigger': setOverlay({ kind: 'retrigger', add: e.add }); snd('up'); await wait(T.retrigger); setOverlay(null); break
        case 'finale':
          setOverlay({ kind: 'finale', levels: e.levels, parts: e.parts, amount: e.amount }); say(line('spaceFinale'), 'win'); snd('coin')
          shown += e.amount; setWin(Math.round(shown * 100) / 100); await wait(T.finale); setOverlay(null); break
        case 'cap': pop('MAXIMALE WINST!', 50, 50, 'mult', 2000); break
        case 'end': break
      }
    }
    setWin(total); setFree(null)
    if (total >= bet * 25) { setOverlay({ kind: 'big', amount: total }); await wait(T.big); setOverlay(null) }
    setBonus(false)
  }

  const launch = async () => {
    if (busy) return
    if (bet > bal) return say(bal < cfg.bets[0] ? line('broke') : 'Die inzet kan je niet betalen, pikkie!')
    setBusy(true); setPanel(''); setWin(0); setBal(b => Math.round((b - bet) * 100) / 100)
    const round = playRound(bet, cryptoRng, cfg)
    await play(round.events, round.total)
    if (!alive.current) return
    setBal(b => Math.round((b + round.total) * 100) / 100); setBusy(false)
    if (round.total > 0) submitScore('space', round.total, bet).then(p => { if (p) setTimeout(() => say(hofText(p), 'win'), 2500) })
    if (round.total >= bet * 10) say(line('spaceBig'), 'win')
    else if (round.total > 0 && Math.random() < 0.3) say(line('spaceWin'), 'win')
  }
  const reset = () => { if (busy || !confirm(`Alles terug naar ${eur(START)}?`)) return; const s = resetState(load()); setBal(s.balance); save(s) }
  const portals = grid.filter(s => s === PORTAL).length

  return (
    <div className={`sr ${bonus ? 'bonus' : ''} ${settings.reduced ? 'calm' : ''}`}>
      <SrDefs />
      <div className="sr-sky" aria-hidden="true"><i className="stars s1"/><i className="stars s2"/><i className="planet p1"/><i className="planet p2"/><i className="planet p3"/><i className="warp"/></div>
      <header className="bar sr-bar">
        <button className="btn" onClick={onExit} disabled={busy}>← Beginscherm</button>
        <b className="gold">{init.name && <span className="who">{DRINKS[init.drink || 'bier'].icon} {init.name} · </span>}Saldo {eur(bal)}</b>
        <span><button className="btn" onClick={() => setPanel(panel === 'rules' ? '' : 'rules')}>ℹ️ Uitleg</button><button className="btn" onClick={() => setPanel(panel === 'settings' ? '' : 'settings')}>⚙️</button></span>
      </header>
      <h2 className="logo sr-title">Berts <span>Space Raiders</span></h2>
      <div className="sr-flyby" aria-hidden="true"><Ship /></div>

      <main className="sr-main">
        <section className="sr-comm">
          <div className={`sr-bert ${bonus ? 'captain' : ''}`}>{bonus && <CaptainHat />}<Bert mood={mood} talking={talk} said="" /></div>
          {said && <div className="sr-say">{bonus && <b>Kapitein Bert: </b>}{said}</div>}
        </section>

        <section className="sr-crew" aria-label="Bemanning">
          {CREW.map((m, c) => {
            const lvl = crew.levels[c], up = flash?.color === c
            return (
              <div key={c} className={`crewcard ${up ? 'up' : ''} ${lvl ? 'on' : ''}`} style={{ ['--hue' as string]: HUES[c][0], ['--hue2' as string]: HUES[c][1] }}>
                <div className="crew-pic"><CrewArt c={c} />{up && <span className="lvlpop">LVL {flash!.level}!</span>}</div>
                <div className="crew-txt">
                  <b>{m.name}</b>
                  <div className="pips">{[1, 2, 3, 4, 5].map(l => <i key={l} className={l <= lvl ? 'lit' : ''} />)}</div>
                  <div className="xp"><i style={{ width: `${progress(crew, c, cfg) * 100}%` }} /></div>
                  <small>{lvl ? abilityText(c, lvl, cfg) : `${m.power}: verzamel ${m.color.toLowerCase()}`}</small>
                </div>
              </div>)
          })}
        </section>

        <section className="sr-board-wrap">
          <div className={`sr-board ${fx && Object.values(fx).includes('laser') ? 'zapping' : ''}`} style={{ ['--cols' as string]: cfg.cols, ['--rows' as string]: cfg.rows }}>
            {grid.map((s, i) => <div key={`${gen}-${i}`} className={`cell ${fx[i] || ''}`} style={{ ['--f' as string]: fall[i], animationDelay: `${(i % cfg.cols) * 22}ms` }}><SymbolArt s={s} /></div>)}
            {popups.map(p => <span key={p.id} className={`popup ${p.cls}`} style={{ left: p.x + '%', top: p.y + '%' }}>{p.text}</span>)}
            {mult > 1 && <span className="multbadge">×{mult}</span>}
          </div>
        </section>

        <section className="sr-hud">
          <div className="fuel" title="Brandstof: vol = Ruimte-expeditie">
            <i style={{ width: `${Math.min(100, (fuel / cfg.fuelMax) * 100)}%` }} />
            <span>⛽ Brandstof {Math.min(fuel, cfg.fuelMax)}/{cfg.fuelMax} · 🌀 {portals}/{cfg.portalsForBonus}</span>
          </div>
          {free !== null && <div className="freebar">🚀 Ruimte-expeditie · nog {free} vluchten · ×{mult}</div>}
          <div className="winline">Winst <b className={win > 0 ? 'plus' : ''}>{eur(win)}</b></div>
          <div className="controls">
            <button className="btn" disabled={busy || bi === 0} onClick={() => setBi(bi - 1)} aria-label="Lagere inzet">−</button>
            <b className="betval">Inzet {eur(bet)}</b>
            <button className="btn" disabled={busy || bi === cfg.bets.length - 1} onClick={() => setBi(bi + 1)} aria-label="Hogere inzet">+</button>
            <button className="btn spin launch" disabled={busy} onClick={launch}>{busy ? (free !== null ? 'Expeditie…' : 'Vliegen…') : '🚀 LANCEER!'}</button>
          </div>
        </section>
      </main>

      {overlay && <div className={`sr-over ${overlay.kind}`}>
        {overlay.kind === 'bonus' && <div className="ov-card"><div className="sr-bert captain big"><CaptainHat /><Bert mood="win" talking said="" /></div>
          <h3>RUIMTE-EXPEDITIE!</h3><p>{overlay.reason === 'portals' ? 'De sterrenpoorten gaan open' : overlay.reason === 'fuel' ? 'De tank zit vol' : 'Robo-Bert 3000 heeft de coördinaten'} · {overlay.spins} gratis vluchten</p><p className="small">Kapitein Bert aan het roer · dubbele punten voor de bemanning</p></div>}
        {overlay.kind === 'retrigger' && <div className="ov-card"><h3>+{overlay.add} VLUCHTEN!</h3></div>}
        {overlay.kind === 'finale' && <div className="ov-card"><h3>THUISVLUCHT</h3><p>De bemanning levert de buit af</p>
          <div className="fin">{CREW.map((m, c) => <div key={c} className="finrow" style={{ animationDelay: `${c * 0.35}s` }}><span className="fpic"><CrewArt c={c} /></span><span>{m.name} · LVL {overlay.levels[c]}</span><b>{eur(overlay.parts[c])}</b></div>)}</div>
          <p className="fintot">Totaal {eur(overlay.amount)}</p></div>}
        {overlay.kind === 'big' && <div className="ov-card"><h3>MEGA BUIT!</h3><p className="fintot">{eur(overlay.amount)}</p></div>}
      </div>}

      {panel === 'settings' && <div className="sr-panel" role="dialog" aria-label="Instellingen">
        <h3>⚙️ Instellingen</h3>
        <label>Snelheid <span className="seg">{SPEEDS.map((s, i) => <button key={s.label} className={`btn ${settings.speed === i ? 'on' : ''}`} onClick={() => setSettings({ ...settings, speed: i })}>{s.label}</button>)}</span></label>
        <label>Bert praat en geluidseffecten <button className={`btn ${speech ? 'on' : ''}`} onClick={() => setSpeech(!speech)}>{speech ? 'Aan' : 'Uit'}</button></label>
        <label>Achtergrondmuziek <button className={`btn ${music ? 'on' : ''}`} onClick={() => { musicSet(!music); setMusic(!music) }}>{music ? 'Aan' : 'Uit'}</button></label>
        <label>Minder animaties <button className={`btn ${settings.reduced ? 'on' : ''}`} onClick={() => setSettings({ ...settings, reduced: !settings.reduced })}>{settings.reduced ? 'Aan' : 'Uit'}</button></label>
        <label>Saldo <button className="btn" onClick={reset}>Reset naar {eur(START)}</button></label>
        <button className="btn spin" onClick={() => setPanel('')}>Sluiten</button>
      </div>}

      {panel === 'rules' && <div className="sr-panel rules" role="dialog" aria-label="Uitleg">
        <h3>ℹ️ Zo speel je Berts Space Raiders</h3>
        <p><b>Clusters:</b> {cfg.minCluster} of meer gelijke symbolen die horizontaal of verticaal aan elkaar grenzen, winnen. Ze verdwijnen, alles valt naar beneden en er komen nieuwe symbolen bij. Dat gaat door zolang er winst is.</p>
        <p><b>Bert-badge</b> telt mee voor elke kleur. <b>🌀 Sterrenpoort:</b> {cfg.portalsForBonus} of meer na een spin = Ruimte-expeditie.</p>
        <p><b>Bemanning:</b> elk cluster geeft punten aan het bemanningslid van die kleur. Bij elk niveau voert hij meteen zijn actie uit:</p>
        <ul className="crewrules">{CREW.map((m, c) => <li key={c}><span className="fpic"><CrewArt c={c} /></span><div><b>{m.name}</b> ({m.color.toLowerCase()}, {m.kind.toLowerCase()})<ol>{[1, 2, 3, 4, 5].map(l => <li key={l}>{abilityText(c, l, cfg)}</li>)}</ol></div></li>)}</ul>
        <p><b>⛽ Brandstof:</b> elk verzameld punt is brandstof. Tank vol ({cfg.fuelMax}) in één spin = Ruimte-expeditie.</p>
        <p><b>🚀 Ruimte-expeditie:</b> {cfg.freeSpins} gratis vluchten. Niveaus en vermenigvuldiger blijven staan, de bemanning verzamelt {cfg.bonusPointFactor}× zo snel en {cfg.portalsForBonus}+ poorten geven +{cfg.retrigger} vluchten. Bij de <b>Thuisvlucht</b> betaalt elk bemanningslid uit naar zijn eindniveau ({cfg.finale.slice(1).map(x => x + '×').join(' / ')} inzet).</p>
        <p>Niveaus en vermenigvuldiger beginnen elke betaalde spin opnieuw. Maximale winst {cfg.maxWin}× de inzet.</p>
        <table className="paytable"><thead><tr><th></th><th>5</th><th>8</th><th>10</th><th>13</th><th>16+</th></tr></thead>
          <tbody>{cfg.pays.map((_, s) => <tr key={s}><td><SymbolArt s={s} /></td>{[5, 8, 10, 13, 16].map(n => <td key={n}>{eur(clusterPay(s, n, cfg) * bet)}</td>)}</tr>)}</tbody></table>
        <p className="small">Bedragen bij je huidige inzet van {eur(bet)}. Alleen virtueel speelgeld.</p>
        <button className="btn spin" onClick={() => setPanel('')}>Sluiten</button>
      </div>}
    </div>
  )
}
