import { useEffect, useRef, useState } from 'react'
import { songGet, songPut } from '../services'
export default function AudioPlayer() {
  const a = useRef<HTMLAudioElement>(null)
  const [name, setName] = useState(''), [url, setUrl] = useState(''), [play, setPlay] = useState(false), [vol, setVol] = useState(0.3)
  const set = (f: File | null) => { if (url) URL.revokeObjectURL(url); setUrl(f ? URL.createObjectURL(f) : ''); setName(f ? f.name : ''); setPlay(false) }
  useEffect(() => { songGet().then(f => f && set(f)).catch(() => {}) }, [])
  useEffect(() => { if (a.current) a.current.volume = vol }, [vol, url])
  const toggle = () => { const e = a.current; if (!e || !url) return; if (e.paused) { e.play().then(() => setPlay(true)).catch(() => {}) } else { e.pause(); setPlay(false) } }
  return (
    <div className="player">
      <span className="gold">🎵 Themesong: {name || 'nog geen nummer'}</span>
      <audio ref={a} src={url || undefined} loop />
      <label className="btn">Kies nummer<input hidden type="file" accept="audio/*" onChange={async e => { const f = e.target.files?.[0]; if (f) { await songPut(f); set(f) } }} /></label>
      <button className="btn" disabled={!url} onClick={toggle}>{play ? '⏸ Pauze' : '▶ Speel'}</button>
      <input type="range" min="0" max="1" step="0.01" value={vol} onChange={e => setVol(+e.target.value)} aria-label="Volume" />
      <button className="btn" disabled={!url} onClick={async () => { await songPut(null); set(null) }}>Verwijder</button>
    </div>
  )
}
