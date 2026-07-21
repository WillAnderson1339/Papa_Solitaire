// Shared deck construction for all games.

export const DEFAULT_DECK_CONFIG = {
  suits: ['hearts', 'diamonds', 'clubs', 'spades'],
  values: ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'],
  decks: 1
};

// Build an unshuffled deck of face-down cards from a deck configuration.
// Games may override suits, values, or the number of decks.
export const buildDeck = (config = DEFAULT_DECK_CONFIG) => {
  const { suits, values, decks } = { ...DEFAULT_DECK_CONFIG, ...config };
  const cards = [];

  for (let d = 0; d < decks; d++) {
    suits.forEach(suit => {
      values.forEach(value => {
        cards.push({
          id: decks === 1 ? `${suit}-${value}` : `${suit}-${value}-${d + 1}`,
          suit,
          value,
          faceUp: false
        });
      });
    });
  }

  return cards;
};
