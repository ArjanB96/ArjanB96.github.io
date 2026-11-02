import { useMemo } from 'react'
import { HorseId, byId } from '../engine/horses'
import { Race } from '../engine/race'
import HorseArt from './HorseArt'
import Booth from './Booth'

const eur = (n: number) => '€' + n.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** Winnaarsceremonie: confetti, podium, uitslag en het resultaat van je weddenschap */
export default function WinnerScreen({ race, bet, payout, bertLine, onNext }: { race: Race; bet: { horse: HorseId; stake: number; odds: number }; payout: number; bertLine: string; onNext: () => void }) {
  const confetti = useMemo(() => Array.from({ length: 48 }, (_, i) => ({ left: (i * 37) % 100, delay: (i % 12) * 0.18, color: ['#d4a017', '#fff2a8', '#c4122f', '#2fd3ff', '#8dffa6', '#ff5fa2'][i % 6], rot: (i * 53) % 360 })), [])
  const w = byId(race.winner), won = payout > 0, t0 = race.finish[race.winner]
  return (
    <div className="dh-win" role="dialog" aria-label="Uitslag">
      <div className="confetti" aria-hidden="true">{confetti.map((c, i) => <i key={i} style={{ left: c.left + '%', animationDelay: c.delay + 's', background: c.color, transform: `rotate(${c.rot}deg)` }} />)}</div>
      <div className="dh-win-card">
        <h2 className="logo">🏆 {w.name}</h2>
        <p className="dh-special">{w.special}</p>
        <div className="podium">
          {[1, 0, 2].map(p => { const h = byId(race.order[p]); return (
            <div key={p} className={`pod p${p + 1}`}><div className="pod-art"><HorseArt id={h.id} silks={h.silks} no={h.no} /></div><div className="pod-block">{p + 1}</div><small>{h.name}</small></div>) })}
        </div>
        <ol className="dh-order">{race.order.map((id, i) => <li key={id}><b>{i + 1}.</b> {byId(id).name}<span>{i ? `+${(race.finish[id] - t0).toFixed(2)}s` : `${t0.toFixed(2)}s`}</span></li>)}</ol>
        <div className={`dh-result ${won ? 'won' : 'lost'}`}>
          {won ? <>Je wedde {eur(bet.stake)} op {byId(bet.horse).name} ({bet.odds}:1) en wint <b>{eur(payout)}</b>!</>
            : <>Je wedde {eur(bet.stake)} op {byId(bet.horse).name}. Helaas, dat geld is van Bert.</>}
        </div>
        <Booth cue={won ? 'jump' : 'sad'} text={bertLine} talking />
        <button className="btn spin dh-next" onClick={onNext}>🐎 Nieuwe race</button>
      </div>
    </div>
  )
}
