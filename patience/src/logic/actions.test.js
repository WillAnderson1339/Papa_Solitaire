import { describe, it, expect } from 'vitest';
import {
  drawFromStock,
  moveWasteToTableau,
  moveWasteToFoundation,
  moveTableauToFoundation,
  moveTableauToTableau,
  moveFoundationToTableau,
  autoMoveToFoundation,
} from './actions';

const card = (suit, value, faceUp = true) => ({ suit, value, faceUp });

const emptyTableau = () => [[], [], [], [], [], [], []];
const emptyFoundations = () => [[], [], [], []];

describe('drawFromStock', () => {
  it('draws the top stock card face up onto the waste', () => {
    const stock = [card('hearts', '2', false), card('spades', 'A', false)];
    const { stock: newStock, waste } = drawFromStock(stock, []);

    expect(newStock).toHaveLength(1);
    expect(waste).toHaveLength(1);
    expect(waste[0]).toEqual(card('spades', 'A', true));
  });

  it('draws multiple cards when count is greater than one', () => {
    const stock = [card('hearts', '2', false), card('clubs', '9', false), card('spades', 'A', false)];
    const { stock: newStock, waste } = drawFromStock(stock, [], 3);

    expect(newStock).toHaveLength(0);
    expect(waste.map(c => c.value)).toEqual(['A', '9', '2']);
    expect(waste.every(c => c.faceUp)).toBe(true);
  });

  it('recycles the waste back into the stock when the stock is empty', () => {
    const waste = [card('hearts', '5'), card('clubs', '9')];
    const { stock, waste: newWaste } = drawFromStock([], waste);

    expect(newWaste).toHaveLength(0);
    expect(stock.map(c => c.value)).toEqual(['9', '5']);
    expect(stock.every(c => !c.faceUp)).toBe(true);
  });

  it('does nothing when both stock and waste are empty', () => {
    expect(drawFromStock([], [])).toEqual({ stock: [], waste: [] });
  });
});

describe('moveWasteToTableau', () => {
  it('moves the top waste card to the chosen column', () => {
    const waste = [card('clubs', '9'), card('hearts', '6')];
    const tableau = emptyTableau();
    tableau[2] = [card('spades', '7')];

    const result = moveWasteToTableau(waste, tableau, 2);

    expect(result.waste.map(c => c.value)).toEqual(['9']);
    expect(result.tableau[2].map(c => c.value)).toEqual(['7', '6']);
  });

  it('does nothing when the waste is empty', () => {
    const tableau = emptyTableau();
    const result = moveWasteToTableau([], tableau, 0);
    expect(result.tableau).toBe(tableau);
  });
});

describe('moveWasteToFoundation', () => {
  it('moves the top waste card to the chosen foundation', () => {
    const waste = [card('hearts', 'A')];
    const result = moveWasteToFoundation(waste, emptyFoundations(), 0);

    expect(result.waste).toHaveLength(0);
    expect(result.foundations[0].map(c => c.value)).toEqual(['A']);
  });
});

describe('moveTableauToFoundation', () => {
  it('moves the top card and flips the newly exposed card', () => {
    const tableau = emptyTableau();
    tableau[0] = [card('clubs', 'K', false), card('hearts', 'A')];

    const result = moveTableauToFoundation(tableau, emptyFoundations(), 0, 1, 0);

    expect(result.foundations[0].map(c => c.value)).toEqual(['A']);
    expect(result.tableau[0]).toHaveLength(1);
    expect(result.tableau[0][0].faceUp).toBe(true);
  });

  it('only allows the top card of a column to move', () => {
    const tableau = emptyTableau();
    tableau[0] = [card('hearts', 'A'), card('spades', '3')];
    const foundations = emptyFoundations();

    const result = moveTableauToFoundation(tableau, foundations, 0, 0, 0);

    expect(result.tableau).toBe(tableau);
    expect(result.foundations).toBe(foundations);
  });
});

describe('moveTableauToTableau', () => {
  it('moves a stack of cards starting at cardIndex and flips the exposed card', () => {
    const tableau = emptyTableau();
    tableau[0] = [card('diamonds', '9', false), card('spades', '7'), card('hearts', '6')];
    tableau[1] = [card('diamonds', '8')];

    const result = moveTableauToTableau(tableau, 0, 1, 1);

    expect(result.tableau[0].map(c => c.value)).toEqual(['9']);
    expect(result.tableau[0][0].faceUp).toBe(true);
    expect(result.tableau[1].map(c => c.value)).toEqual(['8', '7', '6']);
  });

  it('does nothing for an out-of-range card index', () => {
    const tableau = emptyTableau();
    tableau[0] = [card('spades', '7')];
    const result = moveTableauToTableau(tableau, 0, 5, 1);
    expect(result.tableau).toBe(tableau);
  });
});

describe('moveFoundationToTableau', () => {
  it('moves the top foundation card back to a tableau column', () => {
    const foundations = emptyFoundations();
    foundations[0] = [card('hearts', 'A'), card('hearts', '2')];
    const tableau = emptyTableau();
    tableau[3] = [card('spades', '3')];

    const result = moveFoundationToTableau(foundations, tableau, 0, 3);

    expect(result.foundations[0].map(c => c.value)).toEqual(['A']);
    expect(result.tableau[3].map(c => c.value)).toEqual(['3', '2']);
  });
});

describe('autoMoveToFoundation', () => {
  it('moves all playable cards to the foundations in sequence', () => {
    const tableau = emptyTableau();
    tableau[0] = [card('hearts', '2')];
    const waste = [card('hearts', 'A')];

    const result = autoMoveToFoundation(tableau, emptyFoundations(), waste);

    expect(result.moved).toBe(true);
    expect(result.waste).toHaveLength(0);
    expect(result.tableau[0]).toHaveLength(0);
    expect(result.foundations[0].map(c => c.value)).toEqual(['A', '2']);
  });

  it('reports moved=false when nothing can be auto-moved', () => {
    const tableau = emptyTableau();
    tableau[0] = [card('hearts', '5')];

    const result = autoMoveToFoundation(tableau, emptyFoundations(), []);

    expect(result.moved).toBe(false);
    expect(result.tableau[0].map(c => c.value)).toEqual(['5']);
  });
});
