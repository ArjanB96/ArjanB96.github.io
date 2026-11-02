import { CONFIG, GameConfig, PORTAL, symColor } from './config'
import { Crew, addPoints, copyCrew, newCrew } from './crew'
import { Grid, collapse, fillGrid, findClusters } from './grid'
import { cents, clusterPay } from './payout'
import { Rng } from './rng'
import { boost, laserTargets, teleport, treasure } from './abilities'

/**
 * Eén ronde wordt volledig vooraf berekend als een lijst gebeurtenissen.
 * De interface speelt precies deze gebeurtenissen af, dus beeld en uitkomst lopen nooit uiteen.
 */
export type GameEvent =
  | { t: 'spin'; free: boolean; left: number }
  | { t: 'drop'; grid: Grid; fall: number[] }
  | { t: 'win'; clusters: { sym: number; cells: number[]; pay: number }[]; amount: number; mult: number }
  | { t: 'pop'; cells: number[] }
  | { t: 'collect'; gains: number[]; points: number[]; levels: number[]; fuel: number }
  | { t: 'levelup'; color: number; level: number }
  | { t: 'laser'; level: number; cells: number[] }
  | { t: 'teleport'; level: number; cells: number[]; wilds: number[]; sym: number; grid: Grid }
  | { t: 'boost'; level: number; add: number; mult: number }
  | { t: 'treasure'; level: number; amount: number; fuel: number; jackpot: boolean }
  | { t: 'bonus'; reason: 'portals' | 'fuel' | 'robot'; spins: number }
  | { t: 'retrigger'; add: number; reason: 'portals' | 'robot' }
  | { t: 'finale'; levels: number[]; parts: number[]; amount: number }
  | { t: 'cap'; total: number }
  | { t: 'end'; total: number }

/** Toestand die tijdens een spin (en in de bonus over spins heen) meeloopt */
export interface SpinState { crew: Crew; mult: number; fuel: number; free: boolean; jackpot: boolean }
export interface Round { events: GameEvent[]; total: number; bonus: boolean }

const winOf = (events: GameEvent[]) => events.reduce((s, e) => s + (e.t === 'win' || e.t === 'treasure' || e.t === 'finale' ? e.amount : 0), 0)

/** Verzamelt de weggehaalde symbolen bij de bemanning; geeft nieuwe niveaus terug */
function collect(st: SpinState, gains: number[], cfg: GameConfig, ev: GameEvent[]) {
  const factor = st.free ? cfg.bonusPointFactor : 1, ups: { color: number; level: number }[] = []
  let got = 0
  gains.forEach((n, c) => { if (n) { ups.push(...addPoints(st.crew, c, n * factor, cfg)); got += n * factor } })
  if (!st.free) st.fuel += got
  ev.push({ t: 'collect', gains: gains.map(n => n * factor), points: st.crew.points.slice(), levels: st.crew.levels.slice(), fuel: st.fuel })
  return ups
}
const gainsOf = (g: Grid, cells: number[], perCluster?: { sym: number; cells: number[] }[]) => {
  const gains = [0, 0, 0, 0]
  if (perCluster) perCluster.forEach(c => { gains[symColor(c.sym)] += c.cells.length })
  else cells.forEach(i => { const c = symColor(g[i]); if (c >= 0) gains[c]++ })
  return gains
}

