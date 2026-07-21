import { describe, it, expect } from 'vitest';
import { mulberry32, shuffle, dealGame } from './deal';
import { buildDeck } from './deck';
import { klondike } from '../games/klondike';

describe('mulberry32', () => {
  it('produces the same sequence for the same seed', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);

    for (let i = 0; i < 10; i++) {
      expect(a()).toBe(b());
    }
  });

  it('produces values in [0, 1)', () => {
    const rng = mulberry32(7);
    for (let i = 0; i < 100; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe('shuffle', () => {
  it('returns a new array with the same elements', () => {
    const original = buildDeck();
    const shuffled = shuffle(original);

    expect(shuffled).not.toBe(original);
    expect(shuffled).toHaveLength(52);
    expect(new Set(shuffled.map(c => c.id)).size).toBe(52);
  });

  it('does not modify the input array', () => {
    const original = [1, 2, 3, 4, 5];
    shuffle(original);
    expect(original).toEqual([1, 2, 3, 4, 5]);
  });

  it('is deterministic with a seeded rng', () => {
    const a = shuffle([...Array(20).keys()], mulberry32(9));
    const b = shuffle([...Array(20).keys()], mulberry32(9));
    expect(a).toEqual(b);
  });
});

describe('dealGame', () => {
  it('deals the same Klondike board for the same seed', () => {
    const a = dealGame(klondike, 42);
    const b = dealGame(klondike, 42);
    expect(a).toEqual(b);
  });

  it('deals different boards for different seeds', () => {
    const a = dealGame(klondike, 1);
    const b = dealGame(klondike, 2);
    expect(a).not.toEqual(b);
  });

  it('deals a legal Klondike board', () => {
    const { tableau, stock, waste, foundations } = dealGame(klondike, 7);

    expect(tableau.map(column => column.length)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(stock).toHaveLength(24);
    expect(stock.every(card => !card.faceUp)).toBe(true);
    expect(waste).toHaveLength(0);
    expect(foundations).toEqual([[], [], [], []]);

    for (const column of tableau) {
      expect(column[column.length - 1].faceUp).toBe(true);
      expect(column.slice(0, -1).every(card => !card.faceUp)).toBe(true);
    }

    const all = [...stock, ...tableau.flat()];
    expect(new Set(all.map(card => card.id)).size).toBe(52);
  });
});
