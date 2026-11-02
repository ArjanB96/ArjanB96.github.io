/** Willekeur: een functie die een getal in [0, 1) geeft */
export type Rng = () => number

/** Eerlijke willekeur voor echt spel via de browser Crypto API */
export const cryptoRng: Rng = () => { const a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] / 0x100000000 }

/** Reproduceerbare willekeur (mulberry32) voor tests en simulaties */
export function seeded(seed: number): Rng {
  let a = seed >>> 0
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
}

export const randInt = (rng: Rng, n: number) => Math.floor(rng() * n)
export function pickWeighted(rng: Rng, weights: number[]) {
  const total = weights.reduce((s, w) => s + w, 0); let r = rng() * total
  for (let i = 0; i < weights.length; i++) { r -= weights[i]; if (r < 0) return i }
  return weights.length - 1
}
/** k verschillende elementen uit een lijst (Fisher-Yates op een kopie) */
export function sample<T>(rng: Rng, list: T[], k: number) {
  const a = list.slice()
  for (let i = a.length - 1; i > 0; i--) { const j = randInt(rng, i + 1); [a[i], a[j]] = [a[j], a[i]] }
  return a.slice(0, k)
}
