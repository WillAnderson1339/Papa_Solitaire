import { describe, it, expect } from 'vitest';
import { buildDeck, DEFAULT_DECK_CONFIG } from './deck';

describe('buildDeck', () => {
  it('builds a standard 52-card deck by default', () => {
    const deck = buildDeck();

    expect(deck).toHaveLength(52);
    expect(deck.every(card => !card.faceUp)).toBe(true);

    const ids = new Set(deck.map(card => card.id));
    expect(ids.size).toBe(52);
  });

  it('gives every card a suit, value, and stable id', () => {
    const deck = buildDeck(DEFAULT_DECK_CONFIG);
    const aceOfSpades = deck.find(card => card.id === 'spades-A');

    expect(aceOfSpades).toEqual({ id: 'spades-A', suit: 'spades', value: 'A', faceUp: false });
  });

  it('supports overriding the suits', () => {
    const deck = buildDeck({ suits: ['spades'] });

    expect(deck).toHaveLength(13);
    expect(deck.every(card => card.suit === 'spades')).toBe(true);
  });

  it('supports overriding the values', () => {
    const deck = buildDeck({ values: ['A', 'K'] });

    expect(deck).toHaveLength(8);
    expect(new Set(deck.map(card => card.value))).toEqual(new Set(['A', 'K']));
  });

  it('supports multiple decks with unique card ids', () => {
    const deck = buildDeck({ decks: 2 });

    expect(deck).toHaveLength(104);
    const ids = new Set(deck.map(card => card.id));
    expect(ids.size).toBe(104);
  });
});
