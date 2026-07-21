import { describe, it, expect } from 'vitest';
import { moveToFoundation, moveToTableau } from './moves';

const card = (suit, value, faceUp = true) => ({ suit, value, faceUp });

const tableauWith = (columns) => {
  const tableau = [[], [], [], [], [], [], []];
  columns.forEach((column, i) => { tableau[i] = column; });
  return tableau;
};

const emptyFoundations = () => [[], [], [], []];

describe('moveToFoundation', () => {
  it('moves the top waste card to a foundation', () => {
    const waste = [card('clubs', '9'), card('hearts', 'A')];
    const result = moveToFoundation(tableauWith([]), waste, emptyFoundations(), waste[1], 'waste', 1, null, 0);

    expect(result.foundations[0]).toEqual([card('hearts', 'A')]);
    expect(result.waste.map(c => c.value)).toEqual(['9']);
  });

  it('leaves the input piles untouched for waste moves', () => {
    const waste = [card('hearts', 'A')];
    const foundations = emptyFoundations();
    moveToFoundation(tableauWith([]), waste, foundations, waste[0], 'waste', 0, null, 0);

    expect(waste).toHaveLength(1);
    expect(foundations[0]).toHaveLength(0);
  });

  it('moves the top tableau card and turns up the exposed card', () => {
    const tableau = tableauWith([[card('clubs', 'K', false), card('hearts', 'A')]]);
    const result = moveToFoundation(tableau, [], emptyFoundations(), tableau[0][1], 'tableau', 1, 0, 0);

    expect(result.foundations[0]).toEqual([card('hearts', 'A')]);
    expect(result.tableau[0]).toHaveLength(1);
    expect(result.tableau[0][0].faceUp).toBe(true);
  });

  it('empties a single-card column cleanly', () => {
    const tableau = tableauWith([[card('hearts', 'A')]]);
    const result = moveToFoundation(tableau, [], emptyFoundations(), tableau[0][0], 'tableau', 0, 0, 0);

    expect(result.tableau[0]).toHaveLength(0);
    expect(result.foundations[0]).toHaveLength(1);
  });
});

describe('moveToTableau', () => {
  it('returns null when the move is not legal', () => {
    const tableau = tableauWith([[card('hearts', '6')], [card('diamonds', '7')]]);
    expect(moveToTableau(tableau, [], emptyFoundations(), tableau[0][0], 'tableau', 0, 0, 1)).toBeNull();
  });

  it('moves a run between tableau columns and turns up the exposed card', () => {
    const tableau = tableauWith([
      [card('diamonds', '9', false), card('spades', '7'), card('hearts', '6')],
      [card('diamonds', '8')],
    ]);

    const result = moveToTableau(tableau, [], emptyFoundations(), tableau[0][1], 'tableau', 1, 0, 1);

    expect(result.tableau[1].map(c => c.value)).toEqual(['8', '7', '6']);
    expect(result.tableau[0].map(c => c.value)).toEqual(['9']);
    expect(result.tableau[0][0].faceUp).toBe(true);
  });

  it('moves the top waste card onto a tableau column', () => {
    const waste = [card('hearts', '6')];
    const tableau = tableauWith([[card('spades', '7')]]);

    const result = moveToTableau(tableau, waste, emptyFoundations(), waste[0], 'waste', 0, null, 0);

    expect(result.tableau[0].map(c => c.value)).toEqual(['7', '6']);
    expect(result.waste).toHaveLength(0);
  });

  it('moves a foundation card back onto a tableau column', () => {
    const foundations = [[card('hearts', 'A'), card('hearts', '2')], [], [], []];
    const tableau = tableauWith([[card('spades', '3')]]);

    const result = moveToTableau(tableau, [], foundations, foundations[0][1], 'foundation', 1, 0, 0);

    expect(result.tableau[0].map(c => c.value)).toEqual(['3', '2']);
    expect(result.foundations[0].map(c => c.value)).toEqual(['A']);
  });

  it('allows only Kings onto an empty column', () => {
    const tableau = tableauWith([[], [card('spades', 'K')], [card('hearts', '5')]]);

    const kingMove = moveToTableau(tableau, [], emptyFoundations(), tableau[1][0], 'tableau', 0, 1, 0);
    expect(kingMove.tableau[0].map(c => c.value)).toEqual(['K']);

    const fiveMove = moveToTableau(tableau, [], emptyFoundations(), tableau[2][0], 'tableau', 0, 2, 0);
    expect(fiveMove).toBeNull();
  });
});
