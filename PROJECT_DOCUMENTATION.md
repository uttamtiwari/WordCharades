# Word Charades - Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Initial Requirements](#initial-requirements)
3. [Tech Stack](#tech-stack)
4. [Architecture](#architecture)
5. [Development Phases](#development-phases)
6. [Phase 1: MVP (Completed)](#phase-1-mvp-completed)
7. [Phase 2: Production Readiness (Completed)](#phase-2-production-readiness-completed)
8. [Phase 3: Future Enhancements](#phase-3-future-enhancements)
9. [File Structure](#file-structure)
10. [How to Run](#how-to-run)
11. [Features Documentation](#features-documentation)

---

## Project Overview

**Word Charades** is a modern, cross-platform 2D word guessing game where players reveal hidden consonants to complete words from various categories. Built with vanilla web technologies, it features a stunning glassmorphism design, smooth animations, and progressive web app capabilities.

### Core Concept
- Vowels (A, E, I, O, U) are revealed automatically
- Players guess consonants to complete the word
- Limited guesses based on word difficulty
- Score increases with faster completions and higher levels
- Infinite progression across multiple categories

---

## Initial Requirements

### Functional Requirements
1. **Word Guessing Mechanics**
   - Display masked words with vowels revealed
   - Accept letter guesses via on-screen keyboard
   - Provide immediate feedback (correct/wrong)
   - Track remaining guesses
   - Award points based on performance

2. **Category System**
   - Multiple word categories (Films, Science, Celebrities, Politics, Geography)
   - Category selection from home screen
   - High score tracking per category

3. **Progression System**
   - Infinite levels within each category
   - Increasing difficulty (longer words, fewer guesses)
   - Score multipliers for higher levels
   - No word repetition within a session

4. **User Experience**
   - Responsive design (mobile-first)
   - Smooth animations and transitions
   - Visual feedback for all interactions
   - Persistent high scores

### Non-Functional Requirements
1. **Performance**: Fast load times, smooth 60fps animations
2. **Accessibility**: Keyboard navigation, semantic HTML
3. **Offline Support**: PWA with service worker caching
4. **Cross-Platform**: Works on iOS, Android, Desktop browsers
5. **No Dependencies**: Pure vanilla JavaScript (no frameworks)

---

## Tech Stack

### Frontend
- **HTML5**: Semantic structure, accessibility
- **CSS3**: Custom properties, Flexbox/Grid, animations
- **JavaScript (ES6+)**: Classes, modules, async/await

### Design System
- **Typography**: Google Fonts (Outfit)
- **Color Palette**: Purple (#8B5CF6), Cyan (#06B6D4), Pink (#EC4899)
- **Style**: Glassmorphism with backdrop filters
- **Animations**: CSS transitions and keyframes

### Storage & Persistence
- **localStorage**: High scores, game state, user preferences
- **Service Worker**: Asset caching for offline support

### Audio
- **Web Audio API**: Programmatic sound generation (no external files)

---

## Architecture

### Design Patterns
1. **MVC-like Separation**
   - **Model**: `GameEngine` class manages game state
   - **View**: `UI` object handles DOM updates
   - **Controller**: Event listeners bridge user actions to game logic

2. **Observer Pattern**
   - UI updates driven by state changes
   - Decoupled components communicate via state

3. **Singleton Pattern**
   - Single `game` instance
   - Single `audioManager` instance
   - Static `StorageManager` methods

### Core Classes

#### `GameEngine`
```javascript
class GameEngine {
  state: {
    category, currentWord, maskedWord, guessesLeft,
    score, level, guessedLetters, wordsPlayed
  }
  
  startCategory(category)
  nextLevel()
  guess(letter)
  handleWin()
  handleLoss()
  restoreState(savedState)
}
```

#### `StorageManager`
```javascript
class StorageManager {
  static getHighScore(category)
  static saveHighScore(category, score)
  static saveGameState(state)
  static loadGameState()
  static clearGameState()
  static getTheme() / saveTheme(theme)
}
```

#### `AudioManager`
```javascript
class AudioManager {
  playKeyPress()
  playCorrect()
  playWrong()
  playLevelComplete()
  playGameOver()
  playClick()
  toggle()
}
```

#### `UI` Object
```javascript
const UI = {
  init()
  renderCategories()
  setupListeners()
  switchScreen(screenName)
  updateGameScreen()
  showResult(isWin, roundScore)
  triggerShake()
  checkForSavedGame()
}
```

---

## Development Phases

### Phase 1: MVP (Completed ✅)
**Goal**: Create a playable word guessing game with core mechanics

**Deliverables**:
- ✅ Project structure (HTML/CSS/JS)
- ✅ Core game logic (masking, guessing, scoring)
- ✅ UI/UX with glassmorphism design
- ✅ Category system with hardcoded words
- ✅ High score tracking (localStorage)
- ✅ Responsive design

**Duration**: Initial development sprint

---

### Phase 2: Production Readiness (Completed ✅)
**Goal**: Transform MVP into production-ready PWA

#### 2.1 PWA Infrastructure
**Implementation**:
- Created `manifest.json` with app metadata
  - Name: "Word Charades - Guess the Missing Letters"
  - Theme colors: #1a1a2e (dark), #f1f5f9 (light)
  - Display mode: standalone
  - Icons: 192x192, 512x512 PNG

- Implemented `sw.js` Service Worker
  - Cache-first strategy
  - Offline asset caching
  - Cache versioning (v1)
  - Graceful offline fallback

- Generated app icons using AI
  - Vibrant gradient design (purple → cyan → pink)
  - Glassmorphism aesthetic
  - 512x512 and 192x192 formats

**Files Created**:
- `manifest.json`
- `sw.js`
- `icons/icon-192x192.png`
- `icons/icon-512x512.png`

**HTML Changes**:
- Added manifest link: `<link rel="manifest" href="manifest.json">`
- Added theme-color meta tag
- Added apple-touch-icon link
- Added service worker registration script

#### 2.2 Audio System
**Implementation**:
- Created `js/audio.js` with `AudioManager` class
- Used Web Audio API for programmatic sound generation
- No external audio files needed

**Sound Effects**:
- **Key Press**: 800Hz square wave, 50ms (subtle click)
- **Correct Guess**: C5 → E5 ascending tones (pleasant)
- **Wrong Guess**: G4 → D4 descending tones (negative)
- **Level Complete**: C5 → E5 → G5 → C6 fanfare (victory)
- **Game Over**: G4 → F4 → D4 → C4 descending (sad)
- **UI Click**: 600Hz sine wave, 80ms (generic button)

**Features**:
- Sound preference saved to localStorage
- Toggle in settings panel
- Respects user choice across sessions

**Files Created**:
- `js/audio.js`

#### 2.3 Game State Persistence
**Implementation**:
- Extended `StorageManager` with state save/load methods
- Auto-save on every guess
- Resume prompt on app load
- 24-hour expiration for saved games

**State Saved**:
```javascript
{
  category, currentWord, maskedWord,
  guessesLeft, maxGuesses, score, level,
  guessedLetters, wordsPlayed, timestamp
}
```

**User Flow**:
1. Player starts game, makes guesses → auto-saved
2. Player closes browser mid-game
3. Player reopens app → "Resume your Films game? (Level 3, Score: 450)"
4. Player confirms → game restored exactly where they left off

**Files Modified**:
- `script.js` (StorageManager class, GameEngine.restoreState)

#### 2.4 Settings Panel
**Implementation**:
- Added settings modal with glassmorphism styling
- Two toggle switches: Sound Effects, Dark Theme
- Preferences persist via localStorage

**Theme System**:
- **Dark Theme** (default):
  - Background: #0f172a, #020617
  - Text: #f8fafc
  - Accents: Purple, Cyan, Pink

- **Light Theme**:
  - Background: #f1f5f9, #ffffff
  - Text: #0f172a
  - Accents: Same vibrant colors
  - Adjusted opacity for orbs

- CSS variables enable instant switching
- `body.light-theme` class toggles theme

**Files Modified**:
- `index.html` (settings modal structure)
- `style.css` (toggle switch styles, light theme variables)
- `script.js` (settings event handlers)

#### 2.5 Tutorial Overlay
**Implementation**:
- Created "How to Play" modal with 5 numbered steps
- Clean, scannable layout
- Accessible from home screen via ❓ button

**Tutorial Steps**:
1. Choose a Category
2. Vowels are Revealed
3. Guess Letters
4. Complete the Word
5. Score Points

**Files Modified**:
- `index.html` (tutorial modal structure)
- `style.css` (tutorial step styling)
- `script.js` (tutorial event handlers)

#### 2.6 Expanded Word Database
**Implementation**:
- Expanded each category from ~28 to 50+ words
- Added variety: classics, modern entries, diverse topics

**Categories Enhanced**:
- **Films**: Added Casablanca, Psycho, superhero movies (Avengers, Black Panther)
- **Science**: Added elements (Carbon, Oxygen), physics terms (Momentum, Velocity)
- **Celebrities**: Added modern artists (Billie Eilish, The Weeknd, Olivia Rodrigo)
- **Politics**: Added governmental terms (Constitution, Impeachment, Legislature)
- **Geography**: Added European/African countries (Iceland, Kenya, Morocco)

**Files Modified**:
- `js/words.js`

**Duration**: 1 development sprint

---

## Phase 3: Future Enhancements

### Planned Features

#### 3.1 Global Leaderboards
- Backend integration (Firebase/Supabase)
- Real-time score updates
- Daily/weekly/all-time rankings
- Username system

#### 3.2 Daily Challenge Mode
- One unique word per day (same for all players)
- Special scoring rules
- Streak tracking
- Social sharing

#### 3.3 User Profiles
- Account creation (optional)
- Achievement system
- Statistics dashboard
- Progress tracking

#### 3.4 Additional Categories
- Sports, Music, Technology, History
- User-submitted words (moderated)
- Difficulty levels (Easy/Medium/Hard)

#### 3.5 Multiplayer Mode
- Real-time head-to-head
- Turn-based challenges
- Friend invites

#### 3.6 Accessibility Enhancements
- Screen reader optimization
- High contrast mode
- Adjustable font sizes
- Colorblind-friendly palette

---

## File Structure

```
/WordCharades
├── index.html              # Main entry point, DOM structure
├── style.css               # Design system, animations, responsive styles
├── script.js               # Game logic, state management, UI controller
├── manifest.json           # PWA manifest
├── sw.js                   # Service Worker
├── README.md               # Project overview
├── PROJECT_DOCUMENTATION.md # This file
├── .gitignore              # Git ignore rules
│
├── js/
│   ├── words.js            # Game data (50+ words per category)
│   └── audio.js            # Audio system (Web Audio API)
│
└── icons/
    ├── icon-192x192.png    # App icon (standard)
    └── icon-512x512.png    # App icon (high-res)
```

---

## How to Run

### Local Development
```bash
# Option 1: Simple (double-click)
open index.html

# Option 2: Local server (recommended for PWA testing)
python3 -m http.server 8000
# Visit: http://localhost:8000

# Option 3: Node.js server
npx http-server -p 8000
```

### PWA Installation
1. Open in Chrome/Edge/Safari
2. Look for "Install" prompt in address bar
3. Click "Install" to add to home screen
4. App runs in standalone mode (no browser UI)

### Testing Offline Mode
1. Install as PWA
2. Open DevTools → Application → Service Workers
3. Check "Offline" checkbox
4. Reload page → app still works!

---

## Features Documentation

### 1. Word Masking Algorithm
```javascript
// Vowels revealed, consonants hidden
maskedWord = word.split('').map(char => ({
  char: char,
  revealed: VOWELS.has(char), // true for A,E,I,O,U
  isVowel: VOWELS.has(char)
}));
```

### 2. Scoring System
```javascript
// Base score + bonus for remaining guesses, scaled by level
roundScore = (100 + (guessesLeft * 50)) * (1 + (level * 0.1))

// Example:
// Level 1, 3 guesses left: (100 + 150) * 1.1 = 275
// Level 5, 5 guesses left: (100 + 250) * 1.5 = 525
```

### 3. Guess Calculation
```javascript
// Guesses = number of hidden consonants + 1
hiddenCount = maskedWord.filter(l => !l.revealed).length
maxGuesses = hiddenCount + 1

// Example: "TITANIC" → "TI TA NIC"
// Hidden: T, T, N, C = 4 consonants
// Guesses: 4 + 1 = 5
```

### 4. High Score Persistence
```javascript
// Stored per category
localStorage.setItem('wc_highscore_Films', '1250')
localStorage.setItem('wc_highscore_Science', '890')
```

### 5. Theme Toggle
```javascript
// Dark theme (default)
document.body.classList.remove('light-theme')

// Light theme
document.body.classList.add('light-theme')

// CSS variables automatically update
```

### 6. Service Worker Caching
```javascript
// Cache static assets
ASSETS_TO_CACHE = [
  '/', '/index.html', '/style.css', '/script.js',
  '/js/words.js', '/js/audio.js',
  '/icons/icon-192x192.png', '/icons/icon-512x512.png',
  'https://fonts.googleapis.com/...'
]

// Cache-first strategy
fetch(request) → check cache → return cached OR fetch from network
```

---

## Next Steps

### Immediate (Post-Phase 2)
1. **User Testing**: Gather feedback on UX/UI
2. **Performance Optimization**: Lighthouse audit, optimize assets
3. **Cross-Browser Testing**: Safari, Firefox, Edge compatibility
4. **Accessibility Audit**: WCAG 2.1 compliance check

### Short-Term (1-2 months)
1. **Analytics Integration**: Track user behavior (Google Analytics/Plausible)
2. **Error Monitoring**: Sentry/Rollbar for production errors
3. **A/B Testing**: Test different scoring algorithms
4. **Content Expansion**: Add 2-3 new categories

### Long-Term (3-6 months)
1. **Backend Development**: Set up Firebase/Supabase
2. **Global Leaderboards**: Implement Phase 3.1
3. **Daily Challenge**: Implement Phase 3.2
4. **Mobile App**: Consider React Native wrapper for app stores

---

## Contributing

### Code Style
- Use ES6+ features (classes, arrow functions, template literals)
- Follow existing naming conventions (camelCase for variables/functions)
- Add comments for complex logic
- Keep functions small and focused

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/new-category

# Make changes, commit
git add .
git commit -m "Add Technology category with 50 words"

# Push and create PR
git push origin feature/new-category
```

### Testing Checklist
- [ ] Test on Chrome, Safari, Firefox
- [ ] Test on mobile (iOS, Android)
- [ ] Test offline mode (PWA)
- [ ] Test theme toggle
- [ ] Test sound effects
- [ ] Test game state persistence
- [ ] Check localStorage limits
- [ ] Verify high scores persist

---

## License
MIT License - Feel free to use, modify, and distribute

---

## Credits
- **Design Inspiration**: Modern glassmorphism trends
- **Fonts**: Google Fonts (Outfit)
- **Icons**: AI-generated app icons
- **Sound Effects**: Web Audio API (programmatic generation)

---

**Last Updated**: November 24, 2025  
**Version**: 2.0 (Production Ready)  
**Status**: ✅ Phase 2 Complete
