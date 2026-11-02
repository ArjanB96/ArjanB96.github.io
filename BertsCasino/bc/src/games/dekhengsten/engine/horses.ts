/** De zes vaste deelnemers van de Dekhengsten Race. Namen staan vast; odds en statistieken zijn instelbaar. */
export type HorseId = 'schlong' | 'anabool' | 'smokkel' | 'dekhengst' | 'tollie' | 'leroy'

export interface Horse {
  id: HorseId; no: number; name: string
  /** Odds "o:1": winst = o × inzet, plus de inzet terug */
  odds: number
  /** Statistieken 1-10 (voor de kaart én de simulatie) */
  stats: { speed: number; accel: number; stamina: number; chaos: number }
  /** Afstemming zodat de werkelijke winkans past bij de odds (gesimuleerd met 30.000 races per ronde; gecontroleerd in race.test.ts) */
  pace: number
  /** Kleur van de jockeykleding en het nummer */
  silks: string
  trait: string; blurb: string; special: string
}

export const HORSES: Horse[] = [
  { id: 'schlong', no: 1, name: 'Horse Cock', odds: 6, stats: { speed: 6, accel: 3, stamina: 8, chaos: 5 }, pace: 1.1531, silks: '#7a1426',
    trait: 'Slechte start, maar een explosieve eindsprint in de laatste 20%', blurb: 'Groot, breed, gouden kettingen. Komt pas wakker als hij de finish ruikt.', special: 'Horse Cock ruikt de finish!' },
  { id: 'anabool', no: 2, name: 'Anabool', odds: 2, stats: { speed: 9, accel: 9, stamina: 4, chaos: 4 }, pace: 1.0627, silks: '#1d4fa3',
    trait: 'Vliegende start en hoge topsnelheid, maar raakt oververmoeid als hij te vroeg te hard gaat', blurb: 'Spieren op spieren. Heeft vanochtend vier ontbijtjes en een spuitje vitamines gehad.', special: 'Anabool gaat volledig door het lint!' },
  { id: 'smokkel', no: 3, name: 'Smokkelpony', odds: 5, stats: { speed: 6, accel: 6, stamina: 6, chaos: 8 }, pace: 1.1261, silks: '#2f6b2f',
    trait: 'Onvoorspelbaar: illegale sprints, verdachte manoeuvres en plotselinge vertraging', blurb: 'Niemand weet waar hij vandaan komt. Zijn papieren ook niet.', special: 'Smokkelpony heeft weer iets geregeld!' },
  { id: 'dekhengst', no: 4, name: 'Dekhengst', odds: 3, stats: { speed: 8, accel: 7, stamina: 8, chaos: 2 }, pace: 1.053, silks: '#d4a017',
    trait: 'Constant en betrouwbaar, met een dominante inhaalactie halverwege', blurb: 'Glanzende vacht, föhnkapsel, ego zo groot als de tribune. De naamgever van deze race.', special: 'De Dekhengst laat zich niet kennen!' },
  { id: 'tollie', no: 5, name: 'Paardentollie', odds: 8, stats: { speed: 4, accel: 5, stamina: 5, chaos: 10 }, pace: 1.1877, silks: '#9b30c9',
    trait: 'Extreem onvoorspelbaar: kleine kans op een gigantische boost, maar kan ook volledig instorten', blurb: 'Scheve zonnebril, manen alle kanten op. Weet niet zeker welke kant de finish is.', special: 'PAARDENTOLLIE IS NIET MEER TE HOUDEN!' },
  { id: 'leroy', no: 6, name: 'Leroy', odds: 4, stats: { speed: 7, accel: 5, stamina: 6, chaos: 6 }, pace: 1.0851, silks: '#c9781a',
    trait: 'Heupklachten, maar uit het niets een verrassende eindsprint', blurb: 'Bruin-wit gevlekt, djerrie in de mondhoek. Snapt eigenlijk niet waarom hij hier staat. Publiekslieveling.', special: 'LEROYYYY! DIE KOMT ER NOG EVEN LANGS!' },
]
export const byId = (id: HorseId) => HORSES.find(h => h.id === id)!
