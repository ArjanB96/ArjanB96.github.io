import { describe, expect, it } from 'vitest'
import { CONFIG, GameConfig, PORTAL, WILD } from './config'
import { collapse, findClusters, groups } from './grid'
import { bucket, clusterPay } from './payout'
import { addPoints, levelFor, newCrew, progress } from './crew'
import { laserTargets, teleport } from './abilities'
import { GameEvent, playRound } from './engine'
import { seeded } from './rng'
import { simulate } from './simulate'

const cfg: GameConfig = CONFIG
/** Raster uit een tekening: één teken per vakje, . = dambord van blauwe en gouden edelstenen (vormt nooit een cluster) */
function draw(rows: string[]) {
  const map: Record<string, number> = { r: 0, R: 1, b: 2, B: 3, g: 4, G: 5, o: 6, O: 7, W: WILD, P: PORTAL }
  return rows.join('').split('').map((ch, i) => (ch === '.' ? ((i % 6) + Math.floor(i / 6)) % 2 ? 3 : 7 : map[ch]))
}

describe('clusters', () => {
  it('vindt 5 horizontaal aangrenzende gelijke symbolen', () => {
    const g = draw(['rrrrr.', '......', '......', '......', '......'])
    const cl = findClusters(g, cfg)
    expect(cl).toHaveLength(1)
    expect(cl[0]).toEqual({ sym: 0, cells: [0, 1, 2, 3, 4] })
  })
  it('telt diagonaal aangrenzend niet mee', () => {
    const g = draw(['r.....', '.r....', '..r...', '...r..', '....r.'])
    expect(findClusters(g, cfg).filter(c => c.sym === 0)).toHaveLength(0)
  })
  it('4 symbolen is te weinig', () => {
    expect(findClusters(draw(['rrrr..', '......', '......', '......', '......']), cfg).filter(c => c.sym === 0)).toHaveLength(0)
  })
  it('een wild telt voor meerdere kleuren tegelijk', () => {
    const g = draw(['rrWbb.', '..r.b.', '..r.b.', '......', '......'])
    const cl = findClusters(g, cfg)
    expect(cl.map(c => c.sym).sort()).toEqual([0, 2])
    expect(cl.every(c => c.cells.includes(2))).toBe(true)
  })
  it('groups sorteert van groot naar klein', () => {
    const gs = groups(draw(['rrr...', 'bb....', '......', '......', '......']), cfg)
    expect(gs[0].cells.length).toBeGreaterThanOrEqual(gs[1].cells.length)
  })
})

describe('vallen en aanvullen', () => {
  it('laat symbolen naar beneden vallen en vult bovenaan aan', () => {
    const g = draw(['g.....', 'r.....', 'r.....', 'b.....', '......'])
    const { grid, fall } = collapse(g, new Set([6, 12]), seeded(1), cfg)
    expect(grid[18]).toBe(2); expect(fall[18]).toBe(0) // blauw blijft liggen
    expect(grid[12]).toBe(4); expect(fall[12]).toBe(2) // groen valt 2 rijen
    expect(fall[0]).toBe(2); expect(fall[6]).toBe(2) // twee nieuwe symbolen van boven
    expect(grid).toHaveLength(30)
  })
})

describe('uitbetaling', () => {
  it('kiest de juiste grootte-groep', () => {
    expect(bucket(4, cfg)).toBe(-1); expect(bucket(5, cfg)).toBe(0); expect(bucket(12, cfg)).toBe(6); expect(bucket(30, cfg)).toBe(8)
  })
  it('edelstenen betalen meer dan planeten, groter betaalt meer', () => {
    expect(clusterPay(1, 5, cfg)).toBeGreaterThan(clusterPay(0, 5, cfg))
    expect(clusterPay(0, 9, cfg)).toBeGreaterThan(clusterPay(0, 5, cfg))
    expect(clusterPay(0, 4, cfg)).toBe(0)
  })
})

describe('bemanning en upgrades', () => {
  it('bereikt niveaus op de drempels, elk niveau precies één keer', () => {
    const crew = newCrew()
    expect(addPoints(crew, 0, cfg.levelPoints[0] - 1, cfg)).toEqual([])
    expect(addPoints(crew, 0, 1, cfg)).toEqual([{ color: 0, level: 1 }])
    expect(addPoints(crew, 0, 1000, cfg).map(u => u.level)).toEqual([2, 3, 4, 5])
    expect(crew.levels[0]).toBe(5); expect(progress(crew, 0, cfg)).toBe(1)
  })
  it('levelFor stopt bij het maximum', () => { expect(levelFor(99999, cfg)).toBe(cfg.levelPoints.length) })
})

