// Ember Pact — everything the eye sees. One clear job: draw the table.
// Layout (1280x800): witch's row on top, the shared table in the middle,
// your hand fanned along the bottom. Cards are parchment rectangles with a
// coloured suit band, a big cost gem, a readable name, value and rules text.
import { CONFIG, SUITS } from './config.js';

export const CARD_W = 132;
export const CARD_H = 188;
export const HAND_Y = 560;

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function bar(ctx, x, y, w, h, frac, fill, bg) {
  ctx.fillStyle = bg;
  roundRect(ctx, x, y, w, h, h / 2);
  ctx.fill();
  if (frac > 0) {
    ctx.fillStyle = fill;
    roundRect(ctx, x, y, Math.max(h, w * Math.min(1, frac)), h, h / 2);
    ctx.fill();
  }
}

function drawCardFace(ctx, card, x, y, w, h, opts = {}) {
  const suit = SUITS[card.suit];
  const playable = opts.playable;
  const selected = opts.selected;
  ctx.save();
  if (selected) ctx.translate(0, -18);
  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = CONFIG.colors.parchment;
  roundRect(ctx, x, y, w, h, 10);
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = playable ? CONFIG.colors.gold : '#b09a6a';
  ctx.lineWidth = playable ? 3 : 1.5;
  roundRect(ctx, x + 1, y + 1, w - 2, h - 2, 9);
  ctx.stroke();
  // Suit band.
  ctx.fillStyle = suit.color;
  roundRect(ctx, x, y, w, 34, 10);
  ctx.fill();
  ctx.fillRect(x, y + 24, w, 10);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 15px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.fillText(suit.name.toUpperCase(), x + 10, y + 23);
  ctx.textAlign = 'right';
  ctx.fillText(suit.glyph, x + w - 10, y + 23);
  // Cost gem.
  ctx.fillStyle = CONFIG.colors.mana;
  ctx.beginPath();
  ctx.arc(x + 20, y + 52, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 17px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(String(card.cost), x + 20, y + 58);
  // Big value: attack sword, shield, or heal heart — whichever the card does.
  ctx.fillStyle = CONFIG.colors.ink;
  ctx.font = 'bold 44px Georgia, serif';
  const big = card.attack > 0 ? `⚔ ${card.attack}`
    : card.shield > 0 ? `⛨ ${card.shield}`
    : card.heal > 0 ? `♥ ${card.heal}` : `✦ ${card.draw}`;
  ctx.fillText(big, x + w / 2, y + 105);
  // Name.
  ctx.font = 'bold 15px Georgia, serif';
  ctx.fillText(card.name, x + w / 2, y + 132);
  // Rules text.
  ctx.font = '12px Georgia, serif';
  ctx.fillStyle = '#5a4a33';
  wrapText(ctx, card.text, x + w / 2, y + 152, w - 16, 14);
  if (!playable && opts.dim) {
    ctx.fillStyle = 'rgba(20,20,20,0.35)';
    roundRect(ctx, x, y, w, h, 10);
    ctx.fill();
  }
  ctx.restore();
  return { x, y: selected ? y - 18 : y, w, h };
}

function wrapText(ctx, text, cx, y, maxW, lineH) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? line + ' ' + word : word;
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line);
      line = word;
    } else line = test;
  }
  if (line) lines.push(line);
  ctx.textAlign = 'center';
  lines.forEach((l, i) => ctx.fillText(l, cx, y + i * lineH));
}

function drawCardBack(ctx, x, y, w, h) {
  ctx.fillStyle = '#3a2a4a';
  roundRect(ctx, x, y, w, h, 10);
  ctx.fill();
  ctx.strokeStyle = CONFIG.colors.gold;
  ctx.lineWidth = 2;
  roundRect(ctx, x + 5, y + 5, w - 10, h - 10, 7);
  ctx.stroke();
  ctx.fillStyle = CONFIG.colors.gold;
  ctx.font = 'bold 26px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('✦', x + w / 2, y + h / 2 + 9);
}

function drawSidePanel(ctx, side, x, y, alignRight) {
  ctx.textAlign = alignRight ? 'right' : 'left';
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 26px Georgia, serif';
  ctx.fillText(side.name, x, y);
  ctx.font = '16px Georgia, serif';
  ctx.fillStyle = '#d8c690';
  ctx.fillText(`♥ ${side.hp} / ${side.maxHp} life`, x, y + 26);
  bar(ctx, alignRight ? x - 220 : x, y + 36, 220, 14, side.hp / side.maxHp, CONFIG.colors.hp, 'rgba(0,0,0,0.5)');
  // Shield line sits below the bar; mana pips sit below that.
  let my = y + 72;
  if (side.shield > 0) {
    ctx.fillStyle = '#9ecfff';
    ctx.fillText(`⛨ ${side.shield} shield`, x, y + 62);
    my = y + 86;
  }
  // Mana crystals.
  for (let i = 0; i < side.maxMana; i++) {
    ctx.beginPath();
    ctx.arc((alignRight ? x - 200 : x) + i * 22, my, 8, 0, Math.PI * 2);
    ctx.fillStyle = i < side.mana ? CONFIG.colors.mana : 'rgba(255,255,255,0.18)';
    ctx.fill();
  }
  ctx.fillStyle = '#d8c690';
  ctx.font = '14px Georgia, serif';
  ctx.fillText(`◆ ${side.mana}/${side.maxMana} mana`, x, my + 26);
}

