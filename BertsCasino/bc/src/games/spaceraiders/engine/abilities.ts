import { GameConfig, PORTAL, WILD, isRegular } from './config'
import { Grid, groups, neighbours } from './grid'
import { Rng, randInt, sample } from './rng'

/** Rood – Kapitein Kreeftenschaar: laser. Niveau 1-3 losse vakjes, 4 een hele rij, 5 een kruis (rij + kolom). Poorten blijven staan. */
export function laserTargets(g: Grid, level: number, rng: Rng, cfg: GameConfig) {
  const free = g.flatMap((s, i) => (s === PORTAL ? [] : [i]))
  if (level <= 3) return sample(rng, free, cfg.laser[level - 1]).sort((a, b) => a - b)
  const r = randInt(rng, cfg.rows), c = randInt(rng, cfg.cols), set = new Set<number>()
  for (let x = 0; x < cfg.cols; x++) set.add(r * cfg.cols + x)
  if (level >= 5) for (let y = 0; y < cfg.rows; y++) set.add(y * cfg.cols + c)
  return [...set].filter(i => g[i] !== PORTAL).sort((a, b) => a - b)
}

/**
 * Blauw – Blauwe Donny: teleport. Neemt de grootste groep en verandert aangrenzende vakjes in dat symbool,
 * zodat de groep groeit. Vanaf niveau 4 worden sommige van die vakjes een wild.
 */
export function teleport(g: Grid, level: number, rng: Rng, cfg: GameConfig) {
  const grp = groups(g, cfg)[0]
  if (!grp) return { grid: g.slice(), sym: 0, cells: [] as number[], wilds: [] as number[] }
  const ng = g.slice(), inGroup = new Set(grp.cells), cells: number[] = []
  let frontier = grp.cells.slice()
  while (cells.length < cfg.teleport[level - 1] && frontier.length) {
    const next: number[] = []
    for (const f of frontier) for (const k of neighbours(f, cfg)) if (!inGroup.has(k) && isRegular(g[k]) && !next.includes(k)) next.push(k)
    for (const k of sample(rng, next, next.length)) { if (cells.length >= cfg.teleport[level - 1]) break; inGroup.add(k); cells.push(k) }
    frontier = next
  }
  const wilds = sample(rng, cells, cfg.teleportWilds[level - 1])
  for (const i of cells) ng[i] = wilds.includes(i) ? WILD : grp.sym
  return { grid: ng, sym: grp.sym, cells: cells.sort((a, b) => a - b), wilds }
}

/** Groen – Sjonnie Snotroggel: verhoogt de vermenigvuldiger */
export const boost = (level: number, cfg: GameConfig) => cfg.boost[level - 1]

/** Goud – Robo-Bert 3000: directe prijs (× inzet); niveau 4 geeft brandstof, niveau 5 start de bonus (of extra vluchten) */
export const treasure = (level: number, cfg: GameConfig) =>
  ({ times: cfg.treasure[level - 1], fuel: level === 4 ? cfg.treasureFuel : 0, jackpot: level === 5 })
