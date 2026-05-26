import React from 'react';
import PropTypes from 'prop-types';
import { formatTime } from '../utils/helpers';
import '../styles/GameStats.css';

const GameStats = ({ moves, missedMoves, score, time, isGameWon, drawCount }) => {
  return (
    <div className="game-stats">
      <div className="stat-item">
        <span className="stat-label">Time:</span>
        <span className="stat-value">{formatTime(time)}</span>
      </div>
      <div className="stat-item">
        <span className="stat-label">Moves:</span>
        <span className="stat-value">{moves}</span>
      </div>
      <div className="stat-item">
        <span className="stat-label">Draw Count:</span>
        <span className="stat-value">{drawCount}</span>
      </div>
      <div className="stat-item">
        <span className="stat-label">Missed:</span>
        <span className="stat-value">{missedMoves}</span>
      </div>
      <div className="stat-item">
        <span className="stat-label">Score:</span>
        <span className="stat-value">{score}</span>
      </div>
      {isGameWon && (
        <div className="game-won-indicator">
          Game Won!
        </div>
      )}
    </div>
  );
};

GameStats.propTypes = {
  moves: PropTypes.number.isRequired,
  missedMoves: PropTypes.number.isRequired,
  score: PropTypes.number.isRequired,
  time: PropTypes.number.isRequired,
  isGameWon: PropTypes.bool.isRequired,
  drawCount: PropTypes.number.isRequired
};

export default GameStats;
