import { describe, it, expect } from 'vitest';
import { autoComplete } from './autoComplete';

const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const card = (suit, value, faceUp = true) => ({ suit, value, faceUp });
const pile = (suit, count) => VALUES.slice(0, count).map(v => card(suit, v));

const tableauWith = (columns) => {
  const tableau = [[], [], [], [], [], [], []];
  columns.forEach((column, i) => { tableau[i] = column; });
  return tableau;
};

const foundationsAt = ({ hearts = 0, diamonds = 0, clubs = 0, spades = 0 } = {}) =>
  [pile('hearts', hearts), pile('diamonds', diamonds), pile('clubs', clubs), pile('spades', spades)];

// Look up a foundation pile by suit rather than by index: Aces may be
// placed into whichever empty pile comes first.
const foundationValues = (foundations, suit) => {
  const match = foundations.find(f => f.length > 0 && f[0].suit === suit);
  return match ? match.map(c => c.value) : [];
};

describe('autoComplete', () => {
  it('moves every playable card to the foundations', () => {
    const foundations = foundationsAt();
    const waste = [card('spades', 'A')];
    const tableau = tableauWith([
      [card('hearts', '2')],
      [card('hearts', 'A')],
      [card('hearts', '3'), card('spades', '2')],
      [card('hearts', '4')],
    ]);

    const result = autoComplete(tableau, foundations, waste);

    expect(result.movesMade).toBe(6);
    expect(foundationValues(result.foundations, 'hearts')).toEqual(['A', '2', '3', '4']);
    expect(foundationValues(result.foundations, 'spades')).toEqual(['A', '2']);
    expect(result.tableau.every(column => column.length === 0)).toBe(true);
    expect(result.waste).toHaveLength(0);
  });

  it('drains the waste pile card by card as cards become playable', () => {
    const foundations = foundationsAt();
    const waste = [card('hearts', '2'), card('hearts', 'A')];

    const result = autoComplete(tableauWith([]), foundations, waste);

    expect(result.movesMade).toBe(2);
    expect(foundationValues(result.foundations, 'hearts')).toEqual(['A', '2']);
    expect(result.waste).toHaveLength(0);
  });

  it('uncovers and plays cards buried in a column', () => {
    const foundations = foundationsAt();
    // A valid alternating run: red A on black 2
    const tableau = tableauWith([
      [card('clubs', '2'), card('diamonds', 'A')],
      [card('clubs', 'A')],
    ]);

    const result = autoComplete(tableau, foundations, []);

    expect(result.movesMade).toBe(3);
    expect(foundationValues(result.foundations, 'clubs')).toEqual(['A', '2']);
    expect(foundationValues(result.foundations, 'diamonds')).toEqual(['A']);
    expect(result.tableau.every(column => column.length === 0)).toBe(true);
  });

  it('continues from partially built foundations', () => {
    const foundations = foundationsAt({ hearts: 11 });
    const tableau = tableauWith([[card('hearts', 'K')], [card('hearts', 'Q')]]);

    const result = autoComplete(tableau, foundations, []);

    expect(result.movesMade).toBe(2);
    expect(foundationValues(result.foundations, 'hearts')).toEqual(VALUES);
  });

  it('reports zero moves and leaves the board unchanged when nothing is playable', () => {
    const foundations = foundationsAt({ hearts: 2 });
    const waste = [card('spades', '5')];
    const tableau = tableauWith([[card('hearts', '9')]]);

    const result = autoComplete(tableau, foundations, waste);

    expect(result.movesMade).toBe(0);
    expect(result.tableau[0].map(c => c.value)).toEqual(['9']);
    expect(result.waste.map(c => c.value)).toEqual(['5']);
    expect(foundationValues(result.foundations, 'hearts')).toEqual(['A', '2']);
  });
});
