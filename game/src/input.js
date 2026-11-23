// Ember Pact — mouse and keyboard. One clear job: turn clicks and keys into moves.
import { CONFIG } from './config.js';
import { canPlay, playCard, checkEnd, startGame, endPlayerTurn, runEnemyTurn, restart } from './state.js';
import { choosePlays } from './ai.js';
import { blip } from './sound.js';

function pointInRect(px, py, r) {
  return r && px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}

function playFromHand(state, index) {
  const card = state.player.hand[index];
  if (!card || !canPlay(state, card)) return false;
  const line = playCard(state, state.player, state.enemy, card);
  if (line) state.log.push(line);
  state.selected = -1;
  blip(660);
  return !checkEnd(state);
}

export function bindInput(canvas, state, ui, rerender) {
  canvas.addEventListener('click', (ev) => {
    const rect = canvas.getBoundingClientRect();
    const x = (ev.clientX - rect.left) * (CONFIG.width / rect.width);
    const y = (ev.clientY - rect.top) * (CONFIG.height / rect.height);
    handleClick(state, x, y);
    rerender();
  });

  window.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter' && state.screen === 'title') {
      startGame(state);
      blip(520);
    } else if (state.screen === 'play' && state.phase === 'player') {
      if (ev.key >= '1' && ev.key <= '7') {
        playFromHand(state, Number(ev.key) - 1);
      } else if (ev.key === ' ' || ev.key === 'Enter') {
        ev.preventDefault();
        finishTurn(state);
      }
    } else if ((state.screen === 'victory' || state.screen === 'defeat') && (ev.key === 'r' || ev.key === 'R' || ev.key === 'Enter')) {
      restart(state);
    }
    rerender();
  });
}

export function handleClick(state, x, y) {
  if (state.screen === 'title') {
    if (pointInRect(x, y, { x: 520, y: 640, w: 240, h: 64 })) {
      startGame(state);
      blip(520);
    }
    return;
  }
  if (state.screen === 'victory' || state.screen === 'defeat') {
    if (pointInRect(x, y, { x: 520, y: 500, w: 240, h: 64 })) restart(state);
    return;
  }
  if (state.screen !== 'play') return;
  const ui = window.__emberUi;
  if (ui && ui.endTurnRect && pointInRect(x, y, ui.endTurnRect)) {
    finishTurn(state);
    return;
  }
  if (ui && ui.cardRects) {
    for (const r of ui.cardRects) {
      if (pointInRect(x, y, r)) {
        playFromHand(state, r.index);
        return;
      }
    }
  }
}

function finishTurn(state) {
  if (state.phase !== 'player') return;
  endPlayerTurn(state);
  blip(440);
  // A short beat so the player sees the witch's cards land, then resolve.
  setTimeout(() => {
    runEnemyTurn(state, choosePlays);
    window.__emberRerender && window.__emberRerender();
  }, 450);
}
