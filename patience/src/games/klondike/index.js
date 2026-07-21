import { DEFAULT_DECK_CONFIG } from '../../core/deck';

// Deal a standard Klondike board: seven tableau columns of 1..7 cards with
// the top card face up, and the remaining cards face down in the stock.
const deal = (deck) => {
  const remaining = [...deck];
  const tableau = Array(7).fill().map(() => []);

  for (let i = 0; i < 7; i++) {
    for (let j = 0; j <= i; j++) {
      const card = { ...remaining.pop(), faceUp: j === i };
      tableau[i].push(card);
    }
  }

  return {
    tableau,
    stock: remaining,
    waste: [],
    foundations: [[], [], [], []]
  };
};

export const klondike = {
  id: 'klondike',
  name: 'Klondike',
  deckConfig: DEFAULT_DECK_CONFIG,
  deal
};
