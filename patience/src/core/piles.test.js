import { describe, it, expect } from 'vitest';
import { topCard, withoutTop, withAppended, runFrom, before, flipTopCard } from './piles';

const card = (suit, value, faceUp = true) => ({ suit, value, faceUp });

describe('topCard', () => {
  it('returns the top card of a pile', () => {
    expect(topCard([card('hearts', 'A'), card('spades', '2')])).toEqual(card('spades', '2'));
  });

  it('returns null for an empty pile', () => {
    expect(topCard([])).toBeNull();
  });
});

describe('withoutTop', () => {
  it('removes the top card by default', () => {
    const pile = [card('hearts', 'A'), card('spades', '2')];
    expect(withoutTop(pile)).toEqual([card('hearts', 'A')]);
  });

  it('removes multiple cards when asked', () => {
    const pile = [card('hearts', 'A'), card('spades', '2'), card('clubs', '3')];
    expect(withoutTop(pile, 2)).toEqual([card('hearts', 'A')]);
  });

  it('returns a new array and leaves the input untouched', () => {
    const pile = [card('hearts', 'A'), card('spades', '2')];
    const result = withoutTop(pile);
    expect(result).not.toBe(pile);
    expect(pile).toHaveLength(2);
  });
});

describe('withAppended', () => {
  it('appends cards to a copy of the pile', () => {
    const pile = [card('hearts', 'A')];
    const result = withAppended(pile, card('spades', '2'), card('clubs', '3'));

    expect(result.map(c => c.value)).toEqual(['A', '2', '3']);
    expect(pile).toHaveLength(1);
  });
});

describe('runFrom and before', () => {
  it('split a pile around an index', () => {
    const pile = [card('hearts', 'A'), card('spades', '2'), card('clubs', '3')];

    expect(runFrom(pile, 1).map(c => c.value)).toEqual(['2', '3']);
    expect(before(pile, 1).map(c => c.value)).toEqual(['A']);
    expect(pile).toHaveLength(3);
  });
});

describe('flipTopCard', () => {
  it('turns a face-down top card face up', () => {
    const column = [card('hearts', '5', false), card('spades', '9', false)];
    const result = flipTopCard(column);

    expect(topCard(result).faceUp).toBe(true);
    expect(result[0].faceUp).toBe(false);
  });

  it('leaves an already face-up top card as it is', () => {
    const column = [card('hearts', '5', false), card('spades', '9', true)];
    const result = flipTopCard(column);

    expect(topCard(result)).toEqual(card('spades', '9', true));
  });

  it('is a no-op on an empty column', () => {
    expect(flipTopCard([])).toEqual([]);
  });
});
