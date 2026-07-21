// Move execution for Klondike drag-and-drop play.
import { isValidMove } from './rules';
import { topCard, withAppended, runFrom, before, flipTopCard } from '../../core/piles';

// Move a card to a foundation. The caller has already validated the move.
export const moveToFoundation = (tableau, waste, foundations, card, source, index, stackIndex, foundationIndex) => {
  const newFoundations = [...foundations];
  let newTableau = [...tableau];
  let newWaste = [...waste];

  // Add card to foundation
  newFoundations[foundationIndex] = withAppended(newFoundations[foundationIndex], card);

  // Remove card from source
  if (source === 'tableau') {
    newTableau[stackIndex] = before(newTableau[stackIndex], index);
    newTableau[stackIndex] = flipTopCard(newTableau[stackIndex]);
  } else if (source === 'waste') {
    newWaste = withoutTopOfWaste(newWaste);
  }

  return {
    tableau: newTableau,
    waste: newWaste,
    foundations: newFoundations
  };
};

// Move a card (or a run of cards) onto a tableau column.
// Returns null when the move is not legal.
export const moveToTableau = (tableau, waste, foundations, card, source, index, sourceStackIndex, targetStackIndex) => {
  const targetStack = tableau[targetStackIndex];
  if (!isValidMove(card, topCard(targetStack), targetStack.length === 0)) {
    return null;
  }

  let cardsToMove = [];
  let newTableau = [...tableau];
  let newWaste = [...waste];
  let newFoundations = [...foundations];

  if (source === 'tableau') {
    // If moving from tableau, include all cards below
    cardsToMove = runFrom(tableau[sourceStackIndex], index);
    newTableau[sourceStackIndex] = before(tableau[sourceStackIndex], index);
    newTableau[sourceStackIndex] = flipTopCard(newTableau[sourceStackIndex]);
  } else if (source === 'waste') {
    cardsToMove = [card];
    newWaste = withoutTopOfWaste(newWaste);
  } else if (source === 'foundation') {
    cardsToMove = [card];
    newFoundations[sourceStackIndex] = before(foundations[sourceStackIndex], foundations[sourceStackIndex].length - 1);
  }

  // Add cards to target tableau
  newTableau[targetStackIndex] = withAppended(newTableau[targetStackIndex], ...cardsToMove);

  return {
    tableau: newTableau,
    waste: newWaste,
    foundations: newFoundations
  };
};

const withoutTopOfWaste = (waste) => waste.slice(0, -1);