/** Speelt één spin met alle cascades en bemanningsacties */
export function playSpin(st: SpinState, bet: number, rng: Rng, cfg: GameConfig = CONFIG) {
  const ev: GameEvent[] = []
  let grid = fillGrid(rng, cfg), fall = new Array(grid.length).fill(cfg.rows)
  ev.push({ t: 'drop', grid, fall })
  /** Haalt vakjes weg, laat de rest vallen en voert eventuele niveau-acties uit */
  const remove = (cells: number[], ups: { color: number; level: number }[]) => {
    ev.push({ t: 'pop', cells })
    ;({ grid, fall } = collapse(grid, new Set(cells), rng, cfg))
    ev.push({ t: 'drop', grid, fall })
    runUps(ups)
  }
  const runUps = (ups: { color: number; level: number }[]) => {
    for (const { color, level } of ups) {
      ev.push({ t: 'levelup', color, level })
      if (color === 0) {
        const cells = laserTargets(grid, level, rng, cfg)
        ev.push({ t: 'laser', level, cells })
        const more = collect(st, gainsOf(grid, cells), cfg, ev)
        remove(cells, more)
      } else if (color === 1) {
        const tp = teleport(grid, level, rng, cfg); grid = tp.grid
        ev.push({ t: 'teleport', level, cells: tp.cells, wilds: tp.wilds, sym: tp.sym, grid })
      } else if (color === 2) {
        const add = boost(level, cfg); st.mult += add
        ev.push({ t: 'boost', level, add, mult: st.mult })
      } else {
        const tr = treasure(level, cfg); st.fuel += tr.fuel; if (tr.jackpot) st.jackpot = true
        ev.push({ t: 'treasure', level, amount: cents(tr.times * bet), fuel: st.fuel, jackpot: tr.jackpot })
      }
    }
  }
  for (let n = 0; n < 120; n++) {
    const cl = findClusters(grid, cfg)
    if (!cl.length) break
    const clusters = cl.map(c => ({ ...c, pay: cents(clusterPay(c.sym, c.cells.length, cfg) * bet * st.mult) }))
    ev.push({ t: 'win', clusters, amount: cents(clusters.reduce((s, c) => s + c.pay, 0)), mult: st.mult })
    const cells = [...new Set(cl.flatMap(c => c.cells))].sort((a, b) => a - b)
    remove(cells, collect(st, gainsOf(grid, cells, cl), cfg, ev))
  }
  return { events: ev, portals: grid.filter(s => s === PORTAL).length }
}

/** Een volledige betaalde ronde: basis-spin, eventueel de Ruimte-expeditie en de Thuisvlucht */
export function playRound(bet: number, rng: Rng, cfg: GameConfig = CONFIG): Round {
  const events: GameEvent[] = []
  const st: SpinState = { crew: newCrew(), mult: 1, fuel: 0, free: false, jackpot: false }
  events.push({ t: 'spin', free: false, left: 0 })
  const base = playSpin(st, bet, rng, cfg); events.push(...base.events)
  const reason = st.jackpot ? 'robot' : base.portals >= cfg.portalsForBonus ? 'portals' : st.fuel >= cfg.fuelMax ? 'fuel' : null
  if (reason) {
    // Bemanning en vermenigvuldiger gaan mee de bonus in en blijven tot het einde staan
    const bs: SpinState = { crew: copyCrew(st.crew), mult: st.mult, fuel: st.fuel, free: true, jackpot: false }
    let left = cfg.freeSpins
    events.push({ t: 'bonus', reason, spins: left })
    while (left > 0) {
      left--; bs.jackpot = false
      events.push({ t: 'spin', free: true, left })
      const s = playSpin(bs, bet, rng, cfg); events.push(...s.events)
      if (s.portals >= cfg.portalsForBonus) { left += cfg.retrigger; events.push({ t: 'retrigger', add: cfg.retrigger, reason: 'portals' }) }
      if (bs.jackpot) { left += cfg.goldExtraSpins; events.push({ t: 'retrigger', add: cfg.goldExtraSpins, reason: 'robot' }) }
      if (winOf(events) >= cfg.maxWin * bet) break
    }
    const parts = bs.crew.levels.map(l => cents(cfg.finale[l] * bet * bs.mult))
    events.push({ t: 'finale', levels: bs.crew.levels.slice(), parts, amount: cents(parts.reduce((a, b) => a + b, 0)) })
  }
  let total = cents(winOf(events))
  if (total > cfg.maxWin * bet) { total = cents(cfg.maxWin * bet); events.push({ t: 'cap', total }) }
  events.push({ t: 'end', total })
  return { events, total, bonus: !!reason }
}
