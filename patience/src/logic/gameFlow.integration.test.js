// Integration tests that exercise rules, actions, and helpers together,
// simulating realistic sequences of play with stacked (non-random) decks.
import { describe, it, expect } from 'vitest';
import { shuffleArray } from '../utils/helpers';
import { isValidMove, isValidFoundationMove, hasValidMoves, isGameWon } from './rules';
import {
  drawFromStock,
  moveWasteToTableau,
  moveWasteToFoundation,
  moveTableauToFoundation,
  moveTableauToTableau,
  autoMoveToFoundation,
} from './actions';

const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'];
const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

const card = (suit, value, faceUp = true) => ({ suit, value, faceUp });

const buildDeck = () =>
  SUITS.flatMap(suit => VALUES.map(value => card(suit, value, false)));

// Deal a standard Klondike board the same way the game does:
// 7 columns of 1..7 cards, top card face up, rest of the deck to the stock.
const deal = (deck) => {
  const remaining = [...deck];
  const tableau = [[], [], [], [], [], [], []];
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j <= i; j++) {
      tableau[i].push({ ...remaining.pop(), faceUp: j === i });
    }
  }
  return { tableau, stock: remaining };
};

describe('dealing a new game', () => {
  it('produces a legal Klondike board from a shuffled 52-card deck', () => {
    const { tableau, stock } = deal(shuffleArray(buildDeck()));

    expect(tableau.map(column => column.length)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(stock).toHaveLength(24);
    expect(stock.every(c => !c.faceUp)).toBe(true);

    for (const column of tableau) {
      expect(column[column.length - 1].faceUp).toBe(true);
      expect(column.slice(0, -1).every(c => !c.faceUp)).toBe(true);
    }

    // Every one of the 52 cards is dealt exactly once
    const all = [...stock, ...tableau.flat()];
    const ids = new Set(all.map(c => `${c.suit}-${c.value}`));
    expect(ids.size).toBe(52);
  });
});

describe('stock and waste cycle', () => {
  it('draws the entire stock into the waste and recycles it back', () => {
    let { stock } = deal(buildDeck());
    let waste = [];

    while (stock.length > 0) {
      ({ stock, waste } = drawFromStock(stock, waste));
    }
    expect(waste).toHaveLength(24);
    expect(waste.every(c => c.faceUp)).toBe(true);

    // Drawing on an empty stock recycles the waste, face down again
    ({ stock, waste } = drawFromStock(stock, waste));
    expect(stock).toHaveLength(24);
    expect(stock.every(c => !c.faceUp)).toBe(true);
    expect(waste).toHaveLength(0);
  });
});

describe('playing cards across piles', () => {
  it('moves a waste card onto the tableau and then up to a foundation', () => {
    let waste = [card('hearts', '6')];
    let tableau = [[card('spades', '7')], [], [], [], [], [], []];
    let foundations = [VALUES.slice(0, 5).map(v => card('hearts', v)), [], [], []];

    // Red 6 is playable on the black 7
    expect(isValidMove(waste[0], tableau[0][0], false)).toBe(true);
    ({ waste, tableau } = moveWasteToTableau(waste, tableau, 0));
    expect(tableau[0].map(c => c.value)).toEqual(['7', '6']);

    // The 6 of hearts is now playable on the hearts foundation (A-5)
    const top = tableau[0][tableau[0].length - 1];
    expect(isValidFoundationMove(top, foundations[0])).toBe(true);
    ({ tableau, foundations } = moveTableauToFoundation(tableau, foundations, 0, 1, 0));
    expect(foundations[0].map(c => c.value)).toEqual(['A', '2', '3', '4', '5', '6']);
    expect(tableau[0].map(c => c.value)).toEqual(['7']);
  });

  it('relocates a buried stack and flips the card underneath', () => {
    let tableau = [
      [card('diamonds', '2', false), card('spades', '8'), card('hearts', '7')],
      [card('hearts', '9')],
      [], [], [], [], [],
    ];

    // The 8-7 run can move onto the red 9
    expect(isValidMove(tableau[0][1], tableau[1][0], false)).toBe(true);
    ({ tableau } = moveTableauToTableau(tableau, 0, 1, 1));

    expect(tableau[1].map(c => c.value)).toEqual(['9', '8', '7']);
    expect(tableau[0]).toHaveLength(1);
    expect(tableau[0][0]).toEqual(card('diamonds', '2', true));
  });

  it('auto-moves a cascade from waste and tableau, flipping as it goes', () => {
    const waste = [card('hearts', 'A')];
    const tableau = [
      [card('hearts', '3', false), card('hearts', '2')],
      [], [], [], [], [], [],
    ];

    const result = autoMoveToFoundation(tableau, [[], [], [], []], waste);

    expect(result.moved).toBe(true);
    expect(result.waste).toHaveLength(0);
    expect(result.tableau[0]).toHaveLength(0);
    expect(result.foundations[0].map(c => c.value)).toEqual(['A', '2', '3']);
  });
});

describe('endgame', () => {
  it('plays out a stacked endgame to a win', () => {
    // All four foundations at A-Q; the four Kings are spread across
    // the tableau (one buried face down), the waste, and the stock.
    let foundations = SUITS.map(suit => VALUES.slice(0, 12).map(v => card(suit, v)));
    let tableau = [[card('spades', 'K', false), card('hearts', 'K')], [], [], [], [], [], []];
    let waste = [card('diamonds', 'K')];
    let stock = [card('clubs', 'K', false)];

    expect(isGameWon(foundations)).toBe(false);

    ({ waste, foundations } = moveWasteToFoundation(waste, foundations, 1));

    // Moving the K of hearts exposes and flips the buried K of spades
    ({ tableau, foundations } = moveTableauToFoundation(tableau, foundations, 0, 1, 0));
    expect(tableau[0][0]).toEqual(card('spades', 'K', true));

    ({ stock, waste } = drawFromStock(stock, waste));
    ({ waste, foundations } = moveWasteToFoundation(waste, foundations, 2));
    ({ tableau, foundations } = moveTableauToFoundation(tableau, foundations, 0, 0, 3));

    expect(isGameWon(foundations)).toBe(true);
    expect(foundations.every(f => f[12].value === 'K')).toBe(true);
  });

  it('detects a dead end once the last stock card is drawn', () => {
    const tableau = [[card('hearts', 'Q')], [card('hearts', 'J')], [], [], [], [], []];
    const foundations = [[], [], [], []];
    let stock = [card('diamonds', '4', false)];
    let waste = [];

    // A card is still in the stock, so the game is not over yet
    expect(hasValidMoves(tableau, foundations, waste, stock)).toBe(true);

    // The drawn 4 of diamonds fits nowhere, and the two red court
    // cards cannot stack on each other
    ({ stock, waste } = drawFromStock(stock, waste));
    expect(hasValidMoves(tableau, foundations, waste, stock)).toBe(false);
  });
});
