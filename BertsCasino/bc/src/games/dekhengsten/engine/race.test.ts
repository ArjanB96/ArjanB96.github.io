import { describe, expect, it } from 'vitest'
import { seeded } from '../../../services/rng'
import { HORSES, HorseId } from './horses'
import { expectedReturn, payoutFor, settle, targetChances } from './odds'
import { FRAME, LENGTH, positionsAt, simulateRace } from './race'

const ids = HORSES.map(h => h.id)
const winRates = (n: number, seed: number, opts = {}) => {
  const rng = seeded(seed), wins = Object.fromEntries(ids.map(id => [id, 0])) as Record<HorseId, number>
  for (let i = 0; i < n; i++) wins[simulateRace(rng, opts).winner]++
  return Object.fromEntries(ids.map(id => [id, wins[id] / n])) as Record<HorseId, number>
}

describe('odds en uitbetaling', () => {
  it('2:1 betekent twee keer de inzet winst plus de inzet terug', () => {
    expect(payoutFor(10, 2)).toBe(30); expect(payoutFor(5, 8)).toBe(45); expect(payoutFor(0.5, 3)).toBe(2)
  })
  it('een winnende weddenschap betaalt volgens de vooraf vastgelegde odds, een verliezende niets', () => {
    const order: HorseId[] = ['leroy', 'anabool', 'dekhengst', 'smokkel', 'schlong', 'tollie']
    expect(settle({ type: 'win', horse: 'leroy', stake: 10, odds: 4 }, order)).toEqual({ won: true, payout: 50 })
    expect(settle({ type: 'win', horse: 'anabool', stake: 10, odds: 2 }, order)).toEqual({ won: false, payout: 0 })
  })
  it('doelkansen tellen op tot 100% en lagere odds = hogere kans', () => {
    const t = targetChances()
    expect(Object.values(t).reduce((a, b) => a + b, 0)).toBeCloseTo(1, 9)
    expect(t.anabool).toBeGreaterThan(t.dekhengst); expect(t.dekhengst).toBeGreaterThan(t.leroy); expect(t.schlong).toBeGreaterThan(t.tollie)
    expect(expectedReturn()).toBeGreaterThan(0.8); expect(expectedReturn()).toBeLessThan(0.9)
  })
})

describe('race-engine', () => {
  it('is reproduceerbaar met dezelfde seed', () => {
    expect(simulateRace(seeded(5))).toEqual(simulateRace(seeded(5)))
    expect(simulateRace(seeded(5)).order).not.toEqual(simulateRace(seeded(6)).order)
  })
  it('een race eindigt altijd, binnen 30-45 seconden (incl. 4 s start), met precies één winnaar', () => {
    for (let s = 1; s <= 500; s++) {
      const r = simulateRace(seeded(s))
      expect(new Set(r.order).size).toBe(6); expect(r.order[0]).toBe(r.winner)
      const times = r.order.map(id => r.finish[id])
      for (let i = 1; i < 6; i++) expect(times[i]).toBeGreaterThanOrEqual(times[i - 1])
      expect(times[1]).toBeGreaterThan(times[0])
      expect(r.duration + 4).toBeGreaterThanOrEqual(30); expect(r.duration + 4).toBeLessThanOrEqual(45)
      expect(r.comments.some(c => c.t > r.finish[r.winner])).toBe(true)
    }
  })
  it('de winnaar in de animatie-frames is dezelfde als de berekende winnaar', () => {
    for (let s = 1; s <= 300; s++) {
      const r = simulateRace(seeded(s)), w = ids.indexOf(r.winner)
      // Op het moment dat de winnaar finisht heeft niemand anders de finish al bereikt
      const at = positionsAt(r, r.finish[r.winner] + FRAME)
      expect(at[w]).toBeGreaterThanOrEqual(LENGTH)
      const before = positionsAt(r, Math.max(0, r.finish[r.winner] - FRAME))
      before.forEach((p, i) => { if (i !== w) expect(p).toBeLessThan(LENGTH) })
    }
  })
  it('alle zes paarden kunnen winnen en de winkansen passen bij de odds', () => {
    const rates = winRates(12000, 99), target = targetChances()
    for (const id of ids) { expect(rates[id]).toBeGreaterThan(0); expect(Math.abs(rates[id] - target[id])).toBeLessThan(0.025) }
  })
  it('speciale eigenschappen hebben echt invloed', () => {
    const on = winRates(3000, 7), off = winRates(3000, 7, { traits: false })
    expect(Math.abs(on.schlong - off.schlong) + Math.abs(on.anabool - off.anabool) + Math.abs(on.leroy - off.leroy)).toBeGreaterThan(0.05)
    // Horse Cock start traag: na 15% van de race staat hij gemiddeld verder achter dan zonder die eigenschap
    const early = (traits: boolean) => { let sum = 0; for (let s = 1; s <= 200; s++) { const r = simulateRace(seeded(s), { traits }); sum += positionsAt(r, 5)[0] } return sum }
    expect(early(true)).toBeLessThan(early(false))
  })
  it('events veranderen de racepositie', () => {
    let changed = 0
    for (let s = 1; s <= 100; s++) if (simulateRace(seeded(s)).order.join() !== simulateRace(seeded(s), { events: false }).order.join()) changed++
    expect(changed).toBeGreaterThan(30)
    // Een vertragend event maakt het paard tijdens het event echt langzamer
    const r = simulateRace(seeded(3)), e = r.events.find(x => x.mult < 0.5 && x.t > 3)!
    expect(e).toBeTruthy()
    const i = ids.indexOf(e.horse), d = (a: number, b: number) => positionsAt(r, b)[i] - positionsAt(r, a)[i]
    expect(d(e.t + 0.3, e.t + 0.8)).toBeLessThan(d(e.t - 1, e.t - 0.5))
  })
  it('Leroy roept regelmatig zijn bekendste uitspraak', () => {
    let faka = 0
    for (let s = 1; s <= 200; s++) if (simulateRace(seeded(s)).shouts.some(x => x.horse === 'leroy' && x.text.startsWith('FAAA'))) faka++
    expect(faka).toBeGreaterThan(80)
  })
})
