import { describe, it, expect } from 'vitest';
import {
  createSnapshot,
  createInitialHistory,
  pushHistory,
  undoHistory,
  redoHistory,
  canUndo,
  canRedo
} from './history';

// Minimal distinguishable game states; moves doubles as a state label
const makeState = (moves) =>
  createSnapshot([], [], [[], [], [], []], [[], [], [], [], [], [], []], moves, 0, 0);

describe('createSnapshot', () => {
  it('captures the full game state', () => {
    const snapshot = createSnapshot(['s'], ['w'], [['f'], [], [], []], [['t'], [], [], [], [], [], []], 5, 120, 45);

    expect(snapshot).toEqual({
      stock: ['s'],
      waste: ['w'],
      foundations: [['f'], [], [], []],
      tableau: [['t'], [], [], [], [], [], []],
      moves: 5,
      score: 120,
      time: 45
    });
  });
});

describe('history', () => {
  it('starts with undo and redo unavailable', () => {
    const initial = makeState(0);
    const { history, historyIndex } = createInitialHistory(initial);

    expect(canUndo(history, historyIndex)).toBe(false);
    expect(canRedo(history, historyIndex)).toBe(false);
    expect(undoHistory(history, historyIndex, initial)).toBeNull();
    expect(redoHistory(history, historyIndex, initial)).toBeNull();
  });

  it('makes undo available after a move is recorded', () => {
    const initial = makeState(0);
    let { history, historyIndex } = createInitialHistory(initial);

    ({ history, historyIndex } = pushHistory(history, historyIndex, initial));

    expect(canUndo(history, historyIndex)).toBe(true);
  });

  it('undo restores the previous state', () => {
    const initial = makeState(0);
    let { history, historyIndex } = createInitialHistory(initial);

    // Record the pre-move state, then the move applies
    ({ history, historyIndex } = pushHistory(history, historyIndex, initial));
    const afterMove = makeState(1);

    const result = undoHistory(history, historyIndex, afterMove);

    expect(result).not.toBeNull();
    expect(result.state).toEqual(initial);
    expect(canUndo(result.history, result.historyIndex)).toBe(false);
  });

  it('keeps redo unavailable at the newest state', () => {
    const initial = makeState(0);
    let { history, historyIndex } = createInitialHistory(initial);

    ({ history, historyIndex } = pushHistory(history, historyIndex, initial));
    const afterMove = makeState(1);

    expect(canRedo(history, historyIndex)).toBe(false);
    expect(redoHistory(history, historyIndex, afterMove)).toBeNull();
  });

  it('makes redo available after an undo', () => {
    const initial = makeState(0);
    let { history, historyIndex } = createInitialHistory(initial);

    ({ history, historyIndex } = pushHistory(history, historyIndex, initial));
    const afterMove = makeState(1);

    const undone = undoHistory(history, historyIndex, afterMove);

    expect(canRedo(undone.history, undone.historyIndex)).toBe(true);
    expect(redoHistory(undone.history, undone.historyIndex, undone.state)).not.toBeNull();
  });
});
