/** Berts Kluis: 6x6 cascade-gokkast met clusters, wilds, dynamiet en een Overval-bonus */
export const W = 6, H = 6
export const WILD = 6, BOOM = 7
export const SYMS = [
  { icon: '🍺', name: 'Bier', weight: 17 }, { icon: '🎲', name: 'Dobbelstenen', weight: 17 }, { icon: '💵', name: 'Cash', weight: 16 },
  { icon: '⌚', name: 'Rolex', weight: 16 }, { icon: '💎', name: 'Diamant', weight: 15 }, { icon: '👑', name: 'Kroon', weight: 13 },
  { icon: '🅱️', name: 'Bert-wild', weight: 2.5 }, { icon: '🧨', name: 'Dynamiet', weight: 1.2 }]
/** Uitbetaling × inzet per clustergrootte: 5, 6, 7, 8, 9, 10-11, 12-14, 15+ */
export const PAYS = [
  [0.2, 0.3, 0.4, 0.5, 0.7, 1, 1.5, 3], [0.25, 0.35, 0.5, 0.6, 0.8, 1.2, 2, 4], [0.3, 0.4, 0.6, 0.8, 1, 1.5, 2.5, 5],
  [0.4, 0.6, 0.8, 1, 1.5, 2, 4, 8], [0.6, 1, 1.5, 2, 3, 4, 8, 15], [1, 1.5, 2, 3, 5, 8, 15, 30]]
/** Afgestemd met een simulatie van 300.000 spins: ± 96% terugbetaling, winst in ± 45% van de spins, Overval ± 1 op 170 */
export const SCALE = 2, METER = 42, FREE = 8, RETRIGGER = 4, MAX_WIN = 5000
export const BETS = [0.2, 0.5, 1, 2, 5, 10, 20, 50]

export type Rng = () => number
/** Eerlijke willekeur via de Crypto API */
export const cryptoRng: Rng = () => { const a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] / 0x100000000 }
const TOTAL = SYMS.reduce((s, x) => s + x.weight, 0)
const pick = (rng: Rng) => { let r = rng() * TOTAL; for (let i = 0; i < SYMS.length; i++) { r -= SYMS[i].weight; if (r < 0) return i } return 0 }
const bucket = (n: number) => n >= 15 ? 7 : n >= 12 ? 6 : n >= 10 ? 5 : n - 5
export const payOf = (s: number, size: number) => PAYS[s][bucket(size)] * SCALE

/** Eén tussenstand: het raster (index = rij*W+kolom), hoe ver elk vakje viel, en wat er weggaat */
export interface Step { grid: number[]; fall: number[]; hits: number[]; win: number; kind: 'win' | 'boom' | 'end'; mult: number }
export interface Spin { steps: Step[]; total: number; removed: number; mult: number }

export function clusters(g: number[]) {
  const out: { sym: number; cells: number[] }[] = []
  for (let s = 0; s < WILD; s++) {
    const seen = new Set<number>()
    for (let i = 0; i < g.length; i++) {
      if (g[i] !== s || seen.has(i)) continue
      const cells: number[] = [], q = [i]; seen.add(i)
      while (q.length) {
        const j = q.pop()!, r = Math.floor(j / W), c = j % W; cells.push(j)
        for (const [rr, cc] of [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]]) {
          const k = rr * W + cc
          if (rr >= 0 && rr < H && cc >= 0 && cc < W && !seen.has(k) && (g[k] === s || g[k] === WILD)) { seen.add(k); q.push(k) }
        }
      }
      if (cells.length >= 5) out.push({ sym: s, cells })
    }
  }
  return out
}

/** Weggehaalde vakjes laten vallen en van boven aanvullen */
function collapse(g: number[], gone: Set<number>, rng: Rng) {
  const ng = new Array(W * H).fill(0), fall = new Array(W * H).fill(0)
  for (let c = 0; c < W; c++) {
    let to = H - 1
    for (let r = H - 1; r >= 0; r--) if (!gone.has(r * W + c)) { ng[to * W + c] = g[r * W + c]; fall[to * W + c] = to - r; to-- }
    const missing = to + 1
    for (let r = to; r >= 0; r--) { ng[r * W + c] = pick(rng); fall[r * W + c] = missing }
  }
  return { ng, fall }
}

/** Eén spin met alle cascades. free = Overval-spin: elke winnende cascade verhoogt de vermenigvuldiger */
export function spin(bet: number, rng: Rng, free = false, mult = 1): Spin {
  let grid = Array.from({ length: W * H }, () => pick(rng)), fall = new Array(W * H).fill(H)
  const steps: Step[] = []; let total = 0, removed = 0
  for (let n = 0; n < 80; n++) {
    const cl = clusters(grid), m = free ? mult : 1
    let gone: Set<number>, win = 0, kind: Step['kind']
    if (cl.length) { gone = new Set(cl.flatMap(x => x.cells)); win = cl.reduce((s, x) => s + payOf(x.sym, x.cells.length), 0) * bet * m; kind = 'win' }
    else {
      const booms = grid.flatMap((s, i) => s === BOOM ? [i] : [])
      if (!booms.length) { steps.push({ grid, fall, hits: [], win: 0, kind: 'end', mult: m }); break }
      gone = new Set(); kind = 'boom'
      for (const b of booms) { const r = Math.floor(b / W), c = b % W
        for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) { const rr = r + dr, cc = c + dc; if (rr >= 0 && rr < H && cc >= 0 && cc < W) gone.add(rr * W + cc) } }
    }
    steps.push({ grid, fall, hits: [...gone], win, kind, mult: m })
    total += win; removed += gone.size
    if (free && kind === 'win') mult++
    ;({ ng: grid, fall } = collapse(grid, gone, rng))
  }
  return { steps, total, removed, mult }
}
