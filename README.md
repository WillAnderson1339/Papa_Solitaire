# 🃏 Papa Solitaire

A classic Solitaire (Patience) card game built with React 19 and Vite. Play the timeless card game right in your browser with smooth animations and intuitive drag-and-drop gameplay.

[![React](https://img.shields.io/badge/React-19.0-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Forked and Modified by Will May 26, 2026

---

## 🎮 Features

- ✅ **Classic Solitaire Gameplay** - Traditional Klondike Solitaire rules
- ✅ **Drag & Drop Interface** - Intuitive card movement
- ✅ **Smooth Animations** - Polished card transitions
- ✅ **Responsive Design** - Play on desktop or mobile
- ✅ **Score Tracking** - Keep track of your performance
- ✅ **Undo Functionality** - Reverse your moves
- ✅ **Auto-Complete** - Automatically finish when you've won
- ✅ **New Game** - Start fresh anytime

---

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ installed
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/beerberidie/Papa_Solitaire.git
cd Papa_Solitaire/patience

# Install dependencies
npm install

# Start development server
npm run dev
```

The game will open at `http://localhost:5173`

---

## 📦 Available Scripts

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

---

## 🎯 How to Play

### Objective
Move all cards to the four foundation piles (top right), sorted by suit from Ace to King.

### Rules
1. **Tableau (Main Area):** Build down in alternating colors (red on black, black on red)
2. **Foundation (Top Right):** Build up by suit from Ace to King
3. **Stock (Top Left):** Draw cards when you can't make any moves
4. **Waste Pile:** Cards drawn from the stock go here

### Controls
- **Drag & Drop:** Click and drag cards to move them
- **Double Click:** Auto-move card to foundation (if valid)
- **Click Stock:** Draw new cards
- **New Game Button:** Start a fresh game
- **Undo Button:** Reverse your last move

---

## 🏗️ Project Structure

```
Papa_solitare/
├── patience/                 # Main application directory
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── logic/           # Game logic
│   │   ├── styles/          # CSS styles
│   │   ├── utils/           # Utility functions
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # Entry point
│   ├── public/              # Static assets
│   ├── index.html           # HTML template
│   ├── package.json         # Dependencies
│   ├── vite.config.js       # Vite configuration
│   └── vercel.json          # Vercel deployment config
├── archive/                 # Archived old versions
├── README.md                # This file
└── LICENSE                  # MIT License
```

---

## 🛠️ Built With

- **[React 19](https://reactjs.org/)** - UI library
- **[Vite 6.2](https://vitejs.dev/)** - Build tool and dev server
- **[ESLint](https://eslint.org/)** - Code linting
- **Vanilla CSS** - Styling

---

## 🚀 Deployment

### Deploy to Vercel

The easiest way to deploy Papa Solitaire:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd patience
vercel
```

### Deploy to GitHub Pages

1. Update `vite.config.js` base path (already configured as `/Papa_Solitaire/`)
2. Build the project: `npm run build`
3. Deploy the `dist/` folder to GitHub Pages

See [DEPLOYMENT.md](patience/DEPLOYMENT.md) for detailed deployment instructions.

---

## 🎨 Customization

### Changing Card Design
Edit the card styles in `src/styles/Card.css`

### Modifying Game Rules
Update the game logic in `src/logic/gameLogic.js`

### Adjusting Layout
Modify the board layout in `src/components/Board.jsx`

---

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run tests with coverage
npm run test:coverage
```

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Garason (beerberidie)**

- GitHub: [@beerberidie](https://github.com/beerberidie)
- Repository: [Papa_Solitaire](https://github.com/beerberidie/Papa_Solitaire)

---

## 🙏 Acknowledgments

- Classic Solitaire game rules
- React community for excellent documentation
- Vite team for the amazing build tool

---

## 🐛 Known Issues

None currently. If you find a bug, please [open an issue](https://github.com/beerberidie/Papa_Solitaire/issues).

---

## 🔮 Future Enhancements

- [ ] Multiple game modes (Spider, FreeCell, etc.)
- [ ] Statistics tracking (games played, win rate, best time)
- [ ] Themes and card back designs
- [ ] Sound effects and music
- [ ] Multiplayer mode
- [ ] Daily challenges
- [ ] Leaderboards

---

## 📊 Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

**Enjoy playing Papa Solitaire! 🃏**