function drawTable(ctx, state) {
  const { width, height } = CONFIG;
  // Felt with a vignette.
  const g = ctx.createRadialGradient(width / 2, height / 2, 100, width / 2, height / 2, 720);
  g.addColorStop(0, CONFIG.colors.felt);
  g.addColorStop(1, CONFIG.colors.feltDark);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = CONFIG.colors.tableEdge;
  ctx.lineWidth = 10;
  ctx.strokeRect(8, 8, width - 16, height - 16);
  ctx.strokeStyle = 'rgba(232,182,76,0.35)';
  ctx.lineWidth = 2;
  ctx.strokeRect(22, 22, width - 44, height - 44);
}

function drawLog(ctx, state) {
  const lines = state.log.slice(-4);
  ctx.textAlign = 'left';
  ctx.font = '15px Georgia, serif';
  lines.forEach((line, i) => {
    ctx.fillStyle = `rgba(255,248,220,${0.45 + 0.18 * i})`;
    ctx.fillText(line, 60, 300 + i * 22);
  });
}

export function render(ctx, state, ui) {
  const { width, height } = CONFIG;
  ctx.clearRect(0, 0, width, height);
  if (state.screen === 'title') return renderTitle(ctx, state);
  if (state.screen === 'victory' || state.screen === 'defeat') {
    return renderEnd(ctx, state);
  }
  return renderPlay(ctx, state, ui);
}

function renderTitle(ctx, state) {
  drawTable(ctx, state);
  // Fanned decorative cards behind the title.
  const deco = [
    { id: 'inferno', name: 'Inferno', suit: 'flame', cost: 4, attack: 8, shield: 0, heal: 0, draw: 0, text: 'Deal 8 damage.' },
    { id: 'pact', name: 'Ember Pact', suit: 'leaf', cost: 3, attack: 4, shield: 0, heal: 2, draw: 1, text: 'Deal 4, heal 2, draw 1.' },
    { id: 'wall', name: 'Stone Wall', suit: 'stone', cost: 3, attack: 0, shield: 9, heal: 0, draw: 0, text: 'Gain 9 shield.' },
  ];
  ctx.save();
  ctx.translate(640, 470);
  deco.forEach((card, i) => {
    ctx.save();
    ctx.rotate((i - 1) * 0.22);
    ctx.translate((i - 1) * 150, Math.abs(i - 1) * 12);
    drawCardFace(ctx, card, -66, -94, CARD_W, CARD_H, {});
    ctx.restore();
  });
  ctx.restore();
  ctx.textAlign = 'center';
  ctx.fillStyle = CONFIG.colors.gold;
  ctx.font = 'bold 92px Georgia, serif';
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 18;
  ctx.fillText('EMBER PACT', 640, 210);
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = '#f4e8c8';
  ctx.font = 'italic 26px Georgia, serif';
  ctx.fillText('A duel of cards against the Cinder Witch', 640, 255);
  ctx.font = '20px Georgia, serif';
  ctx.fillStyle = '#d8c690';
  ctx.fillText('30 life each · mana grows every turn · first to 0 loses', 640, 300);
  // Play button.
  ctx.fillStyle = CONFIG.colors.gold;
  roundRect(ctx, 520, 640, 240, 64, 12);
  ctx.fill();
  ctx.fillStyle = '#2b2118';
  ctx.font = 'bold 28px Georgia, serif';
  ctx.fillText('▶  PLAY', 640, 682);
  ctx.font = '16px Georgia, serif';
  ctx.fillStyle = '#cbbd93';
  ctx.fillText('Click PLAY or press Enter · keys 1–7 play cards · Space ends turn', 640, 745);
}

