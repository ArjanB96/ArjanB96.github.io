import { useEffect, useState } from 'react'
import { GAME_NAMES, GameId, Score, fetchTop } from '../services/hof'

const eur = (n: number) => '€' + n.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const day = (iso: string) => new Date(iso).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })

/** Hall of Fame op de homepage: top 10 grootste klappers per spel */
export default function HallOfFame({ me }: { me?: string }) {
  const [game, setGame] = useState<GameId>('roulette'), [list, setList] = useState<Score[] | null>(null), [err, setErr] = useState('')
  useEffect(() => { let on = true; setList(null); setErr('')
    fetchTop(game, true).then(l => on && setList(l)).catch(e => on && setErr(String(e.message || e)))
    return () => { on = false } }, [game])
  return (
    <section className="hof" aria-label="Hall of Fame">
      <h2 className="logo hof-title">🏆 Hall of <span>Fame</span></h2>
      <div className="hof-tabs" role="tablist">{(Object.keys(GAME_NAMES) as GameId[]).map(g =>
        <button key={g} role="tab" aria-selected={game === g} className={`btn ${game === g ? 'on' : ''}`} onClick={() => setGame(g)}>{GAME_NAMES[g]}</button>)}</div>
      {err ? <p className="hof-msg">De Hall of Fame is even niet bereikbaar.</p>
        : !list ? <p className="hof-msg">Bert telt de buit…</p>
        : !list.length ? <p className="hof-msg">Nog niemand! Pak als eerste een plek in de top 10.</p>
        : <ol className="hof-list">{list.map((s, i) =>
            <li key={i} className={`${i < 3 ? 'p' + (i + 1) : ''} ${me && s.name === me ? 'me' : ''}`}>
              <span className="rank">{['🥇', '🥈', '🥉'][i] || i + 1}</span><b className="nm">{s.name}</b>
              <span className="amt">{eur(s.amount)}</span><small>{Math.round(s.amount / s.bet)}× · {day(s.created_at)}</small>
            </li>)}</ol>}
    </section>
  )
}
