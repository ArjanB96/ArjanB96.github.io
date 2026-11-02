import { GameConfig } from './config'

/** Verzamelstand van de vier bemanningsleden (index = kleur) */
export interface Crew { points: number[]; levels: number[] }
export const newCrew = (): Crew => ({ points: [0, 0, 0, 0], levels: [0, 0, 0, 0] })
export const copyCrew = (c: Crew): Crew => ({ points: c.points.slice(), levels: c.levels.slice() })

export function levelFor(points: number, cfg: GameConfig) {
  let l = 0
  for (const need of cfg.levelPoints) if (points >= need) l++
  return l
}

/** Punten toevoegen; geeft elk nieuw bereikt niveau terug (in volgorde, elk niveau precies één keer) */
export function addPoints(crew: Crew, color: number, n: number, cfg: GameConfig) {
  const ups: { color: number; level: number }[] = []
  crew.points[color] += n
  const target = levelFor(crew.points[color], cfg)
  while (crew.levels[color] < target) { crew.levels[color]++; ups.push({ color, level: crew.levels[color] }) }
  return ups
}

/** Voortgang naar het volgende niveau, 0..1 (1 bij max) */
export function progress(crew: Crew, color: number, cfg: GameConfig) {
  const l = crew.levels[color]
  if (l >= cfg.levelPoints.length) return 1
  const from = l ? cfg.levelPoints[l - 1] : 0, to = cfg.levelPoints[l]
  return Math.min(1, (crew.points[color] - from) / (to - from))
}
