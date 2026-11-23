// Ember Pact — game state and turn rules. One clear job: the duel itself.
// Screens: 'title' | 'play' | 'victory' | 'defeat'.
// A turn: mana refills and grows, you draw, you play cards, End Turn hands
// the table to the witch, she plays, and the turn comes back to you.
// Shield absorbs damage first and fades at the start of your next turn.
import { CONFIG } from './config.js';
import { buildDeck } from './cards.js';
import { mulberry32, shuffle } from './random.js';

export function newSide(name, deck, rand, hp = CONFIG.startHp) {
  return {
    name,
    hp,
    maxHp: hp,
    shield: 0,
    mana: CONFIG.startMana,
    maxMana: CONFIG.startMana,
    deck: shuffle(deck, rand),
    hand: [],
    discard: [],
    played: [],
  };
}

export function newGame(seed) {
  const rand = mulberry32(seed);
  const state = {
    seed,
    screen: 'title',
    turn: 1,
    phase: 'player', // 'player' | 'enemy' | 'over'
    log: ['The duel begins. The Cinder Witch shuffles her deck.'],
    player: newSide(CONFIG.playerName, buildDeck(), rand),
    // The witch is the boss of the pact: 3 extra life, so the race is fair
    // despite you striking first every round.
    enemy: newSide(CONFIG.aiName, buildDeck(), rand, CONFIG.startHp + 3),
    selected: -1,
    message: '',
  };
  drawCards(state.player, CONFIG.startHand);
  drawCards(state.enemy, CONFIG.startHand);
  return state;
}

export function drawCards(side, n) {
  for (let i = 0; i < n; i++) {
    if (side.hand.length >= CONFIG.maxHand) return;
    if (side.deck.length === 0) {
      side.deck = shuffle(side.discard, Math.random);
      side.discard = [];
      if (side.deck.length === 0) return;
    }
    side.hand.push(side.deck.pop());
  }
}

export function canPlay(state, card) {
  return state.screen === 'play' && state.phase === 'player' && card.cost <= state.player.mana;
}

export function dealDamage(target, amount) {
  let rest = amount;
  if (target.shield > 0) {
    const blocked = Math.min(target.shield, rest);
    target.shield -= blocked;
    rest -= blocked;
  }
  target.hp = Math.max(0, target.hp - rest);
  return amount - rest; // damage actually blocked by shield
}

// Resolve one card. Returns a short log line describing what happened.
export function playCard(state, side, foe, card) {
  const handIndex = side.hand.indexOf(card);
  if (handIndex < 0) return '';
  side.hand.splice(handIndex, 1);
  side.mana -= card.cost;
  side.discard.push(card);
  side.played.push(card);
  const parts = [];
  if (card.attack > 0) {
    const blocked = dealDamage(foe, card.attack);
    parts.push(`${card.name} hits ${foe.name} for ${card.attack}${blocked ? ` (${blocked} blocked)` : ''}`);
  }
  if (card.shield > 0) {
    side.shield += card.shield;
    parts.push(`${side.name} gains ${card.shield} shield`);
  }
  if (card.heal > 0) {
    const healed = Math.min(card.heal, side.maxHp - side.hp);
    side.hp += healed;
    parts.push(`${side.name} heals ${healed}`);
  }
  if (card.draw > 0) {
    drawCards(side, card.draw);
    parts.push(`${side.name} draws ${card.draw}`);
  }
  return parts.join('. ') + '.';
}

export function checkEnd(state) {
  if (state.enemy.hp <= 0) {
    state.screen = 'victory';
    state.phase = 'over';
    state.log.push('The Cinder Witch falls. You win the pact!');
    return true;
  }
  if (state.player.hp <= 0) {
    state.screen = 'defeat';
    state.phase = 'over';
    state.log.push('Your ember gutters out. The witch takes the pact.');
    return true;
  }
  return false;
}

export function startGame(state) {
  state.screen = 'play';
  state.phase = 'player';
  state.log.push('Your turn. Play cards, then End Turn.');
}

export function endPlayerTurn(state) {
  if (state.screen !== 'play' || state.phase !== 'player') return;
  state.phase = 'enemy';
  state.log.push(`— Turn ${state.turn}: the witch plays —`);
}

// The witch takes her turn, then the table returns to you.
export function runEnemyTurn(state, choosePlays) {
  // Her shield from last turn has already faced your attacks: it fades now,
  // before she plays, so a shield she gains this turn still protects her.
  state.enemy.shield = 0;
  const plays = choosePlays(state.enemy, state.player);
  for (const card of plays) {
    const line = playCard(state, state.enemy, state.player, card);
    if (line) state.log.push(line);
    if (checkEnd(state)) return;
  }
  state.turn += 1;
  state.player.maxMana = Math.min(CONFIG.maxMana, state.player.maxMana + 1);
  state.player.mana = state.player.maxMana;
  // Your shield faced the witch's attacks all turn: it fades as your new
  // turn starts. Her shield stays — she gained it this turn, and it must
  // still be there when you strike next.
  state.player.shield = 0;
  state.enemy.maxMana = Math.min(CONFIG.maxMana, state.enemy.maxMana + 1);
  state.enemy.mana = state.enemy.maxMana;
  state.enemy.played = [];
  state.player.played = [];
  drawCards(state.player, CONFIG.drawPerTurn);
  drawCards(state.enemy, CONFIG.drawPerTurn);
  state.phase = 'player';
  state.log.push(`Turn ${state.turn}: your move. Mana ${state.player.mana}/${state.player.maxMana}.`);
  checkEnd(state);
}

export function restart(state) {
  const fresh = newGame(state.seed + 1);
  Object.assign(state, fresh);
  startGame(state);
}
