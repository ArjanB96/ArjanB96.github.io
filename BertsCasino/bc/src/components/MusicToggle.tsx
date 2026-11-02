import { useEffect, useState } from 'react'
import { musicOn, musicSet, musicStart } from '../services/music'
/** Vaste knop rechtsonder; muziek start bij de eerste klik/tik op de pagina */
export default function MusicToggle() {
  const [on, setOn] = useState(musicOn)
  useEffect(() => { const f = () => musicStart(); addEventListener('pointerdown', f, { once: true }); return () => removeEventListener('pointerdown', f) }, [])
  return <button className="btn music" onClick={() => { musicSet(!on); setOn(!on) }}>{on ? '🎷 Muziek uit' : '🎷 Muziek aan'}</button>
}
