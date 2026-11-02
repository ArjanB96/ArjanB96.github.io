export const WHEEL = [0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26]
const RED = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36])
export type Col = 'red' | 'black' | 'green'
export const colorOf = (n: number): Col => (n === 0 ? 'green' : RED.has(n) ? 'red' : 'black')
export interface Bet { key: string; nums: number[]; label: string; amount: number; cx: number; cy: number }
export interface Target { nums: number[]; label: string; cx: number; cy: number; w: number; h: number; cls: string; text: string; z: number }

/** Onafhankelijke, eerlijke uitkomst via Crypto API (rejection sampling, geen modulo-bias) */
export function spinResult(): number {
  const a = new Uint32Array(1), lim = Math.floor(0x100000000 / 37) * 37
  do crypto.getRandomValues(a); while (a[0] >= lim)
  return a[0] % 37
}
/** Totale teruggave (inzet + winst) bij winst: inzet * 36 / aantal nummers. 1 nr=36x(35:1), 2=18x(17:1), 3=12x(11:1), 4=9x(8:1), 6=6x(5:1), 12=3x(2:1), 18=2x(1:1) */
export const payout = (b: Bet, r: number) => (b.nums.includes(r) ? (b.amount * 36) / b.nums.length : 0)

const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i)
const W = 100 / 14, H = 100 / 5
/** Tafelgeometrie (14 kolommen x 5 rijen, in %). Binnen-inzetten als hotspots op randen/hoeken. */
export function buildTargets(): Target[] {
  const t: Target[] = []
  const add = (nums: number[], label: string, cx: number, cy: number, w: number, h: number, cls: string, text: string, z: number) =>
    t.push({ nums, label, cx: cx * W, cy: cy * H, w: w * W, h: h * H, cls, text, z })
  add([0], '0', 0.5, 1.5, 1, 3, 'green', '0', 1)
  for (let c = 0; c < 12; c++) for (let r = 0; r < 3; r++) {
    const n = 3 * c + 3 - r
    add([n], String(n), c + 1.5, r + 0.5, 1, 1, colorOf(n), String(n), 1)
    if (c < 11) add([n, n + 3], `Split ${n}-${n + 3}`, c + 2, r + 0.5, 0.3, 0.6, 'hot', '', 3)
    if (r < 2) add([n, n - 1], `Split ${n - 1}-${n}`, c + 1.5, r + 1, 0.6, 0.3, 'hot', '', 3)
    if (c < 11 && r < 2) add([n, n + 3, n - 1, n + 2], `Corner ${n - 1}-${n + 3}`, c + 2, r + 1, 0.3, 0.3, 'hot', '', 4)
    if (r === 2) add([3 * c + 1, 3 * c + 2, 3 * c + 3], `Street ${3 * c + 1}-${3 * c + 3}`, c + 1.5, 3, 0.6, 0.28, 'hot', '', 3)
    if (r === 2 && c < 11) add(range(3 * c + 1, 3 * c + 6), `Six line ${3 * c + 1}-${3 * c + 6}`, c + 2, 3, 0.3, 0.28, 'hot', '', 4)
    if (c === 0) add([0, n], `Split 0-${n}`, 1, r + 0.5, 0.3, 0.6, 'hot', '', 3)
  }
  for (let r = 0; r < 3; r++) {
    const m = (3 - r) % 3
    add(range(1, 36).filter(n => n % 3 === m), `Kolom ${r === 0 ? 3 : r === 1 ? 2 : 1}`, 13.5, r + 0.5, 1, 1, 'out', '2:1', 1)
  }
  ;['1e dozijn', '2e dozijn', '3e dozijn'].forEach((l, k) => add(range(12 * k + 1, 12 * k + 12), l, 4 + 4 * k, 3.5, 4, 1, 'out', l, 1))
  const outs: [string, number[], string][] = [['1-18', range(1, 18), 'out'], ['Even', range(1, 36).filter(n => n % 2 === 0), 'out'],
    ['Rood', range(1, 36).filter(n => colorOf(n) === 'red'), 'red'], ['Zwart', range(1, 36).filter(n => colorOf(n) === 'black'), 'black'],
    ['Oneven', range(1, 36).filter(n => n % 2 === 1), 'out'], ['19-36', range(19, 36), 'out']]
  outs.forEach(([l, nums, cls], k) => add(nums, l, 3 + 2 * k, 4.5, 2, 1, cls, l, 1))
  return t
}
