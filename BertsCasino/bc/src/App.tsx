import { useEffect, useState } from 'react'
import Bert from './components/Bert'
import AudioPlayer from './components/AudioPlayer'
import Roulette from './games/roulette/Roulette'
import { line, speak, load } from './services'

/** Nieuwe spellen toevoegen = één regel in deze lijst + eigen map in src/games/ */
const GAMES = [{ id: 'roulette', name: 'Roulette', sub: 'Betreed de tafel', ready: true }, { id: 'blackjack', name: 'Blackjack', sub: 'Binnenkort', ready: false },
  { id: 'poker', name: 'Poker', sub: 'Binnenkort', ready: false }, { id: 'more', name: 'Meer spellen', sub: 'Binnenkort', ready: false }]
export default function App() {
  const [route, setRoute] = useState(location.hash.slice(1) || 'home'), [open, setOpen] = useState(false), [said, setSaid] = useState('')
  useEffect(() => { const f = () => { setRoute(location.hash.slice(1) || 'home'); setOpen(false) }; addEventListener('hashchange', f); return () => removeEventListener('hashchange', f) }, [])
  const enter = () => { setOpen(true); setTimeout(() => { location.hash = 'roulette' }, 1600) }
  if (route === 'roulette') return <div className="fade"><Roulette onExit={() => { location.hash = 'home' }} /></div>
  return (
    <div className={`home ${open ? 'opening' : ''}`}>
      <h1 className="logo">Berts<span>Casino</span></h1><p className="gold">★ Exclusief • Decadent • Een tikkie fout ★</p>
      <Bert mood="idle" talking={!!said} said={said || 'Welkom, a neef! Bert ruikt geld!'} />
      <button className="btn" onClick={() => { const t = line('welcome'); setSaid(t); speak(t, load().speech) }}>🎤 Laat Bert praten</button>
      <div className="doorwrap"><button className="door" onClick={enter} aria-label="Roulette – Betreed de tafel"><div className="leaf l"/><div className="leaf r"/><div className="room-in">🎰</div><span>Roulette – Betreed de tafel</span></button></div>
      <div className="games">{GAMES.filter(g => !g.ready).map(g => <div key={g.id} className="game off"><b>{g.name}</b><small>{g.sub}</small></div>)}</div>
      <AudioPlayer />
      <p className="fine">Alleen virtueel speelgeld zonder echte waarde.</p>
    </div>
  )
}
