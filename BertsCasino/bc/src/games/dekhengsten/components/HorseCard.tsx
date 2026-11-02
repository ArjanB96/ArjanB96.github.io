import { Horse } from '../engine/horses'
import HorseArt from './HorseArt'

const STATS: [keyof Horse['stats'], string][] = [['speed', 'Snelheid'], ['accel', 'Acceleratie'], ['stamina', 'Uithoudingsvermogen'], ['chaos', 'Onvoorspelbaarheid']]

/** Kaart in de paddock: art, odds, winkans, statistieken en eigenschap */
export default function HorseCard({ horse, chance, badge, selected, onSelect }: { horse: Horse; chance: number; badge?: string; selected: boolean; onSelect: () => void }) {
  return (
    <button className={`hcard ${selected ? 'sel' : ''}`} onClick={onSelect} aria-pressed={selected} style={{ ['--silks' as string]: horse.silks }}>
      {badge && <span className={`hbadge ${badge === 'FAVORIET' ? 'fav' : 'out'}`}>{badge}</span>}
      <div className="hcard-art"><HorseArt id={horse.id} silks={horse.silks} no={horse.no} /></div>
      <div className="hcard-head"><span className="hno">{horse.no}</span><b>{horse.name}</b><span className="hodds">{horse.odds}:1</span></div>
      <div className="hchance">± {Math.round(chance * 100)}% winkans</div>
      <div className="hstats">{STATS.map(([k, label]) => <div key={k} className="hstat"><span>{label}</span><i><b style={{ width: `${horse.stats[k] * 10}%` }} /></i></div>)}</div>
      <p className="htrait">⭐ {horse.trait}</p>
      <p className="hblurb">{horse.blurb}</p>
    </button>
  )
}
