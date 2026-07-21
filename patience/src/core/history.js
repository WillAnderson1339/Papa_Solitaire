// Utilities for managing the game's move history (undo/redo).

// Build a snapshot of the complete game state
export const createSnapshot = (stock, waste, foundations, tableau, moves, score, time) => ({
  stock,
  waste,
  foundations,
  tableau,
  moves,
  score,
  time
});

// Create a fresh history containing the initial game state
export const createInitialHistory = (initialState) => ({
  history: [initialState],
  historyIndex: 0
});

// Callers record the state that was live *before* a move happens, so the
// entry at historyIndex may still be a stale placeholder until the real
// value is known. Correct that slot with the state the caller reports as
// current, without mutating the array we were given.
const syncCurrent = (history, historyIndex, currentState) => {
  const newHistory = history.slice();
  newHistory[historyIndex] = currentState;
  return newHistory;
};

// Record a state in the history, discarding any redoable future states
export const pushHistory = (history, historyIndex, state) => {
  // Make sure the current slot reflects the real current state before we
  // branch off of it
  const synced = syncCurrent(history, historyIndex, state);

  // If we're not at the end of the history, truncate it
  const newHistory = synced.slice(0, historyIndex + 1);

  // Reserve a slot for the state that is about to become current; it is
  // filled in by whichever call next reports the true current state
  newHistory.push(state);

  return {
    history: newHistory,
    historyIndex: newHistory.length - 1
  };
};

// Step back to the previous state; returns null when undo is not available
export const undoHistory = (history, historyIndex, currentState) => {
  if (historyIndex <= 0) {
    return null;
  }

  const synced = syncCurrent(history, historyIndex, currentState);

  return {
    history: synced,
    historyIndex: historyIndex - 1,
    state: synced[historyIndex - 1]
  };
};

// Step forward to the next state; returns null when redo is not available
export const redoHistory = (history, historyIndex, currentState) => {
  if (historyIndex >= history.length - 1) {
    return null;
  }

  const synced = syncCurrent(history, historyIndex, currentState);

  return {
    history: synced,
    historyIndex: historyIndex + 1,
    state: synced[historyIndex + 1]
  };
};

// Whether an undo is currently available
export const canUndo = (history, historyIndex) => historyIndex > 0;

// Whether a redo is currently available
export const canRedo = (history, historyIndex) => historyIndex < history.length - 1;
