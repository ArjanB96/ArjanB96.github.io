import { useEffect, useState } from 'react'
import SeatedBert from './components/Throne'
import AudioPlayer from './components/AudioPlayer'
import Decor from './components/Decor'
import MusicToggle from './components/MusicToggle'
import Roulette from './games/roulette/Roulette'
import Kluis from './games/kluis/Kluis'
import SpaceRaiders from './games/spaceraiders/SpaceRaiders'
import Dekhengsten from './games/dekhengsten/Dekhengsten'
import Entrance from './components/Entrance'
import Gate from './components/Gate'
import HallOfFame from './components/HallOfFame'
import { logVisit } from './services/hof'
import { line, speak, load } from './services'

/** Nieuwe spellen toevoegen = één regel in deze lijst + eigen map in src/games/ */
const GAMES = [{ id: 'roulette', name: '🎰 Roulette', sub: 'Betreed de tafel', ready: true }, { id: 'kluis', name: '🧨 Berts Kluis', sub: 'Kraak de kluis', ready: true }, { id: 'space', name: '🚀 Berts Space Raiders', sub: 'Lanceer de buit', ready: true }, { id: 'race', name: '🐎 Dekhengsten Race', sub: 'Zet in op je hengst', ready: true }, { id: 'blackjack', name: 'Blackjack', sub: 'Binnenkort', ready: false },
  { id: 'poker', name: 'Poker', sub: 'Binnenkort', ready: false }, { id: 'more', name: 'Meer spellen', sub: 'Binnenkort', ready: false }]
/** Eén keer per browsersessie langs het startscherm (en eventueel de cutscene) */
const SK = 'bc.in'
const wasIn = () => { try { return sessionStorage.getItem(SK) === '1' } catch { return false } }
export default function App() {
  const [route, setRoute] = useState(location.hash.slice(1) || 'home'), [said, setSaid] = useState(''), [stage, setStage] = useState<'gate' | 'intro' | 'in'>(() => wasIn() ? 'in' : 'gate')
  useEffect(() => { const f = () => { setRoute(location.hash.slice(1) || 'home') }; addEventListener('hashchange', f); return () => removeEventListener('hashchange', f) }, [])
  const goIn = () => { try { sessionStorage.setItem(SK, '1') } catch {}; logVisit(load().name); setStage('in') }
  if (stage === 'gate') return <><Decor /><MusicToggle /><Gate onFull={() => setStage('intro')} onQuick={goIn} /></>
  if (stage === 'intro') return <><MusicToggle /><Entrance onDone={goIn} /></>
  if (route === 'race') return <><Decor /><MusicToggle /><div className="fade"><Dekhengsten onExit={() => { location.hash = 'home' }} /></div></>
  if (route === 'space') return <><MusicToggle /><div className="fade"><SpaceRaiders onExit={() => { location.hash = 'home' }} /></div></>
  if (route === 'kluis') return <><Decor /><MusicToggle /><div className="fade"><Kluis onExit={() => { location.hash = 'home' }} /></div></>
  if (route === 'roulette') return <><Decor /><MusicToggle /><div className="fade"><Roulette onExit={() => { location.hash = 'home' }} /></div></>
  return (<>
    <Decor /><MusicToggle />
    <div className="home">
      <h1 className="logo">Berts<span>Casino</span></h1>
      <SeatedBert mood="idle" talking={!!said} said={said || `Welkom, ${load().name || 'a neef'}! Bert ruikt geld!`} />
      <button className="btn" onClick={() => { const t = line('welcome'); setSaid(t); speak(t, load().speech) }}>🎤 Laat Bert praten</button>
      <div className="games">{GAMES.map(g => g.ready
        ? <button key={g.id} className="game on" onClick={() => { location.hash = g.id }}><b>{g.name}</b><small>{g.sub}</small></button>
        : <div key={g.id} className="game off"><b>{g.name}</b><small>{g.sub}</small></div>)}</div>
      <HallOfFame me={load().name} />
      <AudioPlayer />
      <p className="fine">Alleen virtueel speelgeld zonder echte waarde.</p>
    </div>
  </>)
}
