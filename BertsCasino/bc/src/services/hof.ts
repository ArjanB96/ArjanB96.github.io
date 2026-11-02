// Hall of Fame en bezoekerslog via Supabase (REST). De publishable key mag openbaar zijn;
// de database-regels (RLS) bepalen dat bezoekers alleen scores mogen lezen/toevoegen en bezoeken alleen mogen toevoegen.
import { load } from '.'

const URL = 'https://aafgzlymoezufqlntfqv.supabase.co/rest/v1'
const KEY = 'sb_publishable_ap7AfYqOylfNOU3suC5ZwQ_zsJbmZ59'
const HEADERS = { apikey: KEY, 'Content-Type': 'application/json' }

export type GameId = 'roulette' | 'kluis' | 'space'
export const GAME_NAMES: Record<GameId, string> = { roulette: '🎰 Roulette', kluis: '🧨 Berts Kluis', space: '🚀 Space Raiders' }
export interface Score { name: string; amount: number; bet: number; created_at: string }

/** Top 10 per spel, 60 seconden in het geheugen zodat niet elke ronde opnieuw wordt opgehaald */
const cache: Partial<Record<GameId, { at: number; list: Score[] }>> = {}
export async function fetchTop(game: GameId, fresh = false): Promise<Score[]> {
  const c = cache[game]
  if (!fresh && c && Date.now() - c.at < 60000) return c.list
  const r = await fetch(`${URL}/scores?select=name,amount,bet,created_at&game=eq.${game}&order=amount.desc,created_at.asc&limit=10`, { headers: HEADERS })
  if (!r.ok) throw new Error(`Hall of Fame niet bereikbaar (${r.status})`)
  const list = (await r.json() as Score[]).map(s => ({ ...s, amount: +s.amount, bet: +s.bet }))
  cache[game] = { at: Date.now(), list }
  return list
}

/** Stuurt een winst in als die de top 10 haalt. Geeft de nieuwe plek (1-10) terug, of 0. Fouten (offline e.d.) worden genegeerd. */
export async function submitScore(game: GameId, amount: number, bet: number): Promise<number> {
  const name = load().name
  if (!name || !(amount > 0) || !(bet > 0)) return 0
  try {
    const top = await fetchTop(game)
    if (top.length >= 10 && amount <= top[top.length - 1].amount) return 0
    const r = await fetch(`${URL}/scores`, { method: 'POST', headers: { ...HEADERS, Prefer: 'return=minimal' },
      body: JSON.stringify({ name: name.slice(0, 20), game, amount: Math.round(amount * 100) / 100, bet: Math.round(bet * 100) / 100 }) })
    if (!r.ok) return 0
    const list = await fetchTop(game, true)
    return list.findIndex(s => s.name === name && Math.abs(s.amount - amount) < 0.005) + 1
  } catch { return 0 }
}

/** Wat Bert zegt als je in de top 10 komt */
export const hofText = (place: number) => `Oeeeeh, ${load().name}! Je staat op plek ${place} in de Hall of Fame!`

/** Legt vast dat iemand het casino binnenkomt (naam + tijdstip). Alleen jij kunt dit teruglezen. */
export function logVisit(name: string | undefined) {
  if (!name) return
  fetch(`${URL}/visits`, { method: 'POST', headers: { ...HEADERS, Prefer: 'return=minimal' }, body: JSON.stringify({ name: name.slice(0, 20) }) }).catch(() => {})
}
