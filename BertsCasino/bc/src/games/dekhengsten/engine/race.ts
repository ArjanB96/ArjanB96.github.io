import { Rng, pickWeighted } from '../../../services/rng'
import { HORSES, Horse, HorseId } from './horses'
import { BERT, EventDef, GENERIC, LEROY_LINES, SPECIAL, TRAITS } from './events'

/**
 * De race wordt volledig vooraf gesimuleerd. De animatie speelt exact deze frames, events en teksten af,
 * dus wat je ziet is altijd precies wat de engine heeft bepaald.
 */
export const LENGTH = 1000, DT = 0.05, FRAME = 0.1, BASE = 30
export type Cue = 'hype' | 'shock' | 'laugh' | 'lean' | 'slam' | 'drink' | 'jump'
export interface RaceEvent { t: number; horse: HorseId; key: string; label: string; icon: string; anim: EventDef['anim']; mult: number; dur: number }
export interface Shout { t: number; horse: HorseId; text: string }
export interface Comment { t: number; text: string; cue: Cue }
export interface Race {
  /** frames[k][i] = positie van paard i (volgorde van HORSES) op tijd k × FRAME */
  frames: number[][]
  finish: Record<HorseId, number>; order: HorseId[]; winner: HorseId
  events: RaceEvent[]; shouts: Shout[]; comments: Comment[]
  photo: boolean; duration: number
}
export interface RaceOptions { horses?: Horse[]; traits?: boolean; events?: boolean }

interface Effect { mult: number; until: number }
interface State { h: Horse; pos: number; v: number; form: number; fx: Effect[]; done: number; busyUntil: number; flags: Set<string> }

const fill = (s: string, n: string) => s.replace(/\{n\}/g, n)
const pick = <T,>(rng: Rng, a: T[]) => a[Math.floor(rng() * a.length)]

