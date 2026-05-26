import React from 'react';
import PropTypes from 'prop-types';
import '../styles/Settings.css';

const Settings = ({ 
  isOpen, 
  onClose, 
  theme, 
  setTheme, 
  favouriteColour,
  setFavouriteColour,
  difficulty, 
  setDifficulty,
  onNewGame
}) => {
  const themes = [
    { id: 'classic', name: 'Classic Green', tableColor: '#2a7e43', cardBack: 'blue' },
    { id: 'dark', name: 'Dark Mode', tableColor: '#1a1a1a', cardBack: 'red' },
    { id: 'light', name: 'Light Mode', tableColor: '#e0e0e0', cardBack: 'green' },
    { id: 'royal', name: 'Royal Blue', tableColor: '#1e4785', cardBack: 'gold' }
  ];

  const difficulties = [
    { id: 'easy', name: 'Easy', drawCount: 1, description: 'Draw 1 card at a time, unlimited redeals' },
    { id: 'medium', name: 'Medium', drawCount: 3, description: 'Draw 3 cards at a time, unlimited redeals' },
    { id: 'hard', name: 'Hard', drawCount: 3, description: 'Draw 3 cards at a time, 3 redeals maximum' }
  ];

  const colours = ['Red', 'Green', 'Blue', 'Purple', 'Teal'];

  if (!isOpen) return null;

  return (
    <div className="settings-overlay">
      <div className="settings-modal">
        <div className="settings-header">
          <h2>Game Settings</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="settings-content">
          <section className="settings-section">
            <h3>Theme</h3>
            <div className="theme-options">
              {themes.map(themeOption => (
                <div 
                  key={themeOption.id}
                  className={`theme-option ${theme.id === themeOption.id ? 'selected' : ''}`}
                  onClick={() => setTheme(themeOption)}
                  style={{ backgroundColor: themeOption.tableColor }}
                >
                  <div 
                    className="theme-card-back"
                    style={{ backgroundColor: themeOption.id === 'dark' ? '#333' : '#fff' }}
                  >
                    <div 
                      className="theme-card-pattern"
                      style={{ 
                        backgroundColor: 
                          themeOption.cardBack === 'blue' ? '#2c5aa0' : 
                          themeOption.cardBack === 'red' ? '#a02c2c' : 
                          themeOption.cardBack === 'green' ? '#2ca05a' : 
                          '#d4af37'
                      }}
                    ></div>
                  </div>
                  <span style={{ color: themeOption.id === 'dark' ? '#fff' : '#000' }}>
                    {themeOption.name}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="settings-section">
            <h3>Favourite Colour</h3>
            <div className="colour-options">
              <select 
                value={favouriteColour} 
                onChange={(e) => setFavouriteColour(e.target.value)}
                className="colour-select"
              >
                {colours.map(colour => (
                  <option key={colour} value={colour}>
                    {colour}
                  </option>
                ))}
              </select>
            </div>
          </section>
          
          <section className="settings-section">
            <h3>Difficulty</h3>
            <div className="difficulty-options">
              {difficulties.map(difficultyOption => (
                <div 
                  key={difficultyOption.id}
                  className={`difficulty-option ${difficulty.id === difficultyOption.id ? 'selected' : ''}`}
                  onClick={() => setDifficulty(difficultyOption)}
                >
                  <h4>{difficultyOption.name}</h4>
                  <p>{difficultyOption.description}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
        
        <div className="settings-footer">
          <button 
            className="apply-button"
            onClick={() => {
              onNewGame();
              onClose();
            }}
          >
            Apply & New Game
          </button>
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

Settings.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  theme: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    tableColor: PropTypes.string.isRequired,
    cardBack: PropTypes.string.isRequired
  }).isRequired,
  setTheme: PropTypes.func.isRequired,
  favouriteColour: PropTypes.string.isRequired,
  setFavouriteColour: PropTypes.func.isRequired,
  difficulty: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    drawCount: PropTypes.number.isRequired,
    description: PropTypes.string.isRequired
  }).isRequired,
  setDifficulty: PropTypes.func.isRequired,
  onNewGame: PropTypes.func.isRequired
};

export default Settings;
