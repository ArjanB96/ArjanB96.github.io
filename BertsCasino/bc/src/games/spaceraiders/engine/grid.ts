import { GameConfig, WILD, isRegular } from './config'
import { Rng, pickWeighted } from './rng'

/** Raster als platte lijst: index = rij * cols + kolom, rij 0 is bovenaan */
export type Grid = number[]
export interface Cluster { sym: number; cells: number[] }

export function neighbours(i: number, cfg: GameConfig) {
  const r = Math.floor(i / cfg.cols), c = i % cfg.cols, out: number[] = []
  if (r > 0) out.push(i - cfg.cols); if (r < cfg.rows - 1) out.push(i + cfg.cols)
  if (c > 0) out.push(i - 1); if (c < cfg.cols - 1) out.push(i + 1)
  return out
}

export const randomSymbol = (rng: Rng, cfg: GameConfig) => pickWeighted(rng, cfg.weights)
export const fillGrid = (rng: Rng, cfg: GameConfig): Grid => Array.from({ length: cfg.cols * cfg.rows }, () => randomSymbol(rng, cfg))

/**
 * Clusters: aangrenzende (horizontaal/verticaal) gelijke symbolen, wilds tellen voor elke kleur mee.
 * Een wild kan dus in meerdere clusters zitten. Alleen clusters van minimaal minCluster tellen.
 */
export function findClusters(g: Grid, cfg: GameConfig): Cluster[] {
  const out: Cluster[] = []
  for (let s = 0; s < WILD; s++) {
    const seen = new Set<number>()
    for (let i = 0; i < g.length; i++) {
      if (g[i] !== s || seen.has(i)) continue
      const cells: number[] = [], q = [i]; seen.add(i)
      while (q.length) {
        const j = q.pop()!; cells.push(j)
        for (const k of neighbours(j, cfg)) if (!seen.has(k) && (g[k] === s || g[k] === WILD)) { seen.add(k); q.push(k) }
      }
      if (cells.length >= cfg.minCluster) out.push({ sym: s, cells: cells.sort((a, b) => a - b) })
    }
  }
  return out
}

/** Alle groepjes van gewone symbolen (ook te klein om te winnen), groot naar klein */
export function groups(g: Grid, cfg: GameConfig): Cluster[] {
  const seen = new Set<number>(), out: Cluster[] = []
  for (let i = 0; i < g.length; i++) {
    if (!isRegular(g[i]) || seen.has(i)) continue
    const s = g[i], cells: number[] = [], q = [i]; seen.add(i)
    while (q.length) { const j = q.pop()!; cells.push(j); for (const k of neighbours(j, cfg)) if (!seen.has(k) && g[k] === s) { seen.add(k); q.push(k) } }
    out.push({ sym: s, cells })
  }
  return out.sort((a, b) => b.cells.length - a.cells.length)
}

/**
 * Weggehaalde vakjes laten vallen en van boven aanvullen.
 * fall[i] = hoeveel rijen het symbool op plek i gevallen is (nieuwe symbolen vallen van boven het raster in).
 */
export function collapse(g: Grid, gone: Set<number>, rng: Rng, cfg: GameConfig) {
  const ng: Grid = new Array(g.length).fill(0), fall = new Array(g.length).fill(0)
  for (let c = 0; c < cfg.cols; c++) {
    let to = cfg.rows - 1
    for (let r = cfg.rows - 1; r >= 0; r--) { const i = r * cfg.cols + c; if (!gone.has(i)) { ng[to * cfg.cols + c] = g[i]; fall[to * cfg.cols + c] = to - r; to-- } }
    const missing = to + 1
    for (let r = to; r >= 0; r--) { ng[r * cfg.cols + c] = randomSymbol(rng, cfg); fall[r * cfg.cols + c] = missing }
  }
  return { grid: ng, fall }
}
