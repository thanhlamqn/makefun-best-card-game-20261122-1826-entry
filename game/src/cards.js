// Ember Pact — the card catalogue. One clear job: what every card does.
// A card: id, name, suit, cost (mana), attack, shield, heal, draw.
// Attack hits the enemy (through their shield first), shield blocks damage,
// heal restores your own life, draw pulls extra cards.
export const CARD_DEFS = [
  { id: 'spark', name: 'Ember Spark', suit: 'flame', cost: 1, attack: 2, shield: 0, heal: 0, draw: 0, text: 'Deal 2 damage.' },
  { id: 'lash', name: 'Flame Lash', suit: 'flame', cost: 2, attack: 4, shield: 0, heal: 0, draw: 0, text: 'Deal 4 damage.' },
  { id: 'inferno', name: 'Inferno', suit: 'flame', cost: 4, attack: 8, shield: 0, heal: 0, draw: 0, text: 'Deal 8 damage.' },
  { id: 'cinder', name: 'Cinder Bolt', suit: 'flame', cost: 3, attack: 6, shield: 0, heal: 0, draw: 0, text: 'Deal 6 damage.' },
  { id: 'cut', name: 'Tide Cut', suit: 'tide', cost: 1, attack: 2, shield: 0, heal: 0, draw: 0, text: 'Deal 2 damage.' },
  { id: 'riptide', name: 'Riptide', suit: 'tide', cost: 3, attack: 5, shield: 0, heal: 0, draw: 1, text: 'Deal 5 damage. Draw a card.' },
  { id: 'crash', name: 'Wave Crash', suit: 'tide', cost: 3, attack: 6, shield: 0, heal: 0, draw: 0, text: 'Deal 6 damage.' },
  { id: 'whip', name: 'Thorn Whip', suit: 'leaf', cost: 2, attack: 3, shield: 0, heal: 2, draw: 0, text: 'Deal 3 damage. Heal 2.' },
  { id: 'briar', name: 'Briar Shield', suit: 'leaf', cost: 2, attack: 0, shield: 6, heal: 0, draw: 0, text: 'Gain 6 shield.' },
  { id: 'mend', name: 'Mend', suit: 'leaf', cost: 2, attack: 0, shield: 0, heal: 6, draw: 0, text: 'Heal 6 life.' },
  { id: 'pact', name: 'Ember Pact', suit: 'leaf', cost: 3, attack: 4, shield: 0, heal: 2, draw: 1, text: 'Deal 4, heal 2, draw 1.' },
  { id: 'aegis', name: 'Aegis', suit: 'leaf', cost: 4, attack: 0, shield: 8, heal: 3, draw: 0, text: 'Gain 8 shield. Heal 3.' },
  { id: 'pebble', name: 'Pebble Toss', suit: 'stone', cost: 1, attack: 2, shield: 0, heal: 0, draw: 0, text: 'Deal 2 damage.' },
  { id: 'wall', name: 'Stone Wall', suit: 'stone', cost: 3, attack: 0, shield: 9, heal: 0, draw: 0, text: 'Gain 9 shield.' },
  { id: 'boulder', name: 'Boulder Slam', suit: 'stone', cost: 5, attack: 10, shield: 0, heal: 0, draw: 0, text: 'Deal 10 damage.' },
  { id: 'gale', name: 'Gale Slash', suit: 'stone', cost: 2, attack: 4, shield: 0, heal: 0, draw: 0, text: 'Deal 4 damage.' },
];

// Build a 30-card deck: two copies of each card except the two finishers.
export function buildDeck() {
  const deck = [];
  for (const def of CARD_DEFS) {
    const copies = def.id === 'inferno' || def.id === 'boulder' ? 1 : 2;
    for (let i = 0; i < copies; i++) deck.push({ ...def, uid: `${def.id}-${i}` });
  }
  return deck;
}

export function cardById(id) {
  return CARD_DEFS.find((c) => c.id === id);
}
