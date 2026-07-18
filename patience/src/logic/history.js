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

// Record a state in the history, discarding any redoable future states
export const pushHistory = (history, historyIndex, state) => {
  // If we're not at the end of the history, truncate it
  const newHistory = history.slice(0, historyIndex + 1);

  // Add the new state to history
  newHistory.push(state);

  return {
    history: newHistory,
    historyIndex: newHistory.length - 1
  };
};

// Step back to the previous state; returns null when undo is not available
export const undoHistory = (history, historyIndex) => {
  if (historyIndex > 0) {
    return {
      history,
      historyIndex: historyIndex - 1,
      state: history[historyIndex - 1]
    };
  }
  return null;
};

// Step forward to the next state; returns null when redo is not available
export const redoHistory = (history, historyIndex) => {
  if (historyIndex < history.length - 1) {
    return {
      history,
      historyIndex: historyIndex + 1,
      state: history[historyIndex + 1]
    };
  }
  return null;
};

// Whether an undo is currently available
export const canUndo = (history, historyIndex) => historyIndex > 0;

// Whether a redo is currently available
export const canRedo = (history, historyIndex) => historyIndex < history.length - 1;
