// Zachte casino-lounge achtergrondmuziek, live gegenereerd met Web Audio (geen bestand nodig)
const BPM = 104, BEAT = 60 / BPM, VOLUME = 0.07
/** ii-V-I-VI in C, één maat per akkoord: grondtoon (MIDI) + akkoordtonen */
const CHORDS = [{ root: 38, notes: [53, 57, 60, 64] }, { root: 43, notes: [53, 55, 59, 64] }, { root: 36, notes: [52, 55, 59, 62] }, { root: 45, notes: [55, 57, 61, 64] }]
const SCALE = [72, 74, 76, 79, 81, 84]
const hz = (m: number) => 440 * Math.pow(2, (m - 69) / 12)
const K = 'bc.music'

let ac: AudioContext | null = null, out: GainNode | null = null, noise: AudioBuffer | null = null
let timer = 0, next = 0, step = 0, paused = false
export const musicOn = () => { try { return localStorage.getItem(K) !== 'off' } catch { return true } }

function tone(m: number, t: number, len: number, type: OscillatorType, vol: number, attack = 0.01) {
  const o = ac!.createOscillator(), g = ac!.createGain()
  o.type = type; o.frequency.value = hz(m)
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + len)
  o.connect(g).connect(out!); o.start(t); o.stop(t + len + 0.05)
}
function brush(t: number, vol: number) {
  const s = ac!.createBufferSource(), f = ac!.createBiquadFilter(), g = ac!.createGain()
  s.buffer = noise; f.type = 'highpass'; f.frequency.value = 7000
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12)
  s.connect(f).connect(g).connect(out!); s.start(t); s.stop(t + 0.15)
}
/** Plant één tel (met swing-achtslagen) in */
function beat(t: number) {
  const bar = Math.floor(step / 4) % CHORDS.length, b = step % 4, c = CHORDS[bar], sw = BEAT * 0.66
  // Walking bass: grondtoon, dan akkoordtonen, laatste tel naar het volgende akkoord toe
  const nextRoot = CHORDS[(bar + 1) % CHORDS.length].root
  tone([c.root, c.root + 7, c.root + 12, nextRoot + 1][b], t, BEAT * 0.9, 'triangle', 0.5)
  // Piano-comping op 2 en 4
  if (b === 1 || b === 3) c.notes.forEach(n => tone(n, t + (b === 3 ? sw : 0), BEAT * 1.4, 'sine', 0.09, 0.02))
  // Brushes: ride-patroon ding, ding-ga-ding
  brush(t, 0.25); if (b % 2 === 1) brush(t + sw, 0.12)
  // Af en toe een vibrafoon-loopje
  if (Math.random() < 0.3) tone(SCALE[Math.floor(Math.random() * SCALE.length)], t + (Math.random() < 0.5 ? 0 : sw), BEAT * 2, 'sine', 0.12, 0.005)
  step++
}
function schedule() { if (!ac) return; while (next < ac.currentTime + 0.3) { beat(next); next += BEAT } }

/** Start de muziek (moet na een klik/tik van de bezoeker, anders blokkeert de browser geluid) */
export function musicStart() {
  if (!musicOn() || timer) return
  try {
    if (!ac) {
      ac = new AudioContext(); out = ac.createGain(); out.gain.value = 0; out.connect(ac.destination)
      noise = ac.createBuffer(1, ac.sampleRate * 0.2, ac.sampleRate); const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
    }
    ac.resume(); next = ac.currentTime + 0.1; timer = window.setInterval(schedule, 100)
    out!.gain.setTargetAtTime(paused ? 0 : VOLUME, ac.currentTime, 0.8)
  } catch {}
}
export function musicStop() { window.clearInterval(timer); timer = 0; if (ac && out) out.gain.setTargetAtTime(0, ac.currentTime, 0.2) }
export function musicSet(on: boolean) { try { localStorage.setItem(K, on ? 'on' : 'off') } catch {}; on ? musicStart() : musicStop() }
/** Tijdelijk stil, bijvoorbeeld terwijl het themesong speelt */
export function musicPause(p: boolean) { paused = p; if (ac && out && timer) out.gain.setTargetAtTime(p ? 0 : VOLUME, ac.currentTime, 0.4) }

