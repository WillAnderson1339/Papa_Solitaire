import { getCardValue, areOppositeColors } from '../../utils/helpers';

// Whether a card may be placed on a cascade: any card may fill an empty
// cascade; otherwise colors must alternate and values descend by one.
export const canMoveToCascade = (card, targetCard, isEmptyCascade) => {
  if (isEmptyCascade) {
    return true;
  }
  if (!targetCard) {
    return false;
  }
  return areOppositeColors(card, targetCard) &&
         getCardValue(card.value) === getCardValue(targetCard.value) - 1;
};

// Whether a card may be placed on a foundation: Aces on empty piles,
// then same suit ascending.
export const canMoveToFoundation = (card, foundation) => {
  if (foundation.length === 0) {
    return card.value === 'A';
  }
  const top = foundation[foundation.length - 1];
  return card.suit === top.suit &&
         getCardValue(card.value) === getCardValue(top.value) + 1;
};

// The game is won when all four foundations are complete
export const isWon = (foundations) => foundations.every(f => f.length === 13);
