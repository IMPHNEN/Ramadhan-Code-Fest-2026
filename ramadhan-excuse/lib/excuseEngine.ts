// lib/excuseEngine.ts

import { excuses } from './excuses'

const rarityWeight = {
  common: 55,
  rare: 25,
  epic: 12,
  legendary: 6,
  mythic: 2
}

export function generateExcuse() {
  const pool: any[] = []

  for (const item of excuses) {
    const w = rarityWeight[item.rarity]
    for (let i = 0; i < w; i++) pool.push(item)
  }

  return pool[Math.floor(Math.random() * pool.length)]
}