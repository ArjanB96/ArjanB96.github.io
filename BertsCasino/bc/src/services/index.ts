const K = 'bc.v1'
export interface Saved { balance: number; sound: boolean; speech: boolean; history: number[] }
export const START = 1000
export const load = (): Saved => { try { return { balance: START, sound: true, speech: true, history: [], ...JSON.parse(localStorage.getItem(K) || '{}') } } catch { return { balance: START, sound: true, speech: true, history: [] } } }
export const save = (s: Saved) => { try { localStorage.setItem(K, JSON.stringify(s)) } catch {} }
/** Reset-regels op één plek aanpasbaar */
export const resetState = (s: Saved): Saved => ({ ...s, balance: START, history: [] })

// Themesong in IndexedDB
const db = () => new Promise<IDBDatabase>((res, rej) => { const q = indexedDB.open('bc-audio', 1); q.onupgradeneeded = () => q.result.createObjectStore('f'); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error) })
export async function songPut(f: File | null) { const d = await db(); const s = d.transaction('f', 'readwrite').objectStore('f'); f ? s.put(f, 'song') : s.delete('song') }
export async function songGet(): Promise<File | null> { const d = await db(); return new Promise(r => { const q = d.transaction('f').objectStore('f').get('song'); q.onsuccess = () => r((q.result as File) || null); q.onerror = () => r(null) }) }

// Spraak (Web Speech API). Later vervangbaar door audiobestanden.
const LINES: Record<string, string[]> = {
  welcome: ['Awoo strijder! Kom maar met je saaf, a neef!', 'Bert ruikt geld! Welkom in BertsCasino!'],
  idle: ['Kom op, die roulette gaat niet vanzelf draaien!', 'Niet zo gierig doen, gooi er nog wat op!', 'Pikkie, ik word er oud van hier!'],
  big: ['Oeeeeh, dat is een flinke, pikkie!', 'Bert gaat lekker vandaag! Gooi maar door!'],
  close: ['De inzetten zijn gesloten boys, groetjes Bert!'],
  win: ['Oeeeeh, dat wordt vanavond bori roken!', 'Lekker bezig, pikkie!', 'Siii maatje!'],
  lose: ['Helaas pindakaas, vriend!', 'Welloe voor jou swa!', 'Het huis wint, a neef. Weer eens wat anders!'],
  broke: ['Niks meer over? Reset maar, Bert gunt je.']
}
export const line = (k: string) => { const a = LINES[k]; return a[Math.floor(Math.random() * a.length)] }
export function speak(text: string, on: boolean) {
  if (!on || !('speechSynthesis' in window)) return
  try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = 'nl-NL'; u.pitch = 0.6; u.rate = 1.0
    const v = speechSynthesis.getVoices().find(x => x.lang.startsWith('nl')); if (v) u.voice = v; speechSynthesis.speak(u) } catch {}
}
