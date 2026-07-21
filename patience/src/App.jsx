import React, { useState } from 'react'
import GameBoard from './components/GameBoard'
import FreeCellBoard from './components/FreeCellBoard'
import './games'
import { listGames } from './games/registry'
import './App.css'

const boards = {
  klondike: GameBoard,
  freecell: FreeCellBoard
}

function App() {
  const [gameId, setGameId] = useState('klondike')
  const ActiveBoard = boards[gameId]

  return (
    <div className="app">
      <header className="app-header">
        <h1>Patience: Classic Card Solitaire</h1>
        <nav className="game-picker">
          {listGames().map(game => (
            <button
              key={game.id}
              className={game.id === gameId ? 'active' : ''}
              onClick={() => setGameId(game.id)}
            >
              {game.name}
            </button>
          ))}
        </nav>
      </header>
      <main>
        <ActiveBoard key={gameId} />
      </main>
      <footer className="app-footer">
        <p>© 2025 Patience Card Game</p>
      </footer>
    </div>
  )
}

export default App
