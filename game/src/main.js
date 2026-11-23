// Ember Pact — bootstrap. One clear job: start the game and keep it drawn.
// The canvas is fixed at 1280x800 (the screenshot size); CSS scales it to
// the window. ?shot=title|play|victory|gameover renders a fixed state of the
// same code for screenshots; without it, the game opens on its title screen.
import { CONFIG } from './config.js';
import { newGame } from './state.js';
import { render } from './render.js';
import { bindInput } from './input.js';
import { stateForShot, shotFromUrl } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const ui = { cardRects: [], endTurnRect: null, playRect: null };
window.__emberUi = ui;

const { shot, seed } = shotFromUrl();
const state = shot ? stateForShot(shot, seed) : newGame(seed || 7);
window.__emberState = state;

function rerender() {
  render(ctx, state, ui);
}
window.__emberRerender = rerender;

window.addEventListener('error', (ev) => {
  document.title = `ERROR: ${ev.message}`;
});

bindInput(canvas, state, ui, rerender);
rerender();
