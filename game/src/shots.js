// Ember Pact — fixed states for screenshots. One clear job: ?shot= renders.
// The game is fully playable from its title screen; ?shot= only picks a
// deterministic state of the same code so the maker's screenshots are stable:
// title, a mid-duel table, the victory screen and the defeat screen.
import { CONFIG } from './config.js';
import { newGame, startGame, playCard, endPlayerTurn, runEnemyTurn, drawCards } from './state.js';
import { choosePlays } from './ai.js';
import { cardById } from './cards.js';

function setHand(side, ids) {
  side.hand = ids.map((id) => ({ ...cardById(id), uid: `${id}-shot` }));
}

function setDeckCount(side, n) {
  while (side.deck.length > n) side.deck.pop();
  while (side.deck.length < n) side.deck.push({ ...cardById('spark'), uid: `filler-${side.deck.length}` });
}

export function stateForShot(shot, seed) {
  const state = newGame(seed);
  if (shot === 'title') return state;
  startGame(state);
  if (shot === 'play') {
    // A lively mid-duel: turn 4, both sides hurt, hands full of real cards.
    state.turn = 4;
    state.player.maxMana = 5;
    state.player.mana = 4;
    state.enemy.maxMana = 5;
    state.enemy.mana = 5;
    state.player.hp = 24;
    state.enemy.hp = 19;
    state.enemy.shield = 3;
    setHand(state.player, ['lash', 'riptide', 'briar', 'mend', 'pact', 'spark']);
    setHand(state.enemy, ['lash', 'cut', 'wall', 'pebble', 'gale']);
    setDeckCount(state.player, 18);
    setDeckCount(state.enemy, 17);
    state.enemy.played = [{ ...cardById('cinder'), uid: 'cinder-shot' }];
    state.log = [
      'Turn 3: the witch played Cinder Bolt. Cinder Bolt hits You for 6 (3 blocked).',
      'Turn 4: your move. Mana 4/5.',
      'Thorn Whip is in your hand — 3 damage and a heal.',
    ];
    return state;
  }
  if (shot === 'victory') {
    state.turn = 7;
    state.player.hp = 11;
    state.enemy.hp = 0;
    state.screen = 'victory';
    state.phase = 'over';
    state.log.push('Inferno hits Cinder Witch for 8. The Cinder Witch falls. You win the pact!');
    return state;
  }
  if (shot === 'gameover') {
    state.turn = 6;
    state.player.hp = 0;
    state.enemy.hp = 14;
    state.screen = 'defeat';
    state.phase = 'over';
    state.log.push('Boulder Slam hits You for 10. Your ember gutters out.');
    return state;
  }
  return state;
}

// Read ?shot= and ?seed= from the page URL. Empty string means "just play".
export function shotFromUrl() {
  const q = new URLSearchParams(window.location.search);
  return {
    shot: q.get('shot') || '',
    seed: Number(q.get('seed') || '7'),
  };
}
