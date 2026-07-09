import { describe, it, expect } from 'vitest';
import {
  shuffleArray,
  getCardValue,
  getCardColor,
  areOppositeColors,
  formatTime,
  calculateScore,
} from './helpers';

describe('shuffleArray', () => {
  it('returns a new array with the same elements', () => {
    const original = [1, 2, 3, 4, 5, 6, 7, 8];
    const shuffled = shuffleArray(original);

    expect(shuffled).not.toBe(original);
    expect(shuffled).toHaveLength(original.length);
    expect([...shuffled].sort()).toEqual([...original].sort());
  });

  it('does not modify the original array', () => {
    const original = [1, 2, 3, 4, 5];
    shuffleArray(original);
    expect(original).toEqual([1, 2, 3, 4, 5]);
  });
});

describe('getCardValue', () => {
  it('maps card faces to their numeric values', () => {
    expect(getCardValue('A')).toBe(1);
    expect(getCardValue('10')).toBe(10);
    expect(getCardValue('J')).toBe(11);
    expect(getCardValue('Q')).toBe(12);
    expect(getCardValue('K')).toBe(13);
  });

  it('returns 0 for unknown values', () => {
    expect(getCardValue('joker')).toBe(0);
  });
});

describe('getCardColor', () => {
  it('identifies red and black suits', () => {
    expect(getCardColor('hearts')).toBe('red');
    expect(getCardColor('diamonds')).toBe('red');
    expect(getCardColor('clubs')).toBe('black');
    expect(getCardColor('spades')).toBe('black');
  });
});

describe('areOppositeColors', () => {
  it('is true for a red and a black card', () => {
    expect(areOppositeColors({ suit: 'hearts' }, { suit: 'spades' })).toBe(true);
  });

  it('is false for two cards of the same color', () => {
    expect(areOppositeColors({ suit: 'hearts' }, { suit: 'diamonds' })).toBe(false);
    expect(areOppositeColors({ suit: 'clubs' }, { suit: 'spades' })).toBe(false);
  });
});

describe('formatTime', () => {
  it('formats seconds as m:ss', () => {
    expect(formatTime(0)).toBe('0:00');
    expect(formatTime(9)).toBe('0:09');
    expect(formatTime(65)).toBe('1:05');
    expect(formatTime(600)).toBe('10:00');
  });
});

describe('calculateScore', () => {
  it('returns 0 when the game is not won', () => {
    expect(calculateScore(10, 30, false)).toBe(0);
  });

  it('deducts points for moves and time', () => {
    // 500 base - (50 moves * 2) - (50s / 5) = 390
    expect(calculateScore(50, 50, true)).toBe(390);
  });

  it('caps the penalties and never goes below 0', () => {
    // Penalties cap at 300 (moves) + 200 (time) = base score
    expect(calculateScore(100000, 100000, true)).toBe(0);
  });
});
