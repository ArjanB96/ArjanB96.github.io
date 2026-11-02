const K = 'bc.v1'
export interface Saved { balance: number; sound: boolean; speech: boolean; history: number[]; name?: string; drink?: DrinkId }
/** Drankjes die je bij Bert kunt bestellen */
export const DRINKS = { hennessy: { icon: '🥃', label: 'glaasje Hennessy' }, bier: { icon: '🍺', label: 'biertje' }, redbull: { icon: '⚡', label: 'red bulletje' } }
export type DrinkId = keyof typeof DRINKS
export const START = 1000
export const load = (): Saved => { try { return { balance: START, sound: true, speech: true, history: [], ...JSON.parse(localStorage.getItem(K) || '{}') } } catch { return { balance: START, sound: true, speech: true, history: [] } } }
export const save = (s: Partial<Saved>) => { try { localStorage.setItem(K, JSON.stringify({ ...load(), ...s })) } catch {} }
/** Reset-regels op één plek aanpasbaar */
export const resetState = (s: Saved): Saved => ({ ...s, balance: START, history: [] })

// Spraak (Web Speech API). Later vervangbaar door audiobestanden.
const LINES: Record<string, string[]> = {
  welcome: ['Awoo strijder! Kom maar met je saaf, a neef!', 'Bert ruikt geld! Welkom in BertsCasino!', 'Ewa {naam}! Proost met je {drankje} er zit een klein beetje ghb in!'],
  idle: ['Kom op, die roulette gaat niet vanzelf draaien! Die djerrie ook niet', 'Niet zo skeer doen, gooi er nog wat op!', 'Pikkie, ik word tantoe ongeduldig, heb een peki op mij wachten.!', 'Nog een {drankje}, {naam}? Dan gaat het vanzelf beter.', '{naam}, zit je te slapen of ga je nog inzetten?'],
  big: ['Oeeeeh, dat is een flinke, net je bana', 'Bert gaat dom vandaag! Gooi maar door!', 'Kijk {naam} nou gaan! Groot geld! Heb je net geoogst?'],
  close: ['De inzetten zijn gesloten boys, groetjes Bert!', 'Inzetten zijn gesloten. De poenie van je ma niet gelukkig.'],
  win: ['Oeeeeh, dat wordt vanavond bori roken!', 'Lekker bezig, pikkie!', 'Siiieee maatje!', 'Lekker {naam}! Dat {drankje} doet wonderen.'],
  lose: ['Helaas pindakaas, vriend!', 'Welloe voor jou swa!', 'Het huis wint, a neef!', 'Binnenkort kan Bert een nieuwe rolie kopen s o naar jou bro', 'Sorry {naam}, het huis wint. Drink je {drankje} maar op.'],
  ask: ['Faka broer, wat is je naam ook alweer?'],
  lady: ['Bert heeft echt een hele domme bana!'],
  serve: ['Hihi, alsjeblieft schatje! Bert zegt dat ik er ghb in moest doen.'],
  kluisWelcome: ['Welkom bij Berts Kluis, {naam}! Blaas die kluis open!', 'Ewa {naam}, de kluis zit vol poen. Even kraken?'],
  kluisWin: ['Kassa, {naam}!', 'Die zit, pikkie!', 'Lekker kraken zo!'],
  kluisBig: ['Oeeeeh, {naam} plundert de kluis!', 'Wat een buit! Bert wordt er bang van!'],
  overval: ['DE OVERVAL! Maskers op, {naam}!', 'Alarm uit, deur open. Pak alles!'],
  boom: ['BOEM! Hahaha!', 'Daar gaat de muur!'],
  spaceWelcome: ['We gaan de ruimte in, a neef!', 'Bert ruikt buitenaards geld!', 'Riemen vast, {naam}! Dit wordt een mooie vlucht!'],
  spaceWin: ['Pak die buit!', 'Kijk eens wat daar binnenkomt!', 'Lekker geraid, {naam}!'],
  spaceBig: ['Oeeeeh, buitenaardse poen! Bert wordt er duizelig van!', 'Dit wordt een mooie vlucht, a neef!'],
  spaceLevel: ['Upgrade! Die bemanning gaat dom!', 'Kijk die bemanning gaan, {naam}!'],
  spaceBonus: ['Kapitein Bert aan het roer! Ruimte-expeditie, {naam}!', 'Hyperspace aan, a neef! Pak alles wat los zit!'],
  spaceFinale: ['Thuisvlucht! Tel die buit maar, a neef!', 'Bemanning, lever de buit af bij Bert!'],
  broke: ['Niks meer over? Reset maar, Bert gunt je.']
}
/** Stem van Bert: pitch 0–2 (lager = zwaarder), rate 0.1–10 (lager = trager) */
const VOICE = { pitch: 0.35, rate: 0.8 }
/** Stem van de dames in de kamer van Bert */
export const LADY = { pitch: 1.5, rate: 1.05 }
export const line = (k: string) => { const a = LINES[k], s = load(); return a[Math.floor(Math.random() * a.length)].replace(/\{naam\}/g, s.name || 'a neef').replace(/\{drankje\}/g, DRINKS[s.drink || 'bier'].label) }
/** queue = niet onderbreken wat er nu gezegd wordt, maar erachteraan */
export function speak(text: string, on: boolean, voice = VOICE, queue = false) {
  if (!on || !('speechSynthesis' in window)) return
  try { if (!queue) speechSynthesis.cancel(); const v = speechSynthesis.getVoices().find(x => x.lang.startsWith('nl'))
    // Oude-mannenstem: zwaar en wat trager. Faalt een stem op de lage toon, dan nog een keer met de standaardstem
    const say = (t: string, pitch: number, rate: number, retry = true) => { const u = new SpeechSynthesisUtterance(t); u.lang = 'nl-NL'; u.pitch = pitch; u.rate = rate; if (v) u.voice = v
      u.onerror = e => { if (retry && e.error !== 'interrupted' && e.error !== 'canceled') say(t, 1, 1, false) }; speechSynthesis.speak(u) }
    // Chrome slaat speak() soms over als die direct na cancel() komt
    setTimeout(() => { say(text, voice.pitch, voice.rate) }, queue ? 0 : 60) } catch {}
}
