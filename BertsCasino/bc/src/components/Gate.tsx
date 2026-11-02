import SeatedBert from './Throne'
import { load, save, speak } from '../services'

/**
 * Startscherm vóór het casino. De klik hier zorgt er ook voor dat de browser geluid toestaat.
 * Nieuwe bezoekers krijgen de hele cutscene; bekende bezoekers alleen een korte begroeting.
 */
export default function Gate({ onFull, onQuick }: { onFull: () => void; onQuick: () => void }) {
  const name = load().name
  const quick = () => { speak(`Ewa ${name}, daar ben je weer!`, load().speech); onQuick() }
  return (
    <div className="gate">
      <h1 className="logo">Berts<span>Casino</span></h1>
      <SeatedBert mood="idle" talking={false} said={name ? `Ewa ${name}, daar ben je weer!` : 'Ewa, nieuw gezicht! Kom binnen, a neef.'} />
      {name ? <div className="gate-acts">
        <button className="btn spin gate-go" onClick={quick}>🚪 Ga naar binnen</button>
        <button className="btn" onClick={() => { save({ name: undefined, drink: undefined }); onFull() }}>Ik ben niet {name}</button>
      </div> : <div className="gate-acts"><button className="btn spin gate-go" onClick={onFull}>🚪 Betreed BertsCasino</button></div>}
      <p className="fine">Alleen virtueel speelgeld zonder echte waarde.</p>
    </div>
  )
}
