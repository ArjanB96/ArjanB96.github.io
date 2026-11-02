import { CONFIG, GameConfig } from './config'
import { playRound } from './engine'
import { seeded } from './rng'

/** Speelt n rondes met een vaste seed en meet de spelbalans (terugbetaling, winkans, bonusfrequentie) */
export function simulate(n: number, seed = 1, cfg: GameConfig = CONFIG) {
  const rng = seeded(seed)
  let won = 0, hits = 0, bonus = 0, max = 0
  for (let i = 0; i < n; i++) {
    const r = playRound(1, rng, cfg)
    won += r.total; if (r.total > 0) hits++; if (r.bonus) bonus++; max = Math.max(max, r.total)
  }
  return { rtp: won / n, hitRate: hits / n, bonusEvery: bonus ? n / bonus : Infinity, maxWin: max }
}
