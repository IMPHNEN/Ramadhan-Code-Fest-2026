export type Rarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic'

export interface Excuse {
  text: string
  rarity: Rarity
}

export const excuses: Excuse[] = [
  { text: 'Niat sih ibadah, tapi loading iman 1%', rarity: 'common' },
  { text: 'Setan lagi maintenance server', rarity: 'common' },
  { text: 'Iman saya lagi kena rate limit', rarity: 'rare' },
  { text: 'Server pahala timeout', rarity: 'rare' },
  { text: 'Lagi patch update keikhlasan', rarity: 'epic' },
  { text: 'Setan DDoS niat saya', rarity: 'epic' },
  { text: 'Ibadah saya lagi soft-ban dari langit', rarity: 'legendary' },
  { text: 'Malaikat lagi AFK', rarity: 'legendary' },
  { text: 'Server langit lagi error 500', rarity: 'mythic' },
]