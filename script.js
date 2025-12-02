console.log("Word Charades Initialized");

// --- Constants & Config ---
const VOWELS = new Set(['A', 'E', 'I', 'O', 'U']);
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
const MOTIVATING_MESSAGES = [
    "You're Awesome!",
    "Super Cool!",
    "You are on a roll!",
    "Spectacular!",
    "Unstoppable!",
    "Brilliant!",
    "Fantastic Job!",
    "Way to Go!",
    "Outstanding!",
    "Victory is Yours!"
];

// Use global GAME_DATA from words.js, fallback to empty if missing
const CATEGORIES = (typeof GAME_DATA !== 'undefined') ? GAME_DATA : {};

// --- Storage Manager ---
class StorageManager {
    static getHighScore(category) {
        const key = `wc_highscore_${category}`;
        return parseInt(localStorage.getItem(key) || '0');
    }

    static saveHighScore(category, score) {
        const currentHigh = this.getHighScore(category);
        if (score >= currentHigh) {
            localStorage.setItem(`wc_highscore_${category}`, score.toString());
            return true; // New High Score!
        }
        return false;
    }

    // Lifetime Score
    static getLifetimeScore() {
        return parseInt(localStorage.getItem('wc_lifetime_score') || '0');
    }

    static saveLifetimeScore(scoreToAdd) {
        const current = this.getLifetimeScore();
        const newScore = current + scoreToAdd;
        localStorage.setItem('wc_lifetime_score', newScore.toString());
        return newScore;
    }

    // Global Played Words (to avoid repetition)
    static getGlobalPlayedWords(category) {
        const key = `wc_played_${category}`;
        const saved = localStorage.getItem(key);
        return saved ? new Set(JSON.parse(saved)) : new Set();
    }

    static addGlobalPlayedWord(category, word) {
        const played = this.getGlobalPlayedWords(category);
        played.add(word);
        localStorage.setItem(`wc_played_${category}`, JSON.stringify(Array.from(played)));
    }

    static clearGlobalPlayedWords(category) {
        localStorage.removeItem(`wc_played_${category}`);
    }

    // Hint State
    static getHintState() {
        const saved = localStorage.getItem('wc_hints');
        if (!saved) {
            return { count: 3, lastUsed: 0 };
        }
        return JSON.parse(saved);
    }

    static saveHintState(state) {
        localStorage.setItem('wc_hints', JSON.stringify(state));
    }

    // Game State Persistence
    static saveGameState(state) {
        const saveData = {
            category: state.category,
            currentWord: state.currentWord,
            currentTrivia: state.currentTrivia,
            maskedWord: state.maskedWord,
            guessesLeft: state.guessesLeft,
            maxGuesses: state.maxGuesses,
            score: state.score,
            level: state.level,
            guessedLetters: Array.from(state.guessedLetters),
            wordsPlayed: Array.from(state.wordsPlayed), // Session played
            timestamp: Date.now()
        };
        localStorage.setItem('wc_game_state', JSON.stringify(saveData));
    }

    static loadGameState() {
        const saved = localStorage.getItem('wc_game_state');
        if (!saved) return null;

        try {
            const data = JSON.parse(saved);
            // Check if save is less than 24 hours old
            const hoursSinceSave = (Date.now() - data.timestamp) / (1000 * 60 * 60);
            if (hoursSinceSave > 24) {
                this.clearGameState();
                return null;
            }
            return data;
        } catch (e) {
            console.error('Failed to load game state:', e);
            return null;
        }
    }

    static clearGameState() {
        localStorage.removeItem('wc_game_state');
    }

    // Theme Preference
    static getTheme() {
        return localStorage.getItem('wc_theme') || 'dark';
    }

    static saveTheme(theme) {
        localStorage.setItem('wc_theme', theme);
    }
}

// --- Game Engine ---
class GameEngine {
    constructor() {
        this.state = {
            category: null,
            currentWord: "",
            currentTrivia: "",
            maskedWord: [], // Array of {char: 'A', revealed: true/false}
            guessesLeft: 0,
            maxGuesses: 0,
            score: 0,
            level: 1,
            guessedLetters: new Set(), // Set of chars
            isGameOver: false,
            wordsPlayed: new Set(), // Session played words
            isNewHighScore: false
        };
    }

    startCategory(category) {
        this.state.category = category;
        this.state.score = 0;
        this.state.level = 1;
        this.state.wordsPlayed.clear();
        this.state.isNewHighScore = false;
        this.nextLevel();
    }

    nextLevel() {
        const words = CATEGORIES[this.state.category];
        if (!words) {
            console.error("Category not found:", this.state.category);
            return;
        }

        // Get globally played words
        const globalPlayed = StorageManager.getGlobalPlayedWords(this.state.category);

        // Filter available words: Not in session played AND not in global played
        let availableWords = words.filter(w => !this.state.wordsPlayed.has(w.word) && !globalPlayed.has(w.word));

        // If ran out of globally available words, reset global history for this category
        if (availableWords.length === 0) {
            // If we also ran out of session words (meaning we played EVERYTHING in one session), just reset session
            // But more likely we just exhausted the global pool over time.
            // Let's reset global pool but keep session pool to avoid immediate repeat in this session.
            StorageManager.clearGlobalPlayedWords(this.state.category);
            // Re-filter with cleared global history
            availableWords = words.filter(w => !this.state.wordsPlayed.has(w.word));
        }

        // If STILL empty (played everything in this session!), reset session
        if (availableWords.length === 0) {
            this.state.wordsPlayed.clear();
            availableWords = words;
        }

        const wordObj = availableWords[Math.floor(Math.random() * availableWords.length)];
        this.state.wordsPlayed.add(wordObj.word);
        this.state.currentWord = wordObj.word;
        this.state.currentTrivia = wordObj.trivia;
        this.state.guessedLetters.clear();
        this.state.isGameOver = false;

        // Masking Logic
        this.state.maskedWord = wordObj.word.split('').map(char => {
            const isVowel = VOWELS.has(char);
            // Handle spaces or special chars if any (though currently words are pure letters)
            const isAlpha = /[A-Z]/.test(char);

            return {
                char: char,
                revealed: isVowel || !isAlpha, // Vowels and non-letters revealed
                isVowel: isVowel
            };
        });

        // Calculate Guesses: N + 1 where N is number of consonants (hidden chars)
        const hiddenCount = this.state.maskedWord.filter(l => !l.revealed).length;
        this.state.maxGuesses = hiddenCount + 1;
        this.state.guessesLeft = this.state.maxGuesses;

        // Save state immediately for persistence
        StorageManager.saveGameState(this.state);

        UI.updateGameScreen();
    }

    guess(letter) {
        if (this.state.isGameOver || this.state.guessedLetters.has(letter)) return;

        this.state.guessedLetters.add(letter);

        // Check if letter is in the word (and is a consonant)
        const hits = this.state.maskedWord.filter(l => l.char === letter && !l.revealed);

        if (hits.length > 0) {
            // Correct Guess
            hits.forEach(h => h.revealed = true);
            audioManager.playCorrect();

            // Check Win
            if (this.state.maskedWord.every(l => l.revealed)) {
                this.handleWin();
            }
        } else {
            // Wrong Guess
            this.state.guessesLeft--;
            audioManager.playWrong();
            UI.triggerShake(); // Visual feedback
            if (this.state.guessesLeft <= 0) {
                this.handleLoss();
            }
        }

        // Auto-save game state
        StorageManager.saveGameState(this.state);
        UI.updateGameScreen();
    }

    useHint() {
        if (this.state.isGameOver) return;

        const hintState = StorageManager.getHintState();
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;

        // Refill logic check
        if (hintState.count === 0 && (now - hintState.lastUsed > oneHour)) {
            hintState.count = 3;
            StorageManager.saveHintState(hintState);
            UI.updateHintButton(); // Refresh UI
            return; // Just refreshed, user needs to click again to use
        }

        if (hintState.count > 0) {
            // Find unrevealed consonant
            const unrevealed = this.state.maskedWord.filter(l => !l.revealed && !l.isVowel);
            if (unrevealed.length > 0) {
                const target = unrevealed[Math.floor(Math.random() * unrevealed.length)];

                // Reveal all instances of this letter
                this.guess(target.char);

                // Decrement hint
                hintState.count--;
                hintState.lastUsed = now;
                StorageManager.saveHintState(hintState);
                UI.updateHintButton();
            }
        }
    }