/** Krakende deuren die openzwaaien (start na `delay` s) en tegen de muur bonken */
export function doorSound(delay = 0.4, len = 2) {
  try {
    ac ??= new AudioContext(); ac.resume(); const t = ac.currentTime + delay
    // Kraken: zaagtand door een smalle bandfilter, gehakt door een onregelmatige 'ratel'
    const o = ac.createOscillator(), f = ac.createBiquadFilter(), g = ac.createGain(), rat = ac.createOscillator(), rg = ac.createGain()
    o.type = 'sawtooth'; o.frequency.setValueAtTime(70, t); o.frequency.linearRampToValueAtTime(115, t + len * 0.6); o.frequency.linearRampToValueAtTime(85, t + len)
    f.type = 'bandpass'; f.Q.value = 9; f.frequency.setValueAtTime(700, t); f.frequency.linearRampToValueAtTime(1300, t + len)
    rat.type = 'square'; rat.frequency.setValueAtTime(22, t); rat.frequency.linearRampToValueAtTime(38, t + len * 0.5); rat.frequency.linearRampToValueAtTime(18, t + len)
    rg.gain.value = 0.5; g.gain.value = 0.5
    const env = ac.createGain(); env.gain.setValueAtTime(0, t); env.gain.linearRampToValueAtTime(0.5, t + 0.15); env.gain.setValueAtTime(0.5, t + len * 0.8); env.gain.linearRampToValueAtTime(0, t + len)
    rat.connect(rg).connect(g.gain); o.connect(f).connect(g).connect(env).connect(ac.destination)
    o.start(t); rat.start(t); o.stop(t + len + 0.1); rat.stop(t + len + 0.1)
    // Bonk: lage toon plus gedempte ruis als de deuren openslaan
    const b = t + len, bo = ac.createOscillator(), bg = ac.createGain()
    bo.frequency.setValueAtTime(90, b); bo.frequency.exponentialRampToValueAtTime(35, b + 0.4)
    bg.gain.setValueAtTime(0.9, b); bg.gain.exponentialRampToValueAtTime(0.001, b + 0.5); bo.connect(bg).connect(ac.destination); bo.start(b); bo.stop(b + 0.55)
    const n = ac.createBuffer(1, ac.sampleRate * 0.3, ac.sampleRate), d = n.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length)
    const ns = ac.createBufferSource(), nf = ac.createBiquadFilter(), ng = ac.createGain(); ns.buffer = n; nf.type = 'lowpass'; nf.frequency.value = 400; ng.gain.value = 0.6
    ns.connect(nf).connect(ng).connect(ac.destination); ns.start(b)
  } catch {}
}

/** Korte synthgeluidjes: 'spit' (ptoe!), 'tik' (balletje/symbool valt), 'pop' (cluster weg), 'boom' (dynamiet), 'zap' (laser), 'up' (upgrade) en 'coin' (prijs) */
export function sfx(kind: 'spit' | 'tik' | 'pop' | 'boom' | 'zap' | 'up' | 'coin', on: boolean, vol = 1) {
  if (!on) return
  try { ac ??= new AudioContext(); const t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain()
    if (kind === 'spit') { o.type = 'sine'; o.frequency.setValueAtTime(420, t); o.frequency.exponentialRampToValueAtTime(70, t + 0.15); g.gain.setValueAtTime(0.35, t) }
    else if (kind === 'pop') { o.type = 'triangle'; o.frequency.setValueAtTime(500, t); o.frequency.exponentialRampToValueAtTime(1600, t + 0.12); g.gain.setValueAtTime(0.25 * vol, t) }
    else if (kind === 'boom') { o.type = 'sine'; o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(30, t + 0.5); g.gain.setValueAtTime(0.9, t)
      const n = ac.createBuffer(1, ac.sampleRate * 0.5, ac.sampleRate), d = n.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2)
      const ns = ac.createBufferSource(), nf = ac.createBiquadFilter(), ng = ac.createGain(); ns.buffer = n; nf.type = 'lowpass'; nf.frequency.value = 900; ng.gain.value = 0.8
      ns.connect(nf).connect(ng).connect(ac.destination); ns.start(t) }
    else if (kind === 'zap') { o.type = 'sawtooth'; o.frequency.setValueAtTime(1800, t); o.frequency.exponentialRampToValueAtTime(120, t + 0.35); g.gain.setValueAtTime(0.18 * vol, t) }
    else if (kind === 'up') { o.type = 'triangle'; [0, 0.08, 0.16, 0.24].forEach((d, k) => o.frequency.setValueAtTime(523 * Math.pow(2, [0, 4, 7, 12][k] / 12), t + d)); g.gain.setValueAtTime(0.22 * vol, t) }
    else if (kind === 'coin') { o.type = 'square'; o.frequency.setValueAtTime(988, t); o.frequency.setValueAtTime(1319, t + 0.08); g.gain.setValueAtTime(0.14 * vol, t) }
    else { o.type = 'square'; o.frequency.value = 2200 + Math.random() * 1400; g.gain.setValueAtTime(0.12 * vol, t) }
    const len = kind === 'boom' ? 0.6 : kind === 'up' ? 0.45 : kind === 'zap' ? 0.38 : kind === 'coin' ? 0.35 : kind === 'spit' ? 0.18 : kind === 'pop' ? 0.14 : 0.04
    g.gain.exponentialRampToValueAtTime(0.001, t + len); o.connect(g).connect(ac.destination); o.start(t); o.stop(t + len + 0.05) } catch {}
}
