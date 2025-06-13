/**
 * @file Core audio engine for Thunderbird Chiptune Composer.
 * Handles audio context, sound loading, playback scheduling, and master controls.
 */

class AudioEngine {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.playbackIntervalId = null;
        this.currentStep = 0;
        this.trackerGrid = null; // To hold a reference to the grid
        this.isPlaying = false;
        this.isPaused = false;
    }

    /**
     * Initializes the AudioContext and other necessary components.
     * @returns {boolean} True if initialization was successful, false otherwise.
     */
    init() {
        try {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!window.AudioContext) {
                console.error("Web Audio API is not supported in this browser.");
                return false;
            }
            this.audioContext = new AudioContext();

            // Create a master gain node
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.setValueAtTime(0.7, this.audioContext.currentTime); // Default volume

            console.log("AudioEngine initialized successfully.");
            return true;
        } catch (e) {
            console.error("Error initializing AudioContext:", e);
            return false;
        }
    }

    /**
     * Placeholder for loading a sound file.
     * @param {string} url - The URL of the sound file to load.
     */
    async loadSound(url) {
        console.log(`Placeholder: loadSound(${url})`);
        // In a real implementation:
        // const response = await fetch(url);
        // const arrayBuffer = await response.arrayBuffer();
        // const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        // return audioBuffer;
        return null;
    }

    /**
     * Placeholder for playing a loaded sound buffer.
     * @param {AudioBuffer} buffer - The AudioBuffer to play.
     * @param {number} time - The AudioContext time at which to start playing.
     */
    playSound(buffer, time) {
        console.log(`Placeholder: playSound(buffer, ${time})`);
        if (!this.audioContext || !buffer) {
            console.error("AudioContext not initialized or buffer not provided.");
            return;
        }
        // In a real implementation:
        // const source = this.audioContext.createBufferSource();
        // source.buffer = buffer;
        // source.connect(this.masterGain);
        // source.start(time);
    }

    /**
     * Placeholder for scheduling a note to be played by a specific instrument.
     * @param {object} note - Object containing note details (e.g., pitch, velocity).
     * @param {number} time - The AudioContext time to play the note.
     * @param {number} duration - The duration of the note in seconds.
     * @param {object} instrument - The instrument to play the note with.
     */
    scheduleNote(note, time, duration, instrument) {
        // console.log(`Placeholder: scheduleNote(note, ${time}, ${duration}, instrument)`);
        if (!this.audioContext) {
            console.error("AudioContext not initialized.");
            return;
        }

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        // Use note.pitch for frequency
        oscillator.type = (instrument && instrument.type) ? instrument.type : 'square';
        oscillator.frequency.setValueAtTime(note.pitch, time);

        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);

        // Simple AD envelope
        gainNode.gain.setValueAtTime(0, time);
        gainNode.gain.linearRampToValueAtTime(0.5, time + 0.05); // Attack
        gainNode.gain.linearRampToValueAtTime(0, time + duration); // Decay

        oscillator.start(time);
        oscillator.stop(time + duration);
        console.log(`AudioEngine: Scheduled note (freq: ${note.pitch}Hz) at time ${time} for ${duration}s`);
    }

    /**
     * Starts the audio scheduler/playback.
     */
    startPlayback() {
        if (!this.audioContext || this.audioContext.state === 'closed') {
            console.error("AudioEngine: AudioContext not available or closed. Cannot start playback.");
            this.isPlaying = false;
            return false;
        }

        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume().then(() => {
                console.log("AudioContext resumed.");
                this._startSequencerInternal();
            }).catch(e => {
                console.error("Error resuming AudioContext:", e);
                this.isPlaying = false;
                // Consider not returning false here as the promise is async
            });
            // Note: _startSequencerInternal might not be called immediately here.
            // For a more accurate return value, we might need to await the resume.
            // However, for now, we'll assume it will eventually start or log an error.
            // Let's proceed with optimistic true, but this could be refined.
        } else {
            this._startSequencerInternal();
        }
        return true; // Indicates attempt to start was made
    }

    _startSequencerInternal() {
        if (this.playbackIntervalId) {
            clearInterval(this.playbackIntervalId);
        }
        this.currentStep = 0;
        console.log("AudioEngine: Starting playback sequencer...");

        this.playbackIntervalId = setInterval(() => {
            this.playStepData(this.currentStep, this.audioContext.currentTime);
            this.currentStep = (this.currentStep + 1) % 16; // Loop 16 steps
        }, 150);
        this.isPlaying = true;
        this.isPaused = false;
    }

    /**
     * Plays data for a given step in the sequence.
     * @param {number} step - The current step number (e.g., 0-15).
     * @param {number} time - The AudioContext time to schedule notes for this step.
     */
    playStepData(step, time) {
        if (!this.trackerGrid) {
            console.warn("AudioEngine.playStepData: TrackerGrid not set.");
            return;
        }
        const stepData = this.trackerGrid.getStepData(step);
        if (!stepData || stepData.length === 0) {
            // console.log(`AudioEngine.playStepData: No data for step ${step}`);
            return;
        }

        const noteDuration = 0.1; // seconds, make this configurable later (e.g., based on BPM)

        stepData.forEach((trackCell, trackIndex) => {
            if (trackCell && trackCell.note && trackCell.note !== '---') {
                // Basic note parsing (e.g., "C-4", "F#3"). For now, just use a fixed frequency for any note.
                // A more sophisticated parser will be needed later.
                // For simplicity, we'll use trackIndex to vary pitch slightly for now.
                const baseFrequency = 220; // A2
                const frequency = baseFrequency * Math.pow(2, trackIndex / 12);

                console.log(`AudioEngine: Scheduling note for Step: ${step}, Track: ${trackIndex}, Note: ${trackCell.note}, Freq: ${frequency.toFixed(2)}Hz`);

                // Construct a simple note object for scheduleNote
                const noteInfo = {
                    pitch: frequency, // Using frequency directly as pitch for now
                    velocity: 0.5 // Default velocity
                };
                const instrument = null; // Placeholder for actual instrument data

                this.scheduleNote(noteInfo, time, noteDuration, instrument);
            }
        });
    }


    /**
     * Stops the audio scheduler/playback.
     */
    stopPlayback() {
        if (this.playbackIntervalId) {
            clearInterval(this.playbackIntervalId);
            this.playbackIntervalId = null;
        }
        this.currentStep = 0;
        this.isPlaying = false;
        this.isPaused = false;
        // Optional: stop all sounding notes
        console.log("AudioEngine: Playback stopped, sequencer interval cleared.");
        return true;
    }

    /**
     * Placeholder for pausing playback.
     * For now, it behaves like stop.
     */
    pausePlayback() {
        // True pause would suspend the AudioContext or stop feeding the sequencer
        // without resetting the currentStep. For now, just stop.
        if (this.isPlaying) {
            clearInterval(this.playbackIntervalId);
            this.playbackIntervalId = null; // Or store it to resume later
            this.isPlaying = false;
            this.isPaused = true;
            console.log("AudioEngine: Playback paused (currently behaves like stop).");
        }
        return true;
    }

    /**
     * Gets the current time of the AudioContext.
     * @returns {number} The current time in seconds.
     */
    getCurrentTime() {
        if (!this.audioContext) {
            console.error("AudioContext not initialized.");
            return 0;
        }
        return this.audioContext.currentTime;
    }

    /**
     * Sets the master volume.
     * @param {number} volumeLevel - Volume level (0.0 to 1.0).
     */
    setMasterVolume(volumeLevel) {
        if (!this.masterGain) {
            console.error("Master gain node not initialized.");
            return;
        }
        const newVolume = Math.max(0, Math.min(1, volumeLevel)); // Clamp between 0 and 1
        this.masterGain.gain.setValueAtTime(newVolume, this.audioContext.currentTime);
        console.log(`Master volume set to ${newVolume}`);
    }

    /**
     * Sets the tracker grid instance for the audio engine to use.
     * @param {object} gridInstance - The instance of the TrackerGrid.
     */
    setTrackerGrid(gridInstance) {
        this.trackerGrid = gridInstance;
        console.log("AudioEngine: TrackerGrid instance received.");
    }
}

// Export the AudioEngine instance
const audioEngine = new AudioEngine();
export default audioEngine;
