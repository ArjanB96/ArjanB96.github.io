import { GameConfig } from './config'

/** Index van de clustergrootte-groep (5, 6, … 16+) */
export function bucket(size: number, cfg: GameConfig) {
  let b = -1
  for (let i = 0; i < cfg.sizeBuckets.length; i++) if (size >= cfg.sizeBuckets[i]) b = i
  return b
}
/** Uitbetaling als veelvoud van de inzet (zonder vermenigvuldiger) */
export function clusterPay(sym: number, size: number, cfg: GameConfig) {
  const b = bucket(size, cfg)
  return b < 0 ? 0 : cfg.pays[sym][b] * cfg.payScale
}
export const cents = (n: number) => Math.round(n * 100) / 100
