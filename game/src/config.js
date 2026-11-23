// Ember Pact — tuning constants. One clear job: every number the duel runs on.
export const CONFIG = {
  width: 1280,
  height: 800,
  startHp: 30,
  startHand: 4,
  startMana: 1,
  maxMana: 10,
  maxHand: 7,
  drawPerTurn: 1,
  aiName: 'Cinder Witch',
  playerName: 'You',
  // Palette: felt table, gold trim, parchment cards.
  colors: {
    felt: '#1d5c3f',
    feltDark: '#143d2a',
    tableEdge: '#8a6d2f',
    gold: '#e8b64c',
    parchment: '#f4e8c8',
    ink: '#2b2118',
    flame: '#e4572e',
    tide: '#2e86de',
    leaf: '#4caf50',
    stone: '#8d6e63',
    hp: '#e5484d',
    shield: '#4da3ff',
    mana: '#7b61ff',
  },
};

// The four suits (elements). Each card belongs to exactly one.
export const SUITS = {
  flame: { name: 'Flame', color: '#e4572e', glyph: '▲' },
  tide: { name: 'Tide', color: '#2e86de', glyph: '●' },
  leaf: { name: 'Leaf', color: '#4caf50', glyph: '◆' },
  stone: { name: 'Stone', color: '#8d6e63', glyph: '■' },
};