    handleWin() {
        this.state.isGameOver = true;
        // Scoring: Base 100 + (GuessesLeft * 50) * Level Multiplier (1 + level/10)
        const roundScore = Math.floor((100 + (this.state.guessesLeft * 50)) * (1 + (this.state.level * 0.1)));
        this.state.score += roundScore;
        this.state.level++;

        // Update Lifetime Score
        StorageManager.saveLifetimeScore(roundScore);

        // Add to Global Played Words
        StorageManager.addGlobalPlayedWord(this.state.category, this.state.currentWord);

        audioManager.playLevelComplete();
        StorageManager.saveGameState(this.state);

        setTimeout(() => {
            UI.showResult(true, roundScore);
        }, 500);
    }

    handleLoss() {
        this.state.isGameOver = true;

        // Check High Score
        this.state.isNewHighScore = StorageManager.saveHighScore(this.state.category, this.state.score);

        audioManager.playGameOver();
        StorageManager.clearGameState();

        setTimeout(() => {
            UI.showResult(false, 0);
        }, 500);
    }

    restoreState(savedState) {
        this.state.category = savedState.category;
        this.state.currentWord = savedState.currentWord;
        this.state.currentTrivia = savedState.currentTrivia || ""; // Handle legacy saves
        this.state.maskedWord = savedState.maskedWord;
        this.state.guessesLeft = savedState.guessesLeft;
        this.state.maxGuesses = savedState.maxGuesses;
        this.state.score = savedState.score;
        this.state.level = savedState.level;
        this.state.guessedLetters = new Set(savedState.guessedLetters);
        this.state.wordsPlayed = new Set(savedState.wordsPlayed);
        this.state.isGameOver = false;
        this.state.isNewHighScore = false;
    }
}

const game = new GameEngine();
let audioManager = null; // Will be initialized after user interaction

