// Integration tests driving a FreeCell game through several moves.
import { describe, it, expect } from 'vitest';
import { dealGame } from '../../core/deal';
import { freecell } from './index';
import { cascadeToCell, cellToCascade, cascadeToCascade } from './moves';
import { isWon } from './rules';

const card = (suit, value) => ({ suit, value, faceUp: true });

describe('freecell play', () => {
  it('plays a sequence of moves across cells and cascades', () => {
    let cascades = [[], [], [], [], [], [], [], []];
    cascades[0] = [card('spades', '8'), card('hearts', '7')];
    cascades[1] = [card('clubs', '6')];
    let cells = [null, null, null, null];

    // Park the 7 of hearts in a cell to expose the 8 of spades
    let result = cascadeToCell(cascades, cells, 0, 0);
    cascades = result.cascades;
    cells = result.cells;
    expect(cells[0]).toEqual(card('hearts', '7'));

    // Bring the 7 back onto the black 8
    result = cellToCascade(cells, cascades, 0, 0);
    cascades = result.cascades;
    cells = result.cells;
    expect(cascades[0].map(c => c.value)).toEqual(['8', '7']);
    expect(cells[0]).toBeNull();

    // Stack the black 6 on the red 7
    result = cascadeToCascade(cascades, 1, 0);
    expect(result.cascades[0].map(c => c.value)).toEqual(['8', '7', '6']);
    expect(result.cascades[1]).toHaveLength(0);
  });

  it('never wins straight off the deal', () => {
    const { foundations } = dealGame(freecell, 3);
    expect(isWon(foundations)).toBe(false);
  });

  it('deals boards that use every card exactly once', () => {
    const { cascades } = dealGame(freecell, 99);
    const ids = cascades.flat().map(c => c.id);
    expect(new Set(ids).size).toBe(52);
    expect(ids).toHaveLength(52);
  });
});