export function simulateRace(rng: Rng, opts: RaceOptions = {}): Race {
  const horses = opts.horses ?? HORSES, traits = opts.traits ?? true, withEvents = opts.events ?? true
  const st: State[] = horses.map(h => ({ h, pos: 0, v: 0, form: 0, fx: [], done: -1, busyUntil: 0, flags: new Set() }))
  const frames: number[][] = [], events: RaceEvent[] = [], shouts: Shout[] = [], comments: Comment[] = []
  let lastComment = -10, leader = -1, lastLeadChange = 0, leroyRank = 0, leroyShoutAt = -10, finalAt = -1, t = 0, step = 0, firstDone = -1

  const say = (text: string, cue: Cue, force = false) => { if (!force && t - lastComment < 2.4) return; comments.push({ t, text, cue }); lastComment = t }
  const shout = (s: State, text: string) => { shouts.push({ t, horse: s.h.id, text }); if (s.h.id === 'leroy') leroyShoutAt = t }
  const apply = (s: State, def: EventDef, commentForce = false) => {
    s.fx.push({ mult: def.mult, until: t + def.dur }); s.busyUntil = t + def.dur + 1.5
    events.push({ t, horse: s.h.id, key: def.key, label: def.label, icon: def.icon, anim: def.anim, mult: def.mult, dur: def.dur })
    if (def.shout) shout(s, def.shout)
    say(fill(pick(rng, def.bert), s.h.name), def.mult >= 1 ? 'hype' : def.key === 'graze' || def.key === 'wrongway' || def.key === 'pakje' ? 'laugh' : 'shock', commentForce)
  }
  const trait = (s: State, key: string, label: string, icon: string, anim: EventDef['anim'], mult: number, dur: number, line: string, shoutText?: string) =>
    apply(s, { key, label, icon, anim, mult, dur, bert: [line], shout: shoutText, weight: 0 }, true)

  say(pick(rng, BERT.start), 'hype', true)
  while (t < 120) {
    // Posities vastleggen voor de animatie
    if (step % Math.round(FRAME / DT) === 0) frames.push(st.map(s => Math.round(s.pos * 100) / 100))
    const ranking = st.map((s, i) => i).sort((a, b) => st[b].pos - st[a].pos), lead = ranking[0]
    const second = Math.floor(t + DT) > Math.floor(t)

    for (const s of st) {
      const p = s.pos / LENGTH, { speed, accel, stamina, chaos } = s.h.stats
      s.fx = s.fx.filter(e => e.until > t)
      let target = BASE * (0.88 + 0.024 * speed) * s.h.pace
      if (s.done >= 0) target = BASE * 0.35 // uitlopen na de finish
      else {
        if (p > 0.5) target *= 1 - ((10 - stamina) / 10) * 0.16 * ((p - 0.5) / 0.5)
        if (traits && s.h.id === 'schlong' && p < TRAITS.schlongStartUntil) target *= TRAITS.schlongStart
        if (traits && s.h.id === 'anabool' && p < TRAITS.anaboolStartUntil) target *= TRAITS.anaboolStart
        s.form += (rng() - 0.5) * DT * 0.8 * (chaos / 5) - s.form * 0.3 * DT
        target *= 1 + s.form * 0.05
        for (const e of s.fx) target *= e.mult
      }
      const a = 4 + accel * 1.1
      s.v += Math.max(-a * 2.5 * DT, Math.min(a * DT, target - s.v))
      const prev = s.pos; s.pos += s.v * DT
      if (s.done < 0 && s.pos >= LENGTH) {
        s.done = t + ((LENGTH - prev) / (s.pos - prev)) * DT
        if (firstDone < 0) firstDone = s.done
      }
      if (s.done >= 0 || !second || t < 2) continue

      // Getimede karaktertrekken
      if (traits) {
        const once = (k: string) => (s.flags.has(k) ? false : (s.flags.add(k), true))
        if (s.h.id === 'schlong' && p >= TRAITS.schlongKick.at && once('kick') && rng() < TRAITS.schlongKick.chance)
          trait(s, 'kick', 'ruikt de finish!', '👃', 'boost', TRAITS.schlongKick.mult, TRAITS.schlongKick.dur, s.h.special)
        if (s.h.id === 'anabool' && p >= 0.3 && p < 0.6 && st[lead] === s) s.flags.add('ledEarly')
        if (s.h.id === 'anabool' && p >= TRAITS.anaboolFade.at && once('fade') && s.flags.has('ledEarly') && rng() < TRAITS.anaboolFade.chance)
          trait(s, 'fade', 'oververmoeid', '🥵', 'slow', TRAITS.anaboolFade.mult, TRAITS.anaboolFade.dur, 'Anabool is helemaal kapot! Te vroeg te hard gegaan!')
        const dm = TRAITS.dekhengstMove
        if (s.h.id === 'dekhengst' && p >= dm.from && p <= dm.to && st[lead] !== s && st[lead].pos - s.pos < 90 && !s.flags.has('move') && rng() < dm.chance / 4) {
          s.flags.add('move'); trait(s, 'move', 'dominante inhaalactie', '👑', 'boost', dm.mult, dm.dur, s.h.special)
        }
        if (s.h.id === 'leroy' && p >= TRAITS.leroyKick.at && once('kick') && rng() < TRAITS.leroyKick.chance)
          trait(s, 'kick', 'verrassende eindsprint', '🔥', 'boost', TRAITS.leroyKick.mult, TRAITS.leroyKick.dur, s.h.special, 'FAAAAAAAAAAKAAAAAAAAAAAA!')
      }
      // Willekeurige race-events
      if (withEvents && t >= s.busyUntil && p < 0.97 && rng() < 0.028 + 0.009 * chaos) {
        const pool = [...GENERIC, ...SPECIAL[s.h.id].map(e => ({ ...e, weight: e.weight * 1.5 }))]
        apply(s, pool[pickWeighted(rng, pool.map(e => e.weight))])
      }
    }

    // Leiderswissels, laatste rechte stuk en Leroy's losse uitroepen
    if (lead !== leader && t > 3 && t - lastLeadChange > 2) {
      const h = st[lead].h, own = BERT.leadBy[h.id]
      say(fill(rng() < 0.5 && own ? pick(rng, own) : pick(rng, BERT.lead), h.name), 'lean')
      lastLeadChange = t
    }
    if (lead !== leader) leader = lead
    if (finalAt < 0 && st[lead].pos >= LENGTH * 0.85) { finalAt = t; say(pick(rng, BERT.final), 'slam', true) }
    const li = st.findIndex(s => s.h.id === 'leroy')
    if (li >= 0 && second && st[li].done < 0) {
      const rank = ranking.indexOf(li), leroy = st[li]
      const line = () => (rng() < 0.45 ? LEROY_LINES[0] : pick(rng, LEROY_LINES))
      if (Math.floor(t) === 1 && rng() < 0.6) shout(leroy, rng() < 0.5 ? LEROY_LINES[0] : 'Moet dit nou echt?')
      else if (rank > leroyRank && t - leroyShoutAt > 5 && rng() < 0.25) shout(leroy, line())
      else if (leroy.pos > LENGTH * 0.92 && !leroy.flags.has('near') && (leroy.flags.add('near'), rng() < 0.4)) shout(leroy, LEROY_LINES[0])
      else if (t - leroyShoutAt > 9 && rng() < 0.06) shout(leroy, line())
      leroyRank = rank
    }

    t = Math.round((t + DT) * 1000) / 1000; step++
    if (st.every(s => s.done >= 0) && t > firstDone + 3.2) break
    if (firstDone >= 0 && t > firstDone + 12) break // achterblijvers: stop altijd
  }
  frames.push(st.map(s => Math.round(s.pos * 100) / 100))
  // Achterblijvers zonder finish krijgen een eindtijd op basis van hun afstand
  for (const s of st) if (s.done < 0) s.done = t + (LENGTH - s.pos) / Math.max(s.v, 5)

  const order = st.slice().sort((a, b) => a.done - b.done || b.pos - a.pos).map(s => s.h.id)
  const finish = Object.fromEntries(st.map(s => [s.h.id, Math.round(s.done * 1000) / 1000])) as Record<HorseId, number>
  const photo = finish[order[1]] - finish[order[0]] < 0.35
  if (photo) comments.push({ t: Math.max(0, finish[order[0]] - 2.2), text: pick(rng, BERT.photo), cue: 'slam' })
  comments.push({ t: finish[order[0]] + 0.15, text: fill(pick(rng, BERT.win), horses.find(h => h.id === order[0])!.name), cue: 'jump' })
  comments.sort((a, b) => a.t - b.t)
  return { frames, finish, order, winner: order[0], events, shouts, comments, photo, duration: finish[order[0]] + 3 }
}

/** Positie van elk paard op tijd t (lineair tussen de frames) */
export function positionsAt(race: Race, t: number) {
  const k = Math.max(0, Math.min(race.frames.length - 1, t / FRAME)), i = Math.floor(k), f = k - i
  const a = race.frames[i], b = race.frames[Math.min(i + 1, race.frames.length - 1)]
  return a.map((p, j) => p + (b[j] - p) * f)
}
