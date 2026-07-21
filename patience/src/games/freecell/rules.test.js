import { describe, it, expect } from 'vitest';
import { canMoveToCascade, canMoveToFoundation, isWon } from './rules';

const card = (suit, value) => ({ suit, value, faceUp: true });

const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const fullFoundation = (suit) => VALUES.map(v => card(suit, v));

describe('canMoveToCascade', () => {
  it('allows any card on an empty cascade', () => {
    expect(canMoveToCascade(card('hearts', '7'), null, true)).toBe(true);
    expect(canMoveToCascade(card('spades', 'K'), null, true)).toBe(true);
    expect(canMoveToCascade(card('clubs', 'A'), null, true)).toBe(true);
  });

  it('allows a card of opposite color one rank lower', () => {
    expect(canMoveToCascade(card('hearts', '6'), card('spades', '7'), false)).toBe(true);
    expect(canMoveToCascade(card('clubs', '10'), card('diamonds', 'J'), false)).toBe(true);
  });

  it('rejects same-color and non-descending placements', () => {
    expect(canMoveToCascade(card('hearts', '6'), card('diamonds', '7'), false)).toBe(false);
    expect(canMoveToCascade(card('hearts', '5'), card('spades', '7'), false)).toBe(false);
    expect(canMoveToCascade(card('hearts', '8'), card('spades', '7'), false)).toBe(false);
  });
});

describe('canMoveToFoundation', () => {
  it('allows only Aces on an empty foundation', () => {
    expect(canMoveToFoundation(card('hearts', 'A'), [])).toBe(true);
    expect(canMoveToFoundation(card('hearts', '2'), [])).toBe(false);
  });

  it('allows the next rank of the same suit', () => {
    expect(canMoveToFoundation(card('hearts', '2'), [card('hearts', 'A')])).toBe(true);
    expect(canMoveToFoundation(card('spades', '2'), [card('hearts', 'A')])).toBe(false);
    expect(canMoveToFoundation(card('hearts', '3'), [card('hearts', 'A')])).toBe(false);
  });
});

describe('isWon', () => {
  it('is true only when all four foundations are complete', () => {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    expect(isWon(suits.map(fullFoundation))).toBe(true);
    expect(isWon([fullFoundation('hearts'), fullFoundation('diamonds'), fullFoundation('clubs'), []])).toBe(false);
  });
});
