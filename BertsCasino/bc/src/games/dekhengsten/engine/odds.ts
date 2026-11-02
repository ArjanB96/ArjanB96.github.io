import { HORSES, Horse, HorseId } from './horses'

/**
 * Odds-notatie "o:1": bij winst krijg je o × je inzet als winst, plus je inzet terug.
 * 2:1 op €10 = €20 winst + €10 inzet = €30 uitbetaling.
 */
export const payoutFor = (stake: number, odds: number) => Math.round(stake * (odds + 1) * 100) / 100

/** Kans die de odds uitdrukken (zonder marge): 1 / (o + 1) */
export const impliedChance = (odds: number) => 1 / (odds + 1)

/** Winkans per paard volgens de odds, genormaliseerd naar samen 100%. Hierop is de simulatie afgestemd. */
export function targetChances(horses: Horse[] = HORSES) {
  const raw = horses.map(h => impliedChance(h.odds)), sum = raw.reduce((a, b) => a + b, 0)
  return Object.fromEntries(horses.map((h, i) => [h.id, raw[i] / sum])) as Record<HorseId, number>
}
/** Verwachte terugbetaling van elke weddenschap (gelijk voor alle paarden bij genormaliseerde kansen) */
export const expectedReturn = (horses: Horse[] = HORSES) => 1 / horses.reduce((s, h) => s + impliedChance(h.odds), 0)

/** Weddenschappen: nu alleen "winnaar", maar het type maakt uitbreiding (plaats, top 3, …) eenvoudig */
export type Bet = { type: 'win'; horse: HorseId; stake: number; odds: number }
export function settle(bet: Bet, order: HorseId[]) {
  if (bet.type === 'win') { const won = order[0] === bet.horse; return { won, payout: won ? payoutFor(bet.stake, bet.odds) : 0 } }
  return { won: false, payout: 0 }
}