// --- UI Controller ---
const UI = {
    elements: {
        app: document.getElementById('app'),
        homeScreen: document.getElementById('home-screen'),
        gameScreen: document.getElementById('game-screen'),
        resultModal: document.getElementById('result-modal'),
        categoryGrid: document.getElementById('category-grid'),
        wordDisplay: document.getElementById('word-display'),
        keyboard: document.getElementById('keyboard'),
        levelDisplay: document.getElementById('level-display'),
        scoreDisplay: document.getElementById('score-display'),
        guessesLeft: document.getElementById('guesses-left'),
        currentCategory: document.getElementById('current-category'),
        resultTitle: document.getElementById('result-title'),
        resultWord: document.getElementById('result-word'),
        resultScore: document.getElementById('result-score'),
        resultTrivia: document.getElementById('result-trivia'),
        nextLevelBtn: document.getElementById('next-level-btn'),
        lifetimeScoreDisplay: document.getElementById('lifetime-score-display'),
        hintBtn: document.getElementById('hint-btn'),
        hintCount: document.getElementById('hint-count')
    },

    init() {
        // Initialize audio manager
        audioManager = new AudioManager();

        // Apply saved theme
        const savedTheme = StorageManager.getTheme();
        if (savedTheme === 'light') {
            document.body.classList.add('light-theme');
            document.getElementById('theme-toggle').checked = false;
        }

        // Update sound toggle state
        document.getElementById('sound-toggle').checked = audioManager.isEnabled();

        this.renderCategories();
        this.updateLifetimeScore();
        this.setupListeners();
        this.checkForSavedGame();

        // Hint timer check loop
        setInterval(() => this.updateHintButton(), 60000); // Check every minute
    },

    checkForSavedGame() {
        const savedState = StorageManager.loadGameState();
        if (savedState && confirm(`Resume your ${savedState.category} game? (Level ${savedState.level}, Score: ${savedState.score})`)) {
            game.restoreState(savedState);
            this.switchScreen('game');
        }
    },

    renderCategories() {
        this.elements.categoryGrid.innerHTML = '';
        Object.keys(CATEGORIES).forEach(cat => {
            const highScore = StorageManager.getHighScore(cat);

            const card = document.createElement('div');
            card.className = 'category-card';
            card.innerHTML = `
                <span class="category-icon">✨</span>
                <span class="category-name">${cat}</span>
                ${highScore > 0 ? `<div class="high-score">High Score: ${highScore}</div>` : ''}
            `;
            card.onclick = () => {
                audioManager.playClick();
                game.startCategory(cat);
                this.switchScreen('game');
            };
            this.elements.categoryGrid.appendChild(card);
        });
    },

    updateLifetimeScore() {
        if (this.elements.lifetimeScoreDisplay) {
            this.elements.lifetimeScoreDisplay.textContent = StorageManager.getLifetimeScore();
        }
    },

    updateHintButton() {
        if (!this.elements.hintBtn) return; // Guard if element not yet in DOM

        const hintState = StorageManager.getHintState();
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;

        if (hintState.count > 0) {
            this.elements.hintBtn.disabled = false;
            this.elements.hintCount.textContent = hintState.count;
            this.elements.hintBtn.title = "Use a Hint";
            this.elements.hintBtn.classList.remove('cooldown');
        } else {
            const timeLeft = oneHour - (now - hintState.lastUsed);
            if (timeLeft <= 0) {
                // Ready to refill
                // We'll let the click handler do the actual refill or auto-refill here
                // Let's auto-refill for better UX if they are on screen
                hintState.count = 3;
                StorageManager.saveHintState(hintState);
                this.updateHintButton();
            } else {
                this.elements.hintBtn.disabled = true;
                const minutesLeft = Math.ceil(timeLeft / 60000);
                this.elements.hintCount.textContent = "0";
                this.elements.hintBtn.title = `Refill in ${minutesLeft}m`;
                this.elements.hintBtn.classList.add('cooldown');
            }
        }
    },

    setupListeners() {
        // Game navigation
        document.getElementById('back-btn').onclick = () => {
            if (confirm('Quit current game? Progress will be saved.')) {
                StorageManager.saveGameState(game.state);
                this.switchScreen('home');
                this.renderCategories();
                this.updateLifetimeScore();
            }
        };

        document.getElementById('home-btn').onclick = () => {
            audioManager.playClick();
            StorageManager.clearGameState();
            this.switchScreen('home');
            this.renderCategories();
            this.updateLifetimeScore();
        };

        this.elements.nextLevelBtn.onclick = () => {
            audioManager.playClick();
            this.elements.resultModal.classList.add('hidden');
            if (this.elements.nextLevelBtn.textContent === "Next Level" || MOTIVATING_MESSAGES.includes(this.elements.resultTitle.textContent)) {
                game.nextLevel();
            } else {
                game.startCategory(game.state.category);
            }
        };

        // Hint Button
        if (this.elements.hintBtn) {
            this.elements.hintBtn.onclick = () => {
                game.useHint();
            };
        }

        // Settings modal
        document.getElementById('settings-btn').onclick = () => {
            audioManager.playClick();
            document.getElementById('settings-modal').classList.remove('hidden');
        };

        document.getElementById('settings-close-btn').onclick = () => {
            audioManager.playClick();
            document.getElementById('settings-modal').classList.add('hidden');
        };

        // Sound toggle
        document.getElementById('sound-toggle').onchange = (e) => {
            audioManager.toggle();
            if (e.target.checked) {
                audioManager.playClick();
            }
        };

        // Theme toggle
        document.getElementById('theme-toggle').onchange = (e) => {
            audioManager.playClick();
            if (e.target.checked) {
                document.body.classList.remove('light-theme');
                StorageManager.saveTheme('dark');
            } else {
                document.body.classList.add('light-theme');
                StorageManager.saveTheme('light');
            }
        };

        // Tutorial modal
        document.getElementById('tutorial-btn').onclick = () => {
            audioManager.playClick();
            document.getElementById('tutorial-modal').classList.remove('hidden');
        };

        document.getElementById('tutorial-close-btn').onclick = () => {
            audioManager.playClick();
            document.getElementById('tutorial-modal').classList.add('hidden');
        };
    },

    switchScreen(screenName) {
        this.elements.homeScreen.classList.add('hidden');
        this.elements.homeScreen.classList.remove('active');
        this.elements.gameScreen.classList.add('hidden');
        this.elements.gameScreen.classList.remove('active');
        this.elements.resultModal.classList.add('hidden');

        if (screenName === 'home') {
            this.elements.homeScreen.classList.remove('hidden');
            this.elements.homeScreen.classList.add('active');
        } else if (screenName === 'game') {
            this.elements.gameScreen.classList.remove('hidden');
            this.elements.gameScreen.classList.add('active');
            this.updateHintButton();
        }
    },

    updateGameScreen() {
        const state = game.state;

        // Update Stats
        this.elements.levelDisplay.textContent = state.level;
        this.elements.scoreDisplay.textContent = state.score;
        this.elements.guessesLeft.textContent = state.guessesLeft;
        this.elements.currentCategory.textContent = state.category;

        // Render Word
        this.elements.wordDisplay.innerHTML = '';
        state.maskedWord.forEach(item => {
            const slot = document.createElement('div');
            slot.className = `letter-slot ${item.revealed ? 'filled' : ''} ${item.isVowel ? 'vowel' : ''}`;
            // If space, make it invisible but present for layout
            if (item.char === ' ') {
                slot.style.borderBottom = 'none';
                slot.style.width = '1rem';
            }
            slot.textContent = item.revealed ? item.char : '';
            this.elements.wordDisplay.appendChild(slot);
        });

        // Render Keyboard
        this.elements.keyboard.innerHTML = '';
        ALPHABET.forEach(char => {
            const btn = document.createElement('button');
            btn.textContent = char;
            btn.className = 'key';

            const isGuessed = state.guessedLetters.has(char);
            const isVowel = VOWELS.has(char);

            if (isVowel) {
                btn.classList.add('used');
            } else if (isGuessed) {
                btn.classList.add('used');
                if (state.currentWord.includes(char)) {
                    btn.classList.add('correct');
                } else {
                    btn.classList.add('wrong');
                }
            }

            btn.onclick = () => {
                audioManager.playKeyPress();
                game.guess(char);
            };
            this.elements.keyboard.appendChild(btn);
        });

        this.updateHintButton();
    },

    triggerShake() {
        this.elements.gameScreen.classList.add('shake');
        setTimeout(() => this.elements.gameScreen.classList.remove('shake'), 500);
    },

    showResult(isWin, roundScore) {
        if (isWin) {
            // Random motivating message
            const msg = MOTIVATING_MESSAGES[Math.floor(Math.random() * MOTIVATING_MESSAGES.length)];
            this.elements.resultTitle.textContent = msg;
        } else {
            this.elements.resultTitle.textContent = "Game Over";
        }

        this.elements.resultWord.textContent = game.state.currentWord;

        // Show Trivia
        if (this.elements.resultTrivia) {
            this.elements.resultTrivia.textContent = game.state.currentTrivia || "";
            this.elements.resultTrivia.style.display = game.state.currentTrivia ? 'block' : 'none';
        }

        let scoreText = isWin ? `+${roundScore} Points` : `Final Score: ${game.state.score}`;
        if (game.state.isNewHighScore) {
            scoreText += " (NEW HIGH SCORE!)";
        }
        this.elements.resultScore.textContent = scoreText;

        if (isWin) {
            this.elements.nextLevelBtn.style.display = 'block';
            this.elements.nextLevelBtn.textContent = "Next Level";
        } else {
            this.elements.nextLevelBtn.style.display = 'block';
            this.elements.nextLevelBtn.textContent = "Retry Level";
        }

        this.elements.resultModal.classList.remove('hidden');
    }
};

// Add shake animation style dynamically if not in CSS
const styleSheet = document.createElement("style");
styleSheet.innerText = `
@keyframes shake {
    0% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    50% { transform: translateX(5px); }
    75% { transform: translateX(-5px); }
    100% { transform: translateX(0); }
}
.shake {
    animation: shake 0.4s ease-in-out;
}
.high-score {
    font-size: 0.8rem;
    color: var(--accent);
    margin-top: 0.5rem;
    font-weight: 600;
}
`;
document.head.appendChild(styleSheet);

// Start
UI.init();
