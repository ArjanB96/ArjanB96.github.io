import Bert, { Mood } from '../../../components/Bert'
import { Cue } from '../engine/race'

/** Welke Bert-stemming bij welke animatie hoort */
const MOOD: Record<Cue | 'sad' | 'idle', Mood> = { hype: 'win', jump: 'win', lean: 'wow', slam: 'wow', shock: 'wow', laugh: 'win', drink: 'idle', sad: 'lose', idle: 'idle' }

/** Gouden commentatorhokje met de bestaande Bert, een microfoon en zijn biertje */
export default function Booth({ cue, text, talking }: { cue: Cue | 'sad' | 'idle'; text: string; talking: boolean }) {
  return (
    <div className={`booth cue-${cue}`}>
      <div className="booth-bert"><Bert mood={MOOD[cue]} talking={talking} said="" /></div>
      <svg viewBox="0 0 40 60" className="mic" aria-hidden="true"><rect x="16" y="22" width="8" height="34" rx="3" fill="#222"/><ellipse cx="20" cy="14" rx="11" ry="13" fill="#888" stroke="#d4a017" strokeWidth="2"/><path d="M10 12h20M10 17h20M12 7h16" stroke="#555"/></svg>
      <div className="booth-desk"><span>BERT · LIVE</span></div>
      {text && <div className="booth-say" key={text}>{text}</div>}
    </div>
  )
}
