/**
 * Alarm Service
 * High-performance Web Audio API alarm generator with multiple emergency sound synthesis patterns,
 * volume control, mute management, and HTML5 audio fallback.
 */

class AlarmService {
  constructor() {
    this.audioCtx = null;
    this.gainNode = null;
    this.isPlaying = false;
    this.isMuted = false;
    this.volume = 0.8; // 0.0 to 1.0
    this.currentPattern = 'siren'; // 'siren' | 'pulse' | 'klaxon' | 'radar'
    this.activeOscillators = [];
    this.audioElement = null;
    this.pulseInterval = null;
  }

  /**
   * Initializes or resumes the AudioContext after user interaction
   */
  initAudio() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
        this.gainNode = this.audioCtx.createGain();
        this.gainNode.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.audioCtx.currentTime);
        this.gainNode.connect(this.audioCtx.destination);
      }
    }

    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  /**
   * Set volume (0.0 to 1.0)
   */
  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.gainNode && this.audioCtx && !this.isMuted) {
      this.gainNode.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);
    }
  }

  /**
   * Toggle mute state
   */
  setMuted(muted) {
    this.isMuted = Boolean(muted);
    if (this.gainNode && this.audioCtx) {
      this.gainNode.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.audioCtx.currentTime);
    }
    if (this.audioElement) {
      this.audioElement.muted = this.isMuted;
    }
  }

  /**
   * Set alarm tone pattern
   */
  setPattern(pattern) {
    this.currentPattern = pattern;
    if (this.isPlaying) {
      this.stop();
      this.play();
    }
  }

  /**
   * Start sounding the alarm
   */
  play() {
    if (this.isPlaying) return;
    this.initAudio();
    this.isPlaying = true;

    try {
      if (this.audioCtx) {
        this._startSynthesizer();
      } else {
        this._startAudioElementFallback();
      }
    } catch (err) {
      console.warn('AudioContext failed, fallback to Audio element:', err);
      this._startAudioElementFallback();
    }
  }

  /**
   * Stop the alarm immediately
   */
  stop() {
    this.isPlaying = false;
    this._stopSynthesizer();
    this._stopAudioElementFallback();
  }

  /**
   * Test alarm for a specific duration
   * @param {number} [durationMs=2000] 
   */
  testAlarm(durationMs = 2000) {
    this.play();
    setTimeout(() => {
      this.stop();
    }, durationMs);
  }

  // --- Internal Synthesis Engines ---

  _startSynthesizer() {
    if (!this.audioCtx || !this.gainNode) return;
    const now = this.audioCtx.currentTime;
    this.gainNode.gain.setValueAtTime(this.isMuted ? 0 : this.volume, now);

    switch (this.currentPattern) {
      case 'siren': {
        // High urgency warbling siren
        const osc = this.audioCtx.createOscillator();
        const mod = this.audioCtx.createOscillator();
        const modGain = this.audioCtx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(900, now);

        mod.type = 'sine';
        mod.frequency.setValueAtTime(3.5, now); // 3.5Hz cycle
        modGain.gain.setValueAtTime(350, now); // +/- 350Hz depth

        mod.connect(modGain);
        modGain.connect(osc.frequency);
        osc.connect(this.gainNode);

        mod.start();
        osc.start();
        this.activeOscillators.push(osc, mod);
        break;
      }

      case 'pulse': {
        // Urgent staccato beeping
        const createBeep = () => {
          if (!this.isPlaying || !this.audioCtx) return;
          const osc = this.audioCtx.createOscillator();
          const noteGain = this.audioCtx.createGain();
          const t = this.audioCtx.currentTime;

          osc.type = 'square';
          osc.frequency.setValueAtTime(1050, t);

          noteGain.gain.setValueAtTime(0, t);
          noteGain.gain.linearRampToValueAtTime(1, t + 0.02);
          noteGain.gain.setValueAtTime(1, t + 0.12);
          noteGain.gain.linearRampToValueAtTime(0, t + 0.15);

          osc.connect(noteGain);
          noteGain.connect(this.gainNode);

          osc.start(t);
          osc.stop(t + 0.16);
        };

        createBeep();
        this.pulseInterval = setInterval(createBeep, 200);
        break;
      }

      case 'klaxon': {
        // Dual-tone dissonant industrial horn
        const osc1 = this.audioCtx.createOscillator();
        const osc2 = this.audioCtx.createOscillator();

        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(650, now);

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(820, now);

        osc1.connect(this.gainNode);
        osc2.connect(this.gainNode);

        osc1.start();
        osc2.start();
        this.activeOscillators.push(osc1, osc2);
        break;
      }

      case 'radar': {
        // High frequency radar sweep
        const createSweep = () => {
          if (!this.isPlaying || !this.audioCtx) return;
          const osc = this.audioCtx.createOscillator();
          const noteGain = this.audioCtx.createGain();
          const t = this.audioCtx.currentTime;

          osc.type = 'sine';
          osc.frequency.setValueAtTime(1600, t);
          osc.frequency.exponentialRampToValueAtTime(400, t + 0.35);

          noteGain.gain.setValueAtTime(1, t);
          noteGain.gain.linearRampToValueAtTime(0.01, t + 0.35);

          osc.connect(noteGain);
          noteGain.connect(this.gainNode);

          osc.start(t);
          osc.stop(t + 0.36);
        };

        createSweep();
        this.pulseInterval = setInterval(createSweep, 450);
        break;
      }

      default:
        this._startAudioElementFallback();
        break;
    }
  }

  _stopSynthesizer() {
    if (this.pulseInterval) {
      clearInterval(this.pulseInterval);
      this.pulseInterval = null;
    }

    this.activeOscillators.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // ignore already stopped
      }
    });
    this.activeOscillators = [];
  }

  _startAudioElementFallback() {
    if (!this.audioElement) {
      this.audioElement = new Audio('/sounds/alarm.wav');
      this.audioElement.loop = true;
    }
    this.audioElement.volume = this.isMuted ? 0 : this.volume;
    this.audioElement.play().catch(e => console.warn('Audio element play failed:', e));
  }

  _stopAudioElementFallback() {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
    }
  }
}

export const alarmService = new AlarmService();
export default alarmService;
