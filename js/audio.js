// Audio Manager for Word Charades
// Uses Web Audio API to generate sound effects programmatically (no external files needed)

class AudioManager {
    constructor() {
        this.audioContext = null;
        this.enabled = this.loadSoundPreference();
        this.initAudioContext();
    }

    initAudioContext() {
        // Create AudioContext on first user interaction (browser requirement)
        if (!this.audioContext && this.enabled) {
            try {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                console.warn('Web Audio API not supported:', e);
                this.enabled = false;
            }
        }
    }

    loadSoundPreference() {
        const saved = localStorage.getItem('wc_sound_enabled');
        return saved === null ? true : saved === 'true';
    }

    saveSoundPreference() {
        localStorage.setItem('wc_sound_enabled', this.enabled.toString());
    }

    toggle() {
        this.enabled = !this.enabled;
        this.saveSoundPreference();
        if (this.enabled) {
            this.initAudioContext();
        }
        return this.enabled;
    }

    isEnabled() {
        return this.enabled;
    }

    // Play a simple beep tone
    playTone(frequency, duration, type = 'sine', volume = 0.3) {
        if (!this.enabled || !this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = type;

        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    // Key press sound - subtle click
    playKeyPress() {
        this.playTone(800, 0.05, 'square', 0.1);
    }

    // Correct guess - pleasant ascending tone
    playCorrect() {
        if (!this.enabled || !this.audioContext) return;

        const now = this.audioContext.currentTime;
        this.playTone(523.25, 0.1, 'sine', 0.2); // C5
        setTimeout(() => this.playTone(659.25, 0.15, 'sine', 0.25), 80); // E5
    }

    // Wrong guess - descending tone
    playWrong() {
        if (!this.enabled || !this.audioContext) return;

        const now = this.audioContext.currentTime;
        this.playTone(392, 0.1, 'sawtooth', 0.15); // G4
        setTimeout(() => this.playTone(293.66, 0.2, 'sawtooth', 0.2), 100); // D4
    }

    // Level complete - victory fanfare
    playLevelComplete() {
        if (!this.enabled || !this.audioContext) return;

        const notes = [
            { freq: 523.25, delay: 0 },    // C5
            { freq: 659.25, delay: 100 },  // E5
            { freq: 783.99, delay: 200 },  // G5
            { freq: 1046.50, delay: 300 }  // C6
        ];

        notes.forEach(note => {
            setTimeout(() => this.playTone(note.freq, 0.2, 'sine', 0.25), note.delay);
        });
    }

    // Game over - sad descending tones
    playGameOver() {
        if (!this.enabled || !this.audioContext) return;

        const notes = [
            { freq: 392, delay: 0 },     // G4
            { freq: 349.23, delay: 150 }, // F4
            { freq: 293.66, delay: 300 }, // D4
            { freq: 261.63, delay: 450 }  // C4
        ];

        notes.forEach(note => {
            setTimeout(() => this.playTone(note.freq, 0.25, 'triangle', 0.2), note.delay);
        });
    }

    // Button click - generic UI sound
    playClick() {
        this.playTone(600, 0.08, 'sine', 0.15);
    }
}

// Export as global
window.AudioManager = AudioManager;