function renderPlay(ctx, state, ui) {
  drawTable(ctx, state);
  ui.cardRects = [];
  ui.endTurnRect = null;
  ui.playRect = null;
  const W = CONFIG.width;
  // Witch's row: face-down hand + panel.
  drawSidePanel(ctx, state.enemy, 60, 70, false);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#d8c690';
  ctx.font = '15px Georgia, serif';
  ctx.fillText(`Witch's deck: ${state.enemy.deck.length} cards`, W - 60, 60);
  const backW = 86, backH = 122;
  const n = state.enemy.hand.length;
  const totalW = n * (backW + 8);
  let bx = (W - totalW) / 2;
  for (let i = 0; i < n; i++) {
    drawCardBack(ctx, bx, 96, backW, backH);
    bx += backW + 8;
  }
  // Cards the witch just played, face-up in the middle, scaled to 62%.
  if (state.enemy.played.length) {
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f4e8c8';
    ctx.font = 'italic 16px Georgia, serif';
    ctx.fillText('The witch played', W / 2, 258);
    const miniW = CARD_W * 0.62;
    let px = W / 2 - (state.enemy.played.length * (miniW + 10)) / 2;
    for (const card of state.enemy.played) {
      ctx.save();
      ctx.translate(px, 268);
      ctx.scale(0.62, 0.62);
      drawCardFace(ctx, card, 0, 0, CARD_W, CARD_H, {});
      ctx.restore();
      px += miniW + 10;
    }
  }
  drawLog(ctx, state);
  // Turn banner + End Turn button.
  ctx.textAlign = 'center';
  ctx.fillStyle = '#f4e8c8';
  ctx.font = 'bold 22px Georgia, serif';
  ctx.fillText(`— Turn ${state.turn} —`, W / 2, 420);
  const btn = { x: W - 230, y: 440, w: 170, h: 52 };
  const canEnd = state.phase === 'player' && state.screen === 'play';
  ctx.fillStyle = canEnd ? CONFIG.colors.gold : 'rgba(255,255,255,0.25)';
  roundRect(ctx, btn.x, btn.y, btn.w, btn.h, 10);
  ctx.fill();
  ctx.fillStyle = '#2b2118';
  ctx.font = 'bold 20px Georgia, serif';
  ctx.fillText('END TURN ⏎', btn.x + btn.w / 2, btn.y + 34);
  ui.endTurnRect = btn;
  // Your panel + hand.
  drawSidePanel(ctx, state.player, 60, 500, false);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#d8c690';
  ctx.font = '15px Georgia, serif';
  ctx.fillText(`Your deck: ${state.player.deck.length} cards`, W - 60, 522);
  const hand = state.player.hand;
  const overlap = hand.length > 1 ? Math.min(0, (W - 120 - hand.length * CARD_W) / (hand.length - 1)) : 0;
  const step = CARD_W + overlap;
  const handW = hand.length * CARD_W + (hand.length - 1) * overlap;
  let hx = (W - handW) / 2;
  hand.forEach((card, i) => {
    const playable = canPlayCheck(state, card);
    const rect = drawCardFace(ctx, card, hx, HAND_Y, CARD_W, CARD_H, {
      playable,
      selected: state.selected === i,
      dim: state.phase === 'player' && !playable,
    });
    ui.cardRects.push({ ...rect, index: i });
    hx += step;
  });
  ctx.textAlign = 'center';
  ctx.fillStyle = '#cbbd93';
  ctx.font = '15px Georgia, serif';
  ctx.fillText('Click a glowing card to play it · 1–7 are shortcuts', W / 2, 778);
}

function canPlayCheck(state, card) {
  return state.screen === 'play' && state.phase === 'player' && card.cost <= state.player.mana;
}

function renderEnd(ctx, state) {
  const won = state.screen === 'victory';
  // A clean end screen of its own: dark felt, gold frame, no table clutter.
  drawTable(ctx, state);
  ctx.fillStyle = won ? 'rgba(20,40,24,0.88)' : 'rgba(30,12,14,0.88)';
  ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);
  ctx.textAlign = 'center';
  ctx.fillStyle = won ? CONFIG.colors.gold : '#e5484d';
  ctx.font = 'bold 96px Georgia, serif';
  ctx.shadowColor = 'rgba(0,0,0,0.7)';
  ctx.shadowBlur = 20;
  ctx.fillText(won ? 'VICTORY' : 'DEFEAT', 640, 300);
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = '#f4e8c8';
  ctx.font = 'italic 26px Georgia, serif';
  ctx.fillText(
    won ? 'The Cinder Witch falls. The pact is yours.' : 'Your ember gutters out. The witch takes the pact.',
    640, 360,
  );
  ctx.font = '20px Georgia, serif';
  ctx.fillStyle = '#d8c690';
  ctx.fillText(
    `Duel lasted ${state.turn} turn${state.turn === 1 ? '' : 's'} · You ${state.player.hp} ♥ · Witch ${state.enemy.hp} ♥`,
    640, 410,
  );
  // The last line of the duel log, as the closing note.
  const last = state.log[state.log.length - 1];
  if (last) {
    ctx.font = 'italic 17px Georgia, serif';
    ctx.fillStyle = '#cbbd93';
    ctx.fillText(last, 640, 450);
  }
  ctx.fillStyle = CONFIG.colors.gold;
  roundRect(ctx, 520, 500, 240, 64, 12);
  ctx.fill();
  ctx.fillStyle = '#2b2118';
  ctx.font = 'bold 26px Georgia, serif';
  ctx.fillText('↻  PLAY AGAIN', 640, 542);
  ctx.font = '16px Georgia, serif';
  ctx.fillStyle = '#cbbd93';
  ctx.fillText('Press R or click Play Again', 640, 605);
}
