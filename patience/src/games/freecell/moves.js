// Move execution for FreeCell. All moves are single cards; every function
// returns the new zones, or null when the move is not legal.
import { topCard, withoutTop, withAppended } from '../../core/piles';
import { canMoveToCascade, canMoveToFoundation } from './rules';

// Move the top card of a cascade to an empty free cell
export const cascadeToCell = (cascades, cells, cascadeIndex, cellIndex) => {
  const card = topCard(cascades[cascadeIndex]);
  if (!card || cells[cellIndex] !== null) {
    return null;
  }

  const newCascades = [...cascades];
  newCascades[cascadeIndex] = withoutTop(newCascades[cascadeIndex]);
  const newCells = [...cells];
  newCells[cellIndex] = card;

  return { cascades: newCascades, cells: newCells };
};

// Move a card from a free cell onto a cascade
export const cellToCascade = (cells, cascades, cellIndex, cascadeIndex) => {
  const card = cells[cellIndex];
  if (!card) {
    return null;
  }
  const target = cascades[cascadeIndex];
  if (!canMoveToCascade(card, topCard(target), target.length === 0)) {
    return null;
  }

  const newCells = [...cells];
  newCells[cellIndex] = null;
  const newCascades = [...cascades];
  newCascades[cascadeIndex] = withAppended(target, card);

  return { cells: newCells, cascades: newCascades };
};

// Move the top card of one cascade onto another
export const cascadeToCascade = (cascades, fromIndex, toIndex) => {
  const card = topCard(cascades[fromIndex]);
  if (!card || fromIndex === toIndex) {
    return null;
  }
  const target = cascades[toIndex];
  if (!canMoveToCascade(card, topCard(target), target.length === 0)) {
    return null;
  }

  const newCascades = [...cascades];
  newCascades[fromIndex] = withoutTop(newCascades[fromIndex]);
  newCascades[toIndex] = withAppended(target, card);

  return { cascades: newCascades };
};

// Move the top card of a cascade to a foundation
export const cascadeToFoundation = (cascades, foundations, cascadeIndex, foundationIndex) => {
  const card = topCard(cascades[cascadeIndex]);
  if (!card || !canMoveToFoundation(card, foundations[foundationIndex])) {
    return null;
  }

  const newCascades = [...cascades];
  newCascades[cascadeIndex] = withoutTop(newCascades[cascadeIndex]);
  const newFoundations = [...foundations];
  newFoundations[foundationIndex] = withAppended(newFoundations[foundationIndex], card);

  return { cascades: newCascades, foundations: newFoundations };
};

// Move a card from a free cell to a foundation
export const cellToFoundation = (cells, foundations, cellIndex, foundationIndex) => {
  const card = cells[cellIndex];
  if (!card || !canMoveToFoundation(card, foundations[foundationIndex])) {
    return null;
  }

  const newCells = [...cells];
  newCells[cellIndex] = null;
  const newFoundations = [...foundations];
  newFoundations[foundationIndex] = withAppended(newFoundations[foundationIndex], card);

  return { cells: newCells, foundations: newFoundations };
};
