# Word Charades

A modern, cross-platform Progressive Web App (PWA) word guessing game built with Vanilla Web Technologies (HTML, CSS, JS).

## 🚀 Project Overview
**Word Charades** is a game where players guess missing consonants in words from various categories (Films, Science, Celebrities, Politics, Geography). It features a responsive "Glassmorphism" design, smooth animations, sound effects, and an infinite level progression system.

## ✨ Features
- 🎮 **5 Categories**: Films, Science, Celebrities, Politics, Geography (50+ words each)
- 🎨 **Dual Themes**: Dark and Light mode with glassmorphism design
- 🔊 **Audio System**: Programmatic sound effects using Web Audio API
- 📱 **PWA Support**: Install as a native app, works offline
- 💾 **Game Persistence**: Auto-save and resume your progress
- 📚 **Interactive Tutorial**: Learn how to play with step-by-step guide
- ⚙️ **Settings Panel**: Customize sound and theme preferences
- 🏆 **High Scores**: Track your best performance per category

## 🛠 Tech Stack
- **Frontend**: HTML5, CSS3 (Variables, Flexbox/Grid), JavaScript (ES6+)
- **State Management**: Custom `GameEngine` class with Observer pattern
- **Storage**: `localStorage` for persistence and preferences
- **PWA**: Service Worker with cache-first strategy
- **Audio**: Web Audio API (no external files)
- **Styling**: Pure CSS with no external frameworks

## 📂 Project Structure
```
/WordCharades
├── index.html              # Main entry point, DOM structure
├── style.css               # Design system, animations, responsive styles
├── script.js               # Game logic, state management, UI controller
├── manifest.json           # PWA manifest
├── sw.js                   # Service Worker for offline support
├── js/
│   ├── words.js            # Game data (50+ words per category)
│   └── audio.js            # Audio system (Web Audio API)
└── icons/
    ├── icon-192x192.png    # App icon (standard)
    └── icon-512x512.png    # App icon (high-res)
```

## 🧠 Core Architecture
### Game Engine (`script.js`)
- **`GameEngine` Class**: Manages the core game loop
    - `state`: Holds `category`, `currentWord`, `maskedWord`, `score`, `level`
    - `maskWord()`: Logic to reveal vowels and hide consonants
    - `guess(letter)`: Handles game rules (correct/wrong guesses)
    - `restoreState()`: Resume saved games
- **`UI` Object**: Handles all DOM updates, decoupled from game logic
- **`StorageManager` Class**: Manages localStorage operations
- **`AudioManager` Class**: Generates sound effects programmatically

### Data
- Word database in `js/words.js` with 50+ words per category
- Categories: Films, Science, Celebrities, Politics, Geography

## 🏃‍♂️ How to Run
1. **Simple**: Double-click `index.html`
2. **Server** (recommended): Run `python3 -m http.server 8000` and visit `http://localhost:8000`
3. **Install as PWA**: Open in Chrome/Edge/Safari and click "Install" in the address bar

## 📊 Development Status
- ✅ **Phase 1: MVP** - Core game mechanics, UI/UX, basic features
- ✅ **Phase 2: Production Ready** - PWA, audio, persistence, settings, tutorial
- 🔮 **Phase 3: Advanced Features** - Global leaderboards, daily challenges, multiplayer

## 📖 Documentation
See [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md) for detailed technical documentation, architecture decisions, and development roadmap.

## 📄 License
MIT License - Feel free to use, modify, and distribute
