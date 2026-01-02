// Card level conversion utilities for Clash Royale
// The API returns old level system, but game uses unified system

export function convertToUnifiedLevel(level: number, rarity: string, maxLevel: number): number {
  // If maxLevel is already 16, it's using the new system
  if (maxLevel >= 15) {
    return level;
  }

  // Convert from old system to new unified system
  switch (rarity.toLowerCase()) {
    case 'legendary':
      // Old: 1-8 → New: 9-16
      return level + 8;
    case 'champion':
      // Old: 1-6 → New: 11-16  
      return level + 10;
    case 'epic':
      // Old: 1-11 → New: 6-16
      return level + 5;
    case 'rare':
      // Old: 1-14 → New: 3-16
      return level + 2;
    case 'common':
      // Old: 1-16 → New: 1-16 (no change)
      return level;
    default:
      return level;
  }
}

export function getUnifiedMaxLevel(): number {
  return 16; // All cards now max at level 16
}
