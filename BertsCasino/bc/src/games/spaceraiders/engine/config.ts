/** Alle instelbare spelregels van Berts Space Raiders op één plek */
export const COLORS = ['red', 'blue', 'green', 'gold'] as const
export type Color = (typeof COLORS)[number]

/** Symbolen 0..7: kleur * 2 + (0 = planeet, 1 = edelsteen). Daarna de speciale symbolen. */
export const WILD = 8, PORTAL = 9
export const symColor = (s: number) => (s < WILD ? s >> 1 : -1)
export const isRegular = (s: number) => s >= 0 && s < WILD

export interface GameConfig {
  cols: number; rows: number; minCluster: number
  /** Kans-gewicht per symbool (index = symbool-id) */
  weights: number[]
  /** Uitbetaling × inzet per symbool, per clustergrootte-groep (zie sizeBuckets) */
  pays: number[][]
  /** Ondergrens van elke clustergrootte-groep */
  sizeBuckets: number[]
  payScale: number
  /** Totaal aantal punten dat nodig is voor niveau 1..5 */
  levelPoints: number[]
  laser: number[]; teleport: number[]; teleportWilds: number[]; boost: number[]; treasure: number[]
  treasureFuel: number; fuelMax: number; portalsForBonus: number
  freeSpins: number; retrigger: number; goldExtraSpins: number; bonusPointFactor: number
  /** Thuisvlucht: × inzet per bemanningslid, per eindniveau 0..5 */
  finale: number[]
  maxWin: number; bets: number[]
}

export const CONFIG: GameConfig = {
  cols: 6, rows: 5, minCluster: 5,
  //        rood planeet/steen, blauw, groen, goud, wild, poort
  weights: [15, 9, 15, 9, 15, 9, 13, 8, 5, 0.6],
  //            5     6     7     8     9    10  11-12 13-15  16+
  pays: [
    [0.2, 0.3, 0.4, 0.5, 0.7, 1, 1.5, 2.5, 5], [0.4, 0.6, 0.8, 1, 1.5, 2, 3, 5, 10],
    [0.2, 0.3, 0.4, 0.5, 0.7, 1, 1.5, 2.5, 5], [0.4, 0.6, 0.8, 1, 1.5, 2, 3, 5, 10],
    [0.2, 0.3, 0.4, 0.5, 0.7, 1, 1.5, 2.5, 5], [0.4, 0.6, 0.8, 1, 1.5, 2, 3, 5, 10],
    [0.3, 0.4, 0.6, 0.8, 1, 1.5, 2, 4, 8], [0.6, 0.9, 1.2, 1.6, 2.2, 3, 5, 8, 15]],
  sizeBuckets: [5, 6, 7, 8, 9, 10, 11, 13, 16],
  /** Afgestemd met simulate(): ± 95% terugbetaling, winst in ± 32% van de rondes, bonus ± 1 op 180 */
  payScale: 4.6,
  levelPoints: [10, 24, 42, 64, 90],
  laser: [2, 3, 5, 0, 0], teleport: [2, 3, 4, 5, 6], teleportWilds: [0, 0, 0, 1, 2], boost: [1, 1, 2, 2, 3], treasure: [1, 2, 4, 8, 20],
  treasureFuel: 10, fuelMax: 26, portalsForBonus: 3,
  freeSpins: 10, retrigger: 5, goldExtraSpins: 3, bonusPointFactor: 2,
  finale: [0, 0.5, 1, 2, 5, 10],
  maxWin: 10000, bets: [0.2, 0.5, 1, 2, 5, 10, 20, 50],
}
