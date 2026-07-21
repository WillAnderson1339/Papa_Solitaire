import { describe, it, expect } from 'vitest';
import { isValidMove, isValidFoundationMove, hasValidMoves, isGameWon } from './rules';

const card = (suit, value, faceUp = true) => ({ suit, value, faceUp });

// A full A-K foundation run for one suit
const fullFoundation = (suit) =>
  ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'].map(value => card(suit, value));

describe('isValidMove (tableau)', () => {
  it('allows only Kings on an empty column', () => {
    expect(isValidMove(card('spades', 'K'), null, true)).toBe(true);
    expect(isValidMove(card('spades', 'Q'), null, true)).toBe(false);
  });

  it('allows a card of opposite color and one rank lower', () => {
    expect(isValidMove(card('hearts', '6'), card('spades', '7'), false)).toBe(true);
    expect(isValidMove(card('clubs', '10'), card('diamonds', 'J'), false)).toBe(true);
  });

  it('rejects same-color moves', () => {
    expect(isValidMove(card('hearts', '6'), card('diamonds', '7'), false)).toBe(false);
    expect(isValidMove(card('clubs', '6'), card('spades', '7'), false)).toBe(false);
  });

  it('rejects moves that are not exactly one rank lower', () => {
    expect(isValidMove(card('hearts', '5'), card('spades', '7'), false)).toBe(false);
    expect(isValidMove(card('hearts', '8'), card('spades', '7'), false)).toBe(false);
    expect(isValidMove(card('hearts', '7'), card('spades', '7'), false)).toBe(false);
  });

  it('rejects moves onto a face-down or missing target card', () => {
    expect(isValidMove(card('hearts', '6'), card('spades', '7', false), false)).toBe(false);
    expect(isValidMove(card('hearts', '6'), null, false)).toBe(false);
  });
});

describe('isValidFoundationMove', () => {
  it('allows only Aces on an empty foundation', () => {
    expect(isValidFoundationMove(card('hearts', 'A'), [])).toBe(true);
    expect(isValidFoundationMove(card('hearts', '2'), [])).toBe(false);
  });

  it('allows the next rank of the same suit', () => {
    expect(isValidFoundationMove(card('hearts', '2'), [card('hearts', 'A')])).toBe(true);
    expect(isValidFoundationMove(card('spades', 'K'), fullFoundation('spades').slice(0, 12))).toBe(true);
  });

  it('rejects a different suit or a rank that does not follow', () => {
    expect(isValidFoundationMove(card('spades', '2'), [card('hearts', 'A')])).toBe(false);
    expect(isValidFoundationMove(card('hearts', '3'), [card('hearts', 'A')])).toBe(false);
  });
});

describe('hasValidMoves', () => {
  const emptyTableau = [[], [], [], [], [], [], []];
  const emptyFoundations = [[], [], [], []];

  it('returns true while the stock still has cards', () => {
    expect(hasValidMoves(emptyTableau, emptyFoundations, [], [card('hearts', '5', false)])).toBe(true);
  });

  it('returns true when the waste card can go to a foundation', () => {
    expect(hasValidMoves(emptyTableau, emptyFoundations, [card('hearts', 'A')], [])).toBe(true);
  });

  it('returns true when a tableau card can move onto another column', () => {
    const tableau = [
      [card('hearts', '6')],
      [card('spades', '7')],
      [], [], [], [], [],
    ];
    expect(hasValidMoves(tableau, emptyFoundations, [], [])).toBe(true);
  });

  it('returns false when nothing can move', () => {
    // Two face-up cards that cannot stack on each other, no stock/waste
    const tableau = [
      [card('hearts', '4')],
      [card('diamonds', '9')],
      [], [], [], [], [],
    ];
    expect(hasValidMoves(tableau, emptyFoundations, [], [])).toBe(false);
  });
});

describe('isGameWon', () => {
  it('returns true when all four foundations are complete', () => {
    const foundations = ['hearts', 'diamonds', 'clubs', 'spades'].map(fullFoundation);
    expect(isGameWon(foundations)).toBe(true);
  });

  it('returns false while any foundation is incomplete', () => {
    const foundations = [
      fullFoundation('hearts'),
      fullFoundation('diamonds'),
      fullFoundation('clubs'),
      fullFoundation('spades').slice(0, 12),
    ];
    expect(isGameWon(foundations)).toBe(false);
  });
});
