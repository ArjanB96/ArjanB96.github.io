import { useRef, useState } from 'react'
/** Themesong voor iedereen: bestand staat in public/themesong.mp3 */
export default function AudioPlayer() {
  const a = useRef<HTMLAudioElement>(null)
  const [play, setPlay] = useState(false)
  const toggle = () => { const e = a.current; if (!e) return; e.volume = 0.3; if (e.paused) { e.play().then(() => setPlay(true)).catch(() => {}) } else { e.pause(); setPlay(false) } }
  return (
    <div className="player">
      <span className="gold label">🎵 Luister Themesong</span>
      <audio ref={a} src="./themesong.mp3" loop />
      <button className="btn play" onClick={toggle} aria-label="Luister Themesong">{play ? '⏸ Pauze' : '▶ Speel'}</button>
    </div>
  )
}
