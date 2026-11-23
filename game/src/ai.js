// Ember Pact — the opponent's brain. One clear job: how the witch plays.
// Greedy and readable: she spends her mana on her hardest affordable hits,
// saves a shield when she is hurt, and never holds back a card she can play.
export function choosePlays(enemy, player) {
  const plays = [];
  let mana = enemy.mana;
  const hand = enemy.hand.slice();
  // Hurt? Shield first, before attacking.
  if (enemy.hp <= 12) {
    const guard = hand
      .filter((c) => c.shield > 0 && c.cost <= mana)
      .sort((a, b) => b.shield - a.shield)[0];
    if (guard) {
      plays.push(guard);
      mana -= guard.cost;
      hand.splice(hand.indexOf(guard), 1);
    }
  }
  // Then the biggest affordable attacks, best value first, until mana runs out.
  const attacks = hand
    .filter((c) => c.attack > 0 && c.cost <= mana)
    .sort((a, b) => b.attack / b.cost - a.attack / a.cost);
  for (const card of attacks) {
    if (card.cost > mana) continue;
    plays.push(card);
    mana -= card.cost;
    hand.splice(hand.indexOf(card), 1);
  }
  // Spend leftover mana on every utility card that fits, best first.
  let more = true;
  while (more) {
    more = false;
    const utility = hand
      .filter((c) => !plays.includes(c) && c.attack === 0 && c.cost <= mana)
      .sort((a, b) => b.shield + b.heal - (a.shield + a.heal))[0];
    if (utility) {
      plays.push(utility);
      mana -= utility.cost;
      hand.splice(hand.indexOf(utility), 1);
      more = true;
    }
  }
  return plays;
}
