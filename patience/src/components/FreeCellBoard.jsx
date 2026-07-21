import React, { useState, useEffect } from 'react';
import Card from './Card';
import { dealGame } from '../core/deal';
import {
  createInitialHistory,
  pushHistory,
  undoHistory,
  redoHistory,
  canUndo,
  canRedo
} from '../core/history';
import '../games';
import { getGame } from '../games/registry';
import {
  cascadeToCell,
  cellToCascade,
  cascadeToCascade,
  cascadeToFoundation,
  cellToFoundation
} from '../games/freecell/moves';
import { canMoveToFoundation, isWon } from '../games/freecell/rules';
import '../styles/FreeCellBoard.css';

const game = getGame('freecell');

const FreeCellBoard = () => {
  const [cascades, setCascades] = useState([[], [], [], [], [], [], [], []]);
  const [cells, setCells] = useState([null, null, null, null]);
  const [foundations, setFoundations] = useState([[], [], [], []]);
  const [moves, setMoves] = useState(0);
  const [selected, setSelected] = useState(null);
  const [gameWon, setGameWon] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const snapshot = () => ({ cascades, cells, foundations, moves });

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const dealt = dealGame(game);

    setCascades(dealt.cascades);
    setCells(dealt.cells);
    setFoundations(dealt.foundations);
    setMoves(0);
    setSelected(null);
    setGameWon(false);

    const initial = { cascades: dealt.cascades, cells: dealt.cells, foundations: dealt.foundations, moves: 0 };
    const { history: initialHistory, historyIndex: initialHistoryIndex } = createInitialHistory(initial);
    setHistory(initialHistory);
    setHistoryIndex(initialHistoryIndex);
  };

  const applyMove = (result) => {
    const { history: newHistory, historyIndex: newHistoryIndex } = pushHistory(history, historyIndex, snapshot());
    setHistory(newHistory);
    setHistoryIndex(newHistoryIndex);

    const newCascades = result.cascades ?? cascades;
    const newCells = result.cells ?? cells;
    const newFoundations = result.foundations ?? foundations;

    setCascades(newCascades);
    setCells(newCells);
    setFoundations(newFoundations);
    setMoves(moves + 1);
    setSelected(null);

    if (isWon(newFoundations)) {
      setGameWon(true);
    }
  };

  // Try to send a card straight to a foundation; returns true if it moved
  const tryAutoFoundation = (zone, index) => {
    const card = zone === 'cascade'
      ? cascades[index][cascades[index].length - 1]
      : cells[index];
    if (!card) return false;

    for (let f = 0; f < 4; f++) {
      if (canMoveToFoundation(card, foundations[f])) {
        const result = zone === 'cascade'
          ? cascadeToFoundation(cascades, foundations, index, f)
          : cellToFoundation(cells, foundations, index, f);
        if (result) {
          applyMove(result);
          return true;
        }
      }
    }
    return false;
  };

  const handleCardClick = (zone, index) => {
    if (gameWon) return;

    // A second click on the selection deselects it
    if (selected && selected.zone === zone && selected.index === index) {
      setSelected(null);
      return;
    }

    if (selected) {
      // Attempt to move the selection to the clicked pile
      const result = selected.zone === 'cascade'
        ? (zone === 'cascade'
            ? cascadeToCascade(cascades, selected.index, index)
            : cascadeToCell(cascades, cells, selected.index, index))
        : (zone === 'cascade'
            ? cellToCascade(cells, cascades, selected.index, index)
            : null);

      if (result) {
        applyMove(result);
      } else {
        setSelected(null);
      }
      return;
    }

    // No selection: try the foundation first, otherwise select
    if (!tryAutoFoundation(zone, index)) {
      const hasCard = zone === 'cascade' ? cascades[index].length > 0 : cells[index] !== null;
      if (hasCard) {
        setSelected({ zone, index });
      }
    }
  };

  const handleFoundationClick = (foundationIndex) => {
    if (!selected || gameWon) return;

    const result = selected.zone === 'cascade'
      ? cascadeToFoundation(cascades, foundations, selected.index, foundationIndex)
      : cellToFoundation(cells, foundations, selected.index, foundationIndex);

    if (result) {
      applyMove(result);
    } else {
      setSelected(null);
    }
  };

  const handleUndo = () => {
    const result = undoHistory(history, historyIndex, snapshot());
    if (result) {
      setCascades(result.state.cascades);
      setCells(result.state.cells);
      setFoundations(result.state.foundations);
      setMoves(result.state.moves);
      setHistory(result.history);
      setHistoryIndex(result.historyIndex);
      setSelected(null);
      setGameWon(false);
    }
  };

  const handleRedo = () => {
    const result = redoHistory(history, historyIndex, snapshot());
    if (result) {
      setCascades(result.state.cascades);
      setCells(result.state.cells);
      setFoundations(result.state.foundations);
      setMoves(result.state.moves);
      setHistory(result.history);
      setHistoryIndex(result.historyIndex);
      setSelected(null);
      if (isWon(result.state.foundations)) {
        setGameWon(true);
      }
    }
  };

  const isSelected = (zone, index) => selected && selected.zone === zone && selected.index === index;

  return (
    <div className="freecell-board">
      <div className="freecell-controls">
        <span className="freecell-moves">Moves: {moves}</span>
        <button onClick={handleUndo} disabled={!canUndo(history, historyIndex)}>Undo</button>
        <button onClick={handleRedo} disabled={!canRedo(history, historyIndex)}>Redo</button>
        <button onClick={initializeGame}>New Game</button>
      </div>

      {gameWon && <div className="freecell-won">You won! 🎉</div>}

      <div className="freecell-top">
        <div className="freecell-cells">
          {cells.map((card, i) => (
            <div
              key={`cell-${i}`}
              className={`freecell-cell ${isSelected('cell', i) ? 'selected' : ''}`}
              onClick={() => handleCardClick('cell', i)}
            >
              {card && <Card suit={card.suit} value={card.value} faceUp />}
            </div>
          ))}
        </div>
        <div className="freecell-foundations">
          {foundations.map((pile, i) => (
            <div
              key={`foundation-${i}`}
              className="freecell-foundation"
              onClick={() => handleFoundationClick(i)}
            >
              {pile.length > 0 && (
                <Card suit={pile[pile.length - 1].suit} value={pile[pile.length - 1].value} faceUp />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="freecell-cascades">
        {cascades.map((cascade, i) => (
          <div
            key={`cascade-${i}`}
            className={`freecell-cascade ${isSelected('cascade', i) ? 'selected' : ''}`}
            onClick={() => handleCardClick('cascade', i)}
          >
            {cascade.map((card, j) => (
              <div key={card.id} className="freecell-cascade-card" style={{ zIndex: j }}>
                <Card suit={card.suit} value={card.value} faceUp />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FreeCellBoard;
