import { describe, it, expect } from 'vitest';
import {
  cascadeToCell,
  cellToCascade,
  cascadeToCascade,
  cascadeToFoundation,
  cellToFoundation
} from './moves';
import { freecell } from './index';
import { dealGame } from '../../core/deal';

const card = (suit, value) => ({ suit, value, faceUp: true });

const cascadesWith = (columns) => {
  const cascades = [[], [], [], [], [], [], [], []];
  columns.forEach((column, i) => { cascades[i] = column; });
  return cascades;
};

const emptyCells = () => [null, null, null, null];
const emptyFoundations = () => [[], [], [], []];

describe('dealing', () => {
  it('deals a legal FreeCell board', () => {
    const { cascades, cells, foundations } = dealGame(freecell, 42);

    expect(cascades.map(c => c.length)).toEqual([7, 7, 7, 7, 6, 6, 6, 6]);
    expect(cascades.flat().every(c => c.faceUp)).toBe(true);
    expect(new Set(cascades.flat().map(c => c.id)).size).toBe(52);
    expect(cells).toEqual([null, null, null, null]);
    expect(foundations).toEqual([[], [], [], []]);
  });

  it('deals the same board for the same seed', () => {
    expect(dealGame(freecell, 7)).toEqual(dealGame(freecell, 7));
  });
});

describe('cascadeToCell', () => {
  it('moves the top card into an empty cell', () => {
    const cascades = cascadesWith([[card('hearts', '7'), card('spades', '3')]]);
    const result = cascadeToCell(cascades, emptyCells(), 0, 2);

    expect(result.cells[2]).toEqual(card('spades', '3'));
    expect(result.cascades[0]).toEqual([card('hearts', '7')]);
  });

  it('returns null for an occupied cell or empty cascade', () => {
    const cascades = cascadesWith([[card('hearts', '7')]]);
    const cells = [null, card('clubs', '2'), null, null];

    expect(cascadeToCell(cascades, cells, 0, 1)).toBeNull();
    expect(cascadeToCell(cascadesWith([[]]), emptyCells(), 0, 0)).toBeNull();
  });

  it('does not modify its inputs', () => {
    const cascades = cascadesWith([[card('hearts', '7'), card('spades', '3')]]);
    const cells = emptyCells();
    cascadeToCell(cascades, cells, 0, 0);

    expect(cascades[0]).toHaveLength(2);
    expect(cells[0]).toBeNull();
  });
});

describe('cellToCascade', () => {
  it('moves a cell card onto a legal cascade target', () => {
    const cells = [card('hearts', '6'), null, null, null];
    const cascades = cascadesWith([[card('spades', '7')]]);

    const result = cellToCascade(cells, cascades, 0, 0);

    expect(result.cells[0]).toBeNull();
    expect(result.cascades[0].map(c => c.value)).toEqual(['7', '6']);
  });

  it('moves a cell card onto an empty cascade', () => {
    const cells = [card('hearts', '6'), null, null, null];
    const result = cellToCascade(cells, cascadesWith([[]]), 0, 0);

    expect(result.cascades[0]).toEqual([card('hearts', '6')]);
  });

  it('returns null for an illegal target or empty cell', () => {
    const cells = [card('hearts', '6'), null, null, null];
    expect(cellToCascade(cells, cascadesWith([[card('diamonds', '7')]]), 0, 0)).toBeNull();
    expect(cellToCascade(emptyCells(), cascadesWith([[]]), 0, 0)).toBeNull();
  });
});

describe('cascadeToCascade', () => {
  it('moves the top card between cascades when legal', () => {
    const cascades = cascadesWith([[card('hearts', '6')], [card('spades', '7')]]);
    const result = cascadeToCascade(cascades, 0, 1);

    expect(result.cascades[0]).toHaveLength(0);
    expect(result.cascades[1].map(c => c.value)).toEqual(['7', '6']);
  });

  it('returns null for illegal targets and self-moves', () => {
    const cascades = cascadesWith([[card('hearts', '6')], [card('diamonds', '7')]]);
    expect(cascadeToCascade(cascades, 0, 1)).toBeNull();
    expect(cascadeToCascade(cascades, 0, 0)).toBeNull();
  });
});

describe('foundation moves', () => {
  it('moves an Ace from a cascade to an empty foundation', () => {
    const cascades = cascadesWith([[card('hearts', '7'), card('clubs', 'A')]]);
    const result = cascadeToFoundation(cascades, emptyFoundations(), 0, 0);

    expect(result.foundations[0]).toEqual([card('clubs', 'A')]);
    expect(result.cascades[0]).toEqual([card('hearts', '7')]);
  });

  it('moves a cell card to its foundation in sequence', () => {
    const cells = [card('hearts', '2'), null, null, null];
    const foundations = [[card('hearts', 'A')], [], [], []];

    const result = cellToFoundation(cells, foundations, 0, 0);

    expect(result.foundations[0].map(c => c.value)).toEqual(['A', '2']);
    expect(result.cells[0]).toBeNull();
  });

  it('returns null for out-of-sequence foundation moves', () => {
    const cascades = cascadesWith([[card('hearts', '3')]]);
    const foundations = [[card('hearts', 'A')], [], [], []];
    expect(cascadeToFoundation(cascades, foundations, 0, 0)).toBeNull();
  });
});
