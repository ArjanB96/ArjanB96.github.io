import { useEffect, useState } from 'react'
import SeatedBert from './components/Throne'
import AudioPlayer from './components/AudioPlayer'
import Decor from './components/Decor'
import MusicToggle from './components/MusicToggle'
import Roulette from './games/roulette/Roulette'
import Kluis from './games/kluis/Kluis'
import Entrance from './components/Entrance'
import { line, speak, load } from './services'

/** Nieuwe spellen toevoegen = één regel in deze lijst + eigen map in src/games/ */
const GAMES = [{ id: 'roulette', name: 'Roulette', sub: 'Betreed de tafel', ready: true }, { id: 'kluis', name: '🧨 Berts Kluis', sub: 'Kraak de kluis', ready: true }, { id: 'blackjack', name: 'Blackjack', sub: 'Binnenkort', ready: false },
  { id: 'poker', name: 'Poker', sub: 'Binnenkort', ready: false }, { id: 'more', name: 'Meer spellen', sub: 'Binnenkort', ready: false }]
export default function App() {
  const [route, setRoute] = useState(location.hash.slice(1) || 'home'), [open, setOpen] = useState(false), [said, setSaid] = useState(''), [intro, setIntro] = useState(false)
  useEffect(() => { const f = () => { setRoute(location.hash.slice(1) || 'home'); setOpen(false) }; addEventListener('hashchange', f); return () => removeEventListener('hashchange', f) }, [])
  const enter = () => { setOpen(true); setIntro(true); setTimeout(() => { location.hash = 'roulette' }, 1600) }
  if (route === 'roulette' && intro) return <><MusicToggle /><Entrance onDone={() => setIntro(false)} /></>
  if (route === 'kluis') return <><Decor /><MusicToggle /><div className="fade"><Kluis onExit={() => { location.hash = 'home' }} /></div></>
  if (route === 'roulette') return <><Decor /><MusicToggle /><div className="fade"><Roulette onExit={() => { location.hash = 'home' }} /></div></>
  return (<>
    <Decor /><MusicToggle />
    <div className={`home ${open ? 'opening' : ''}`}>
      <h1 className="logo">Berts<span>Casino</span></h1>
      <SeatedBert mood="idle" talking={!!said} said={said || 'Welkom, a neef! Bert ruikt geld!'} />
      <button className="btn" onClick={() => { const t = line('welcome'); setSaid(t); speak(t, load().speech) }}>🎤 Laat Bert praten</button>
      <div className="doorwrap"><button className="door" onClick={enter} aria-label="Roulette – Betreed de tafel"><div className="leaf l"/><div className="leaf r"/><div className="room-in"><img src="./roulette-tafel.svg" alt="Roulettetafel" /></div><span>Roulette – Betreed de tafel</span></button></div>
      <div className="games">{GAMES.filter(g => g.id !== 'roulette').map(g => g.ready
        ? <button key={g.id} className="game on" onClick={() => { location.hash = g.id }}><b>{g.name}</b><small>{g.sub}</small></button>
        : <div key={g.id} className="game off"><b>{g.name}</b><small>{g.sub}</small></div>)}</div>
      <AudioPlayer />
      <p className="fine">Alleen virtueel speelgeld zonder echte waarde.</p>
    </div>
  </>)
}
