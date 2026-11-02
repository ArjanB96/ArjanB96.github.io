const K = 'bc.v1'
export interface Saved { balance: number; sound: boolean; speech: boolean; history: number[] }
export const START = 1000
export const load = (): Saved => { try { return { balance: START, sound: true, speech: true, history: [], ...JSON.parse(localStorage.getItem(K) || '{}') } } catch { return { balance: START, sound: true, speech: true, history: [] } } }
export const save = (s: Saved) => { try { localStorage.setItem(K, JSON.stringify(s)) } catch {} }
/** Reset-regels op één plek aanpasbaar */
export const resetState = (s: Saved): Saved => ({ ...s, balance: START, history: [] })

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
/** Stem van Bert: pitch 0–2 (lager = zwaarder), rate 0.1–10 (lager = trager) */
const VOICE = { pitch: 0.35, rate: 0.8 }
export const line =(k: string) => { const a = LINES[k]; return a[Math.floor(Math.random() * a.length)] }
export function speak(text: string, on: boolean) {
  if (!on || !('speechSynthesis' in window)) return
  try { speechSynthesis.cancel(); const v = speechSynthesis.getVoices().find(x => x.lang.startsWith('nl'))
    // Oude-mannenstem: zwaar en wat trager. Faalt een stem op de lage toon, dan nog een keer met de standaardstem
    const say = (t: string, pitch: number, rate: number, retry = true) => { const u = new SpeechSynthesisUtterance(t); u.lang = 'nl-NL'; u.pitch = pitch; u.rate = rate; if (v) u.voice = v
      u.onerror = e => { if (retry && e.error !== 'interrupted' && e.error !== 'canceled') say(t, 1, 1, false) }; speechSynthesis.speak(u) }
    // Chrome slaat speak() soms over als die direct na cancel() komt
    setTimeout(() => { say(text, VOICE.pitch, VOICE.rate) }, 60) } catch {}
}
