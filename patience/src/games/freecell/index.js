import { DEFAULT_DECK_CONFIG } from '../../core/deck';
import { canMoveToCascade, canMoveToFoundation, isWon } from './rules';

// Deal a FreeCell board: 52 cards face up across eight cascades
// (7,7,7,7,6,6,6,6), four empty free cells, four empty foundations.
const deal = (deck) => {
  const cascades = Array(8).fill().map(() => []);
  deck.forEach((card, i) => {
    cascades[i % 8].push({ ...card, faceUp: true });
  });

  return {
    cascades,
    cells: [null, null, null, null],
    foundations: [[], [], [], []]
  };
};

export const freecell = {
  id: 'freecell',
  name: 'FreeCell',
  deckConfig: DEFAULT_DECK_CONFIG,
  deal,
  rules: {
    canMoveToPile: canMoveToCascade,
    canMoveToFoundation,
    isWon
  }
};
