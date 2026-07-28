// Shared low-level pile operations used by the games' move logic.

// The top card of a pile, or null for an empty pile
export const topCard = (pile) => (pile.length > 0 ? pile[pile.length - 1] : null);

// A copy of the pile without its top `count` cards
export const withoutTop = (pile, count = 1) => pile.slice(0, pile.length - count);

// A copy of the pile with the given cards appended
export const withAppended = (pile, ...cards) => [...pile, ...cards];

// The run of cards from `index` to the end of the pile
export const runFrom = (pile, index) => pile.slice(index);

// A copy of the pile keeping only the cards before `index`
export const before = (pile, index) => pile.slice(0, index);

// Reveal the top card of a column once it becomes exposed by a move.
export const flipTopCard = (column) => {
  const top = column[column.length - 1];
  if (top && !top.faceUp) {
    Object.assign(top, { faceUp: true });
  }
  return column;
};
