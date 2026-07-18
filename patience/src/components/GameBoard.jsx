import React, { useState, useEffect, useRef, useCallback } from 'react';
import Card from './Card';
import GameStats from './GameStats';
import GameControls from './GameControls';
import Settings from './Settings';
import { isValidMove, isValidFoundationMove, isGameWon, hasValidMoves } from '../logic/rules';
import { autoComplete } from '../logic/autoComplete';
import {
  createSnapshot,
  createInitialHistory,
  pushHistory,
  undoHistory,
  redoHistory,
  canUndo,
  canRedo
} from '../logic/history';
import { calculateScore } from '../utils/helpers';
import '../styles/GameBoard.css';

const GameBoard = () => {
  // Game state
  const [stock, setStock] = useState([]);
  const [waste, setWaste] = useState([]);
  const [foundations, setFoundations] = useState([[], [], [], []]);
  const [tableau, setTableau] = useState([[], [], [], [], [], [], []]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [draggedCards, setDraggedCards] = useState(null);
  const [moves, setMoves] = useState(0);
  const [missedMoves, setMissedMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [gameLost, setGameLost] = useState(false);
  const [gamePaused, setGamePaused] = useState(false);
  const [lastMoveTime, setLastMoveTime] = useState(0);
  const [stockEmptyTime, setStockEmptyTime] = useState(null);
  const [movesAfterStockEmpty, setMovesAfterStockEmpty] = useState(0);
  const [gameOverReason, setGameOverReason] = useState('');

  // History for undo/redo
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Settings
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [theme, setTheme] = useState({
    id: 'classic',
    name: 'Classic Green',
    tableColor: '#2a7e43',
    cardBack: 'blue'
  });
  const [difficulty, setDifficulty] = useState({
    id: 'easy',
    name: 'Easy',
    drawCount: 1,
    description: 'Draw 1 card at a time, unlimited redeals'
  });
  const [favouriteColour, setFavouriteColour] = useState('Blue');
  const [redealCount, setRedealCount] = useState(0);

  // Refs
  const boardRef = useRef(null);
  const timerRef = useRef(null);
  const gameStateRef = useRef({
    stock,
    waste,
    foundations,
    tableau,
    moves,
    score,
    time
  });

  // Update ref when game state changes
  useEffect(() => {
    gameStateRef.current = {
      stock,
      waste,
      foundations,
      tableau,
      moves,
      score,
      time
    };
  }, [stock, waste, foundations, tableau, moves, score, time]);

  // Initialize the game
  useEffect(() => {
    initializeGame();

    // Clean up timer on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Start/stop timer based on game state
  useEffect(() => {
    if (gameStarted && !gameWon && !gamePaused) {
      timerRef.current = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameStarted, gameWon, gamePaused]);

  // Check for win condition
  useEffect(() => {
    if (gameStarted) {
      checkWinCondition();
    }
  }, [foundations, gameStarted]);

  // Update score when moves or time changes
  useEffect(() => {
    if (gameStarted) {
      setScore(calculateScore(moves, time, gameWon));
    }
  }, [moves, time, gameWon, gameStarted]);

  // Check for game over after each move
  useEffect(() => {
    if (gameStarted && !gameWon && !gameLost && moves > 0) {
      // Only check for game over if it's been more than 1 second since the last move
      // This prevents checking too frequently and slowing down the game
      const currentTime = Date.now();
      if (currentTime - lastMoveTime > 1000) {
        checkGameOver();
        setLastMoveTime(currentTime);
      }
    }
  }, [stock, waste, foundations, tableau, moves, gameStarted, gameWon, gameLost, lastMoveTime]);

  // Save game state to history when a move is made
  const saveToHistory = useCallback((state) => {
    const { history: newHistory, historyIndex: newHistoryIndex } = pushHistory(history, historyIndex, state);

    // Update history and historyIndex
    setHistory(newHistory);
    setHistoryIndex(newHistoryIndex);
  }, [history, historyIndex]);

  // Snapshot of the current game state
  const snapshot = () => createSnapshot(stock, waste, foundations, tableau, moves, score, time);

  // Initialize the game
  const initializeGame = () => {
    // Reset game state
    setGameWon(false);
    setGameLost(false);
    setGamePaused(false);
    setMoves(0);
    setMissedMoves(0);
    setScore(0);
    setTime(0);
    setRedealCount(0);
    setHistory([]);
    setHistoryIndex(-1);
    setLastMoveTime(Date.now());
    setStockEmptyTime(null);
    setMovesAfterStockEmpty(0);
    setGameOverReason('');

    // Create and shuffle a new deck
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

    const newDeck = [];
    suits.forEach(suit => {
      values.forEach(value => {
        newDeck.push({
          id: `${suit}-${value}`,
          suit,
          value,
          faceUp: false
        });
      });
    });

    // Shuffle the deck
    const shuffledDeck = shuffleArray([...newDeck]);

    // Deal cards to tableau
    const newTableau = Array(7).fill().map(() => []);
    let remainingDeck = [...shuffledDeck];

    for (let i = 0; i < 7; i++) {
      for (let j = 0; j <= i; j++) {
        const card = { ...remainingDeck.pop(), faceUp: j === i };
        newTableau[i].push(card);
      }
    }

    // Set up the game state
    setStock(remainingDeck);
    setWaste([]);
    setFoundations([[], [], [], []]);
    setTableau(newTableau);

    // Save initial state to history
    const initialState = createSnapshot(remainingDeck, [], [[], [], [], []], newTableau, 0, 0, 0);
    const { history: initialHistory, historyIndex: initialHistoryIndex } = createInitialHistory(initialState);

    setHistory(initialHistory);
    setHistoryIndex(initialHistoryIndex);

    // Start the game
    setGameStarted(true);
  };

  // Shuffle array (Fisher-Yates algorithm)
  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  // Draw cards from stock to waste
  const drawFromStock = () => {
    if (stock.length === 0) {
      // If stock is empty, recycle waste pile
      if (waste.length === 0) return;

      // Check if we've reached the redeal limit for hard difficulty
      if (difficulty.id === 'hard' && redealCount >= 3) {
        return;
      }

      const recycledStock = waste.map(card => ({ ...card, faceUp: false })).reverse();

      // Save current state to history
      saveToHistory(snapshot());

      setStock(recycledStock);
      setWaste([]);
      setRedealCount(prevCount => prevCount + 1);
      incrementMoves();
      return;
    }

    // Draw cards based on difficulty
    const drawCount = Math.min(difficulty.drawCount, stock.length);
    const drawnCards = [];
    const newStock = [...stock];

    for (let i = 0; i < drawCount; i++) {
      const card = { ...newStock.pop(), faceUp: true };
      drawnCards.push(card);
    }

    // Save current state to history
    saveToHistory(snapshot());

    // Check if stock will be empty after this move
    if (newStock.length === 0 && stockEmptyTime === null) {
      setStockEmptyTime(Date.now());
    }

    setStock(newStock);
    setWaste([...waste, ...drawnCards]);
    incrementMoves();
  };

  // Handle card click
  const handleCardClick = (card, source, index, stackIndex) => {
    // If card is in stock, draw from stock
    if (source === 'stock') {
      drawFromStock();
      return;
    }

    // If card is face down in tableau, flip it
    if (source === 'tableau' && !card.faceUp) {
      // Save current state to history
      saveToHistory(snapshot());

      const newTableau = [...tableau];
      newTableau[stackIndex][index] = { ...card, faceUp: true };
      setTableau(newTableau);
      incrementMoves();
      return;
    }

    // Try to move to foundation automatically
    if (card.faceUp) {
      // Check if card can be moved to foundation
      for (let i = 0; i < 4; i++) {
        if (isValidFoundationMove(card, foundations[i])) {
          moveCardToFoundation(card, source, index, stackIndex, i);
          return;
        }
      }
    }

    // Select/deselect card
    if (selectedCard && selectedCard.card.id === card.id) {
      setSelectedCard(null);
    } else {
      setSelectedCard({ card, source, index, stackIndex });
    }
  };

  // Handle drag start
  const handleDragStart = (e, card, source, index, stackIndex) => {
    // Set data for drag operation
    e.dataTransfer.setData('text/plain', JSON.stringify({
      card,
      source,
      index,
      stackIndex
    }));

    // Set dragged cards
    if (source === 'tableau') {
      // If dragging from tableau, include all cards below
      const stack = tableau[stackIndex];
      const draggedStack = stack.slice(index);
      setDraggedCards({ cards: draggedStack, source, stackIndex, startIndex: index });
    } else {
      setDraggedCards({ cards: [card], source, stackIndex, startIndex: index });
    }
  };

  // Handle drag over
  const handleDragOver = (e, target, targetIndex) => {
    e.preventDefault();

    if (!draggedCards) return;

    // Check if move is valid
    const { cards } = draggedCards;
    const card = cards[0];

    if (target === 'foundation') {
      // Only single cards can be moved to foundation
      if (cards.length === 1 && isValidFoundationMove(card, foundations[targetIndex])) {
        e.dataTransfer.dropEffect = 'move';
      } else {
        e.dataTransfer.dropEffect = 'none';
      }
    } else if (target === 'tableau') {
      const targetStack = tableau[targetIndex];
      if (isValidMove(cards[0], targetStack[targetStack.length - 1], targetStack.length === 0)) {
        e.dataTransfer.dropEffect = 'move';
      } else {
        e.dataTransfer.dropEffect = 'none';
      }
    }
  };

  // Handle drop
  const handleDrop = (e, target, targetIndex) => {
    e.preventDefault();

    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
    const { card, source, index, stackIndex } = data;

    if (target === 'foundation') {
      // Move to foundation
      if (isValidFoundationMove(card, foundations[targetIndex])) {
        moveCardToFoundation(card, source, index, stackIndex, targetIndex);
      }
    } else if (target === 'tableau') {
      // Move to tableau
      moveCardToTableau(card, source, index, stackIndex, targetIndex);
    }

    setDraggedCards(null);
  };

  // Move card to foundation
  const moveCardToFoundation = (card, source, index, stackIndex, foundationIndex) => {
    // Save current state to history
    saveToHistory(snapshot());

    // Create new state
    const newFoundations = [...foundations];
    let newTableau = [...tableau];
    let newWaste = [...waste];

    // Add card to foundation
    newFoundations[foundationIndex] = [...newFoundations[foundationIndex], card];

    // Remove card from source
    if (source === 'tableau') {
      newTableau[stackIndex] = newTableau[stackIndex].slice(0, index);

      // Flip the new top card if needed
      if (newTableau[stackIndex].length > 0 && !newTableau[stackIndex][newTableau[stackIndex].length - 1].faceUp) {
        newTableau[stackIndex][newTableau[stackIndex].length - 1] = {
          ...newTableau[stackIndex][newTableau[stackIndex].length - 1],
          faceUp: true
        };
      }
    } else if (source === 'waste') {
      newWaste = newWaste.slice(0, -1);
    }

    // Update state
    setFoundations(newFoundations);
    setTableau(newTableau);
    setWaste(newWaste);
    setSelectedCard(null);
    incrementMoves();
  };

  // Move card to tableau
  const moveCardToTableau = (card, source, index, sourceStackIndex, targetStackIndex) => {
    // Check if move is valid
    const targetStack = tableau[targetStackIndex];
    if (!isValidMove(card, targetStack[targetStack.length - 1], targetStack.length === 0)) {
      return;
    }

    // Save current state to history
    saveToHistory(snapshot());

    // Get cards to move
    let cardsToMove = [];
    let newTableau = [...tableau];
    let newWaste = [...waste];
    let newFoundations = [...foundations];

    if (source === 'tableau') {
      // If moving from tableau, include all cards below
      cardsToMove = tableau[sourceStackIndex].slice(index);
      newTableau[sourceStackIndex] = tableau[sourceStackIndex].slice(0, index);

      // Flip the new top card if needed
      if (newTableau[sourceStackIndex].length > 0 && !newTableau[sourceStackIndex][newTableau[sourceStackIndex].length - 1].faceUp) {
        newTableau[sourceStackIndex][newTableau[sourceStackIndex].length - 1] = {
          ...newTableau[sourceStackIndex][newTableau[sourceStackIndex].length - 1],
          faceUp: true
        };
      }
    } else if (source === 'waste') {
      cardsToMove = [card];
      newWaste = waste.slice(0, -1);
    } else if (source === 'foundation') {
      cardsToMove = [card];
      newFoundations[sourceStackIndex] = foundations[sourceStackIndex].slice(0, -1);
    }

    // Add cards to target tableau
    newTableau[targetStackIndex] = [...newTableau[targetStackIndex], ...cardsToMove];

    // Update state
    setTableau(newTableau);
    setWaste(newWaste);
    setFoundations(newFoundations);
    setSelectedCard(null);
    incrementMoves();
  };

  // Check for missed moves
  const checkMissedMoves = () => {
    // Check if there are any cards that can be moved to foundation
    let missedFoundationMove = false;

    // Check waste pile
    if (waste.length > 0) {
      const wasteCard = waste[waste.length - 1];
      for (let i = 0; i < 4; i++) {
        if (isValidFoundationMove(wasteCard, foundations[i])) {
          missedFoundationMove = true;
          break;
        }
      }
    }

    // Check tableau piles
    if (!missedFoundationMove) {
      for (let i = 0; i < 7; i++) {
        if (tableau[i].length === 0) continue;

        const tableauCard = tableau[i][tableau[i].length - 1];
        if (!tableauCard.faceUp) continue;

        for (let j = 0; j < 4; j++) {
          if (isValidFoundationMove(tableauCard, foundations[j])) {
            missedFoundationMove = true;
            break;
          }
        }

        if (missedFoundationMove) break;
      }
    }

    // If a foundation move was missed, increment the counter
    if (missedFoundationMove) {
      setMissedMoves(prevMissedMoves => prevMissedMoves + 1);
    }
  };

  // Increment move counter
  const incrementMoves = () => {
    setMoves(moves + 1);
    setLastMoveTime(Date.now());

    // If stock is empty, increment moves after stock empty
    if (stockEmptyTime !== null) {
      setMovesAfterStockEmpty(prevMoves => prevMoves + 1);
    }

    // Check for missed moves after a short delay
    setTimeout(() => {
      checkMissedMoves();
    }, 300);
  };

  // Check for win condition
  const checkWinCondition = () => {
    // Game is won when all foundations have 13 cards (A through K)
    const isWon = isGameWon(foundations);
    if (isWon && !gameWon) {
      setGameWon(true);
      // Final score calculation
      setScore(calculateScore(moves, time, true));
    }
  };

  // Undo last move
  const handleUndo = () => {
    const result = undoHistory(history, historyIndex, snapshot());
    if (result) {
      const previousState = result.state;

      setStock(previousState.stock);
      setWaste(previousState.waste);
      setFoundations(previousState.foundations);
      setTableau(previousState.tableau);
      setMoves(previousState.moves);
      setScore(previousState.score);
      setTime(previousState.time);

      setHistory(result.history);
      setHistoryIndex(result.historyIndex);
    }
  };

  // Redo move
  const handleRedo = () => {
    const result = redoHistory(history, historyIndex, snapshot());
    if (result) {
      const nextState = result.state;

      setStock(nextState.stock);
      setWaste(nextState.waste);
      setFoundations(nextState.foundations);
      setTableau(nextState.tableau);
      setMoves(nextState.moves);
      setScore(nextState.score);
      setTime(nextState.time);

      setHistory(result.history);
      setHistoryIndex(result.historyIndex);
    }
  };

  // Check if auto-complete is possible
  const canAutoComplete = () => {
    // Auto-complete is possible when all cards are face up
    return tableau.every(stack => stack.every(card => card.faceUp)) &&
           stock.length === 0 &&
           !gameWon;
  };

  // Auto-complete the game
  const handleAutoComplete = () => {
    if (!canAutoComplete()) return;

    // Save current state to history
    saveToHistory(snapshot());

    // Move every playable card to the foundations
    const {
      tableau: newTableau,
      foundations: newFoundations,
      waste: newWaste,
      movesMade
    } = autoComplete(tableau, foundations, waste);

    // Update state
    setTableau(newTableau);
    setWaste(newWaste);
    setFoundations(newFoundations);
    setMoves(moves + movesMade);
  };

  // Restart the game
  const restartGame = () => {
    initializeGame();
  };

  // Check if the game is over (no valid moves)
  const checkGameOver = () => {
    // Don't check if the game is already won or lost
    if (gameWon || gameLost) return;

    // Check if there are any valid moves
    const validMovesExist = hasValidMoves(tableau, foundations, waste, stock);

    // Check for game over conditions
    let gameOver = false;
    let gameOverReason = '';

    // Condition 1: No valid moves exist
    if (!validMovesExist) {
      gameOver = true;
      gameOverReason = 'No more valid moves available.';
    }

    // Condition 2: Stock is empty and 2 more moves have been made without progress
    if (stockEmptyTime !== null && movesAfterStockEmpty >= 2) {
      // Check if there's been any progress in the last 2 moves
      // Progress is defined as having cards moved to the foundation
      const totalFoundationCards = foundations.reduce((sum, foundation) => sum + foundation.length, 0);

      // If there are still cards not in foundation and no valid moves, it's game over
      if (totalFoundationCards < 52 && !validMovesExist) {
        gameOver = true;
        gameOverReason = 'Stock pile empty and no progress made after 2 moves.';
      }
    }

    // If game is over, update state
    if (gameOver) {
      setGameLost(true);
      // Store the reason for game over
      setGameOverReason(gameOverReason);
      // Stop the timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  // Toggle pause
  const togglePause = () => {
    setGamePaused(!gamePaused);
  };

  // Toggle settings modal
  const toggleSettings = () => {
    setSettingsOpen(!settingsOpen);
    setGamePaused(!gamePaused);
  };

  return (
    <div
      className="game-board"
      ref={boardRef}
      style={{ backgroundColor: theme.tableColor }}
    >
      <div className="game-header">
        <GameStats
          moves={moves}
          missedMoves={missedMoves}
          score={score}
          time={time}
          isGameWon={gameWon}
          drawCount={stock.length}
        />

        <GameControls
          onUndo={handleUndo}
          onRedo={handleRedo}
          onAutoComplete={handleAutoComplete}
          onNewGame={restartGame}
          onSettings={toggleSettings}
          onPause={togglePause}
          canUndo={canUndo(history, historyIndex)}
          canRedo={canRedo(history, historyIndex)}
          canAutoComplete={canAutoComplete()}
          isPaused={gamePaused}
          gameInProgress={gameStarted && !gameWon && !gameLost}
        />
      </div>

      {gameWon && (
        <div className="game-message win-message">
          <h2>Congratulations!</h2>
          <p>You won in {moves} moves and {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}!</p>
          <p>Your score: {score}</p>
          <button onClick={restartGame}>Play Again</button>
        </div>
      )}

      {gameLost && (
        <div className="game-message lose-message">
          <h2>Game Over</h2>
          <p>{gameOverReason}</p>
          <p>You made {moves} moves in {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}.</p>
          <p>Missed moves: {missedMoves}</p>
          <button onClick={restartGame}>New Game</button>
        </div>
      )}

      {gamePaused && !settingsOpen && !gameWon && !gameLost && (
        <div className="game-message pause-message">
          <h2>Game Paused</h2>
          <p>Click Resume to continue playing.</p>
          <button onClick={togglePause}>Resume</button>
        </div>
      )}

      <div className="top-row">
        <div
          className="stock"
          onClick={() => stock.length > 0 && drawFromStock()}
        >
          {stock.length > 0 ? (
            <Card
              suit={stock[stock.length - 1].suit}
              value={stock[stock.length - 1].value}
              faceUp={false}
              onClick={() => handleCardClick(stock[stock.length - 1], 'stock')}
              cardBackColor={theme.cardBack}
            />
          ) : (
            <div
              className="empty-pile"
              onClick={() => waste.length > 0 && drawFromStock()}
            >
              ↻
            </div>
          )}
        </div>

        <div className="waste">
          {waste.length > 0 && (
            <Card
              suit={waste[waste.length - 1].suit}
              value={waste[waste.length - 1].value}
              faceUp={true}
              draggable={true}
              onClick={() => handleCardClick(waste[waste.length - 1], 'waste', waste.length - 1)}
              onDragStart={(e) => handleDragStart(e, waste[waste.length - 1], 'waste', waste.length - 1)}
            />
          )}
        </div>

        <div className="foundations">
          {foundations.map((foundation, i) => (
            <div
              key={`foundation-${i}`}
              className="foundation"
              onDragOver={(e) => handleDragOver(e, 'foundation', i)}
              onDrop={(e) => handleDrop(e, 'foundation', i)}
            >
              {foundation.length > 0 ? (
                <Card
                  suit={foundation[foundation.length - 1].suit}
                  value={foundation[foundation.length - 1].value}
                  faceUp={true}
                  draggable={true}
                  onClick={() => handleCardClick(foundation[foundation.length - 1], 'foundation', foundation.length - 1, i)}
                  onDragStart={(e) => handleDragStart(e, foundation[foundation.length - 1], 'foundation', foundation.length - 1, i)}
                />
              ) : (
                <div className="empty-foundation"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="tableau-row">
        {tableau.map((stack, i) => (
          <div
            key={`tableau-${i}`}
            className="tableau-column"
            onDragOver={(e) => handleDragOver(e, 'tableau', i)}
            onDrop={(e) => handleDrop(e, 'tableau', i)}
          >
            {stack.length > 0 ? (
              stack.map((card, j) => (
                <div
                  key={card.id}
                  className="tableau-card"
                  style={{ top: `${j * 25}px` }}
                >
                  <Card
                    suit={card.suit}
                    value={card.value}
                    faceUp={card.faceUp}
                    draggable={card.faceUp}
                    onClick={() => handleCardClick(card, 'tableau', j, i)}
                    onDragStart={(e) => handleDragStart(e, card, 'tableau', j, i)}
                    cardBackColor={theme.cardBack}
                  />
                </div>
              ))
            ) : (
              <div className="empty-tableau"></div>
            )}
          </div>
        ))}
      </div>

      <Settings
        isOpen={settingsOpen}
        onClose={toggleSettings}
        theme={theme}
        setTheme={setTheme}
        favouriteColour={favouriteColour}
        setFavouriteColour={setFavouriteColour}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        onNewGame={restartGame}
      />
    </div>
  );
};

export default GameBoard;