describe('bemanningsacties', () => {
  const g = draw(['rbgoRB', 'GOrbgo', 'RBGOrb', 'goRBGO', 'P.....'])
  it('laser niveau 1-3 raakt het ingestelde aantal vakjes en nooit een poort', () => {
    for (let l = 1; l <= 3; l++) {
      const t = laserTargets(g, l, seeded(l), cfg)
      expect(t).toHaveLength(cfg.laser[l - 1]); expect(t).not.toContain(24)
    }
  })
  it('laser niveau 4 raakt een hele rij, niveau 5 een kruis', () => {
    const row = laserTargets(g, 4, seeded(3), cfg).filter(i => g[i] !== PORTAL)
    expect(new Set(row.map(i => Math.floor(i / 6))).size).toBe(1)
    expect(laserTargets(g, 5, seeded(3), cfg).length).toBeGreaterThan(row.length - 1)
  })
  it('teleport laat de grootste groep groeien met aangrenzende vakjes', () => {
    const t = teleport(draw(['rrr...', '......', '......', '......', '......']), 3, seeded(5), cfg)
    expect(t.cells).toHaveLength(cfg.teleport[2])
    expect(t.cells.every(i => t.grid[i] === t.sym || t.grid[i] === WILD)).toBe(true)
    expect(groups(t.grid, cfg)[0].cells.length).toBeGreaterThanOrEqual(3 + cfg.teleport[2] - cfg.teleportWilds[2])
  })
  it('teleport maakt vanaf niveau 4 wilds', () => {
    const t = teleport(draw(['rrr...', '......', '......', '......', '......']), 5, seeded(5), cfg)
    expect(t.wilds).toHaveLength(cfg.teleportWilds[4]); t.wilds.forEach(i => expect(t.grid[i]).toBe(WILD))
  })
})

describe('engine', () => {
  it('is reproduceerbaar met dezelfde seed', () => {
    expect(playRound(1, seeded(42))).toEqual(playRound(1, seeded(42)))
    expect(playRound(1, seeded(42))).not.toEqual(playRound(1, seeded(43)))
  })
  it('gebeurtenissen kloppen precies met de uitkomst', () => {
    for (let seed = 1; seed <= 300; seed++) {
      const r = playRound(2, seeded(seed))
      let grid: number[] = [], sum = 0, mult = 1
      for (const e of r.events as GameEvent[]) {
        if (e.t === 'drop' || e.t === 'teleport') grid = e.grid
        if (e.t === 'spin' && !e.free) mult = 1
        if (e.t === 'boost') { mult += e.add; expect(e.mult).toBe(mult) }
        if (e.t === 'win') {
          expect(e.mult).toBe(mult)
          for (const c of e.clusters) {
            expect(c.cells.length).toBeGreaterThanOrEqual(cfg.minCluster)
            c.cells.forEach(i => expect([c.sym, WILD]).toContain(grid[i]))
            expect(c.pay).toBeCloseTo(clusterPay(c.sym, c.cells.length, cfg) * 2 * mult, 2)
          }
        }
        if (e.t === 'win' || e.t === 'treasure' || e.t === 'finale') sum += e.amount
      }
      const end = r.events[r.events.length - 1]
      expect(end.t).toBe('end')
      expect(r.total).toBeCloseTo(Math.min(sum, cfg.maxWin * 2), 2)
      expect(r.bonus).toBe(r.events.some(e => e.t === 'bonus'))
    }
  })
  it('na de laatste cascade van een spin is er geen winnend cluster meer', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const ev = playRound(1, seeded(seed)).events
      ev.forEach((e, i) => {
        const next = ev[i + 1]
        if (e.t === 'drop' && (next?.t === 'spin' || next?.t === 'end' || next?.t === 'bonus' || next?.t === 'retrigger' || next?.t === 'finale')) expect(findClusters(e.grid, cfg)).toEqual([])
      })
    }
  })
  it('de bonus heeft gratis spins en eindigt met de Thuisvlucht', () => {
    let found = false
    for (let seed = 1; seed < 5000 && !found; seed++) {
      const r = playRound(1, seeded(seed))
      if (!r.bonus) continue
      found = true
      const free = r.events.filter(e => e.t === 'spin' && e.free).length
      expect(free).toBeGreaterThanOrEqual(cfg.freeSpins)
      expect(r.events.some(e => e.t === 'finale')).toBe(true)
    }
    expect(found).toBe(true)
  })
})

describe('spelbalans', () => {
  it('terugbetaling ligt in een redelijke band (reproduceerbaar, seed 7)', () => {
    const r = simulate(20000, 7)
    expect(r.rtp).toBeGreaterThan(0.8); expect(r.rtp).toBeLessThan(1.1)
    expect(r.hitRate).toBeGreaterThan(0.2)
  })
})
