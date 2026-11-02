import { GameConfig } from './engine/config'

/** Namen en uitleg van de bemanning (alleen voor de interface; de regels zelf staan in de engine) */
export const CREW = [
  { name: 'Kapitein Kreeftenschaar', kind: 'Ruimtepiraat', color: 'Rood', power: 'Laser' },
  { name: 'Blauwe Donny', kind: 'Alien', color: 'Blauw', power: 'Teleport' },
  { name: 'Sjonnie Snotroggel', kind: 'Ruimtewezen', color: 'Groen', power: 'Vermenigvuldiger' },
  { name: 'Robo-Bert 3000', kind: 'Robot', color: 'Goud', power: 'Schat' },
]

/** Wat een bemanningslid doet op een bepaald niveau (1..5) */
export function abilityText(c: number, level: number, cfg: GameConfig) {
  const l = level - 1
  if (c === 0) return level <= 3 ? `Laser schiet ${cfg.laser[l]} vakjes weg` : level === 4 ? 'Laser schiet een hele rij weg' : 'Laser schiet een kruis (rij + kolom) weg'
  if (c === 1) return `Teleporteert ${cfg.teleport[l]} vakjes naar de grootste groep${cfg.teleportWilds[l] ? `, ${cfg.teleportWilds[l]} worden een Bert-badge` : ''}`
  if (c === 2) return `Vermenigvuldiger +${cfg.boost[l]}`
  return level < 4 ? `Schat: ${cfg.treasure[l]}× inzet` : level === 4 ? `Schat: ${cfg.treasure[l]}× inzet + brandstof` : `Schat: ${cfg.treasure[l]}× inzet + Ruimte-expeditie (in de bonus: +${cfg.goldExtraSpins} vluchten)`
}
