/**
 * @file Core audio engine for Thunderbird Chiptune Composer.
 * Handles audio context, sound loading, playback scheduling, and master controls.
 */

class AudioEngine {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        // this.playbackIntervalId = null; // Removed
        this.currentStep = 0;
        this.trackerGrid = null; // To hold a reference to the grid
        this.isPlaying = false;
        this.isPaused = false; // Ensure isPaused is initialized
        this.instruments = new Map();
        this.defaultInstrument = {
            id: 'default',
            name: 'Default ADSR',
            waveform: 'sine',
            attack: 0.02,
            decay: 0.15,
            sustainLevel: 0.7,
            releaseTime: 0.2,
            volume: 0.7 // Default per-instrument volume
        };

        this.bpm = 120;
        this.scheduleAheadTime = 0.1;
        this.nextNoteTime = 0.0;
        this.timerID = null;
        this.noteDuration = 0.15;
        this.maxSteps = 16;
        this.onStepChangeCallback = null;
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
     * @param {number} duration - The duration until the note-off signal (start of release phase).
     * @param {object} instrumentData - The instrument data object to use for this note.
     */
    scheduleNote(noteInfo, time, duration, instrumentData) {
        if (!this.audioContext || this.audioContext.state === 'closed') {
            console.warn("AudioEngine.scheduleNote: AudioContext not available or closed.");
            return;
        }
        if (!noteInfo || typeof noteInfo.pitch !== 'number') {
            console.warn("AudioEngine.scheduleNote: Invalid noteInfo or pitch missing.");
            return;
        }

        const activeInstrument = instrumentData || this.defaultInstrument;
        const instrumentVolume = (activeInstrument.volume !== undefined) ? Math.max(0, Math.min(1, activeInstrument.volume)) : 0.7;
        const noteVelocity = (noteInfo.velocity !== undefined) ? Math.max(0, Math.min(1, noteInfo.velocity)) : 0.7; // Default note velocity

        const peakVolume = instrumentVolume * noteVelocity; // Combined peak volume

        const attack = Math.max(0.001, activeInstrument.attack || 0.01);
        const decay = Math.max(0.001, activeInstrument.decay || 0.1);
        const sustain = Math.max(0, Math.min(1, activeInstrument.sustainLevel === undefined ? 0.7 : activeInstrument.sustainLevel));
        const release = Math.max(0.001, activeInstrument.releaseTime || 0.2);

        const osc = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        osc.type = activeInstrument.waveform || 'sine';
        osc.frequency.setValueAtTime(noteInfo.pitch, time);

        gainNode.connect(this.masterGain);
        osc.connect(gainNode);

        const noteEndTime = time + duration; // Time when note-off occurs / release phase starts

        gainNode.gain.setValueAtTime(0, time); // Initial value
        gainNode.gain.linearRampToValueAtTime(peakVolume, time + attack); // Attack phase
        gainNode.gain.linearRampToValueAtTime(peakVolume * sustain, time + attack + decay); // Decay to sustain level

        // Hold sustain level until noteEndTime if duration is longer than Attack + Decay
        if (noteEndTime > time + attack + decay) {
            gainNode.gain.setValueAtTime(peakVolume * sustain, noteEndTime); // Explicitly set value at start of release
        }
        // For notes shorter than Attack+Decay, the previous ramp will be cut short by this one:
        gainNode.gain.linearRampToValueAtTime(0, noteEndTime + release); // Release phase

        osc.start(time);
        osc.stop(noteEndTime + release + 0.05); // Stop oscillator after release phase + small buffer
        // console.log(`ADSR: A:${attack.toFixed(3)} D:${decay.toFixed(3)} S:${sustain.toFixed(2)} R:${release.toFixed(3)} Vol:${peakVolume.toFixed(2)} NoteOff@${noteEndTime.toFixed(3)} OscStop@${(noteEndTime + release + 0.05).toFixed(3)}`);
    }

    /**
     * Starts the audio scheduler/playback.
     */
    startPlayback() {
        if (this.isPlaying && !this.isPaused) {
            console.log("Playback already started and not paused.");
            return true;
        }
        if (!this.audioContext || this.audioContext.state === 'closed') {
            console.error("AudioEngine.startPlayback: AudioContext not initialized or closed.");
            this.isPlaying = false;
            this.isPaused = false;
            return false;
        }

        const doStart = () => {
            this.isPlaying = true;
            this.isPaused = false;
            if (this.nextNoteTime === 0.0 || this.currentStep === 0) { // Start from beginning or if it's a fresh start
                 this.currentStep = 0;
                 this.nextNoteTime = this.audioContext.currentTime + 0.05; // Start scheduling slightly in the future
            } else {
                // Resuming from pause: nextNoteTime should already be set appropriately relative to audioContext.currentTime
                // Ensure nextNoteTime is not in the past due to long pause.
                this.nextNoteTime = Math.max(this.nextNoteTime, this.audioContext.currentTime + 0.05);
            }
            this.scheduler(); // Start the scheduling loop
            console.log("Playback started/resumed with Web Audio scheduler.");
        };

        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume().then(() => {
                console.log("AudioContext resumed.");
                doStart();
            }).catch(e => {
                console.error("Error resuming AudioContext:", e);
                this.isPlaying = false;
                this.isPaused = false;
                return false; // Indicate failure
            });
        } else {
            doStart();
        }
        return true; // Indicates attempt to start/resume
    }

    /**
     * Calculates the duration of a single step/row in seconds based on BPM.
     * @returns {number} Duration of a step in seconds.
     */
    calculateStepDuration() {
        return 60.0 / this.bpm;
    }

    /**
     * The core scheduling loop that uses setTimeout for precision.
     */
    scheduler() {
        if (!this.isPlaying || this.isPaused) return;

        while (this.nextNoteTime < this.audioContext.currentTime + this.scheduleAheadTime) {
            // console.log(`Scheduling step ${this.currentStep} at ${this.nextNoteTime.toFixed(3)}`);
            this.playStepData(this.currentStep, this.nextNoteTime);

            this.nextNoteTime += this.calculateStepDuration();

            this.currentStep++;
            if (this.currentStep >= this.maxSteps) {
                this.currentStep = 0;
            }
            if (this.onStepChangeCallback) {
                this.onStepChangeCallback(this.currentStep);
            }
        }
        this.timerID = setTimeout(() => this.scheduler(), this.scheduleAheadTime * 1000 / 2);
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

        // const noteDuration = 0.1; // This is now this.noteDuration, set in constructor

        stepData.forEach((trackCell, trackIndex) => {
            const frequency = this.parseNoteString(trackCell.note);

            if (frequency) { // Check if frequency is not null (i.e., valid note string)
                const noteInfo = {
                    pitch: frequency,
                    velocity: 0.5 // Default velocity, could be from grid later
                };
                const instrumentId = trackCell.instrument;
                const activeInstrument = (instrumentId && instrumentId !== '--') ? this.getInstrument(instrumentId) : this.defaultInstrument;
                this.scheduleNote(noteInfo, time, this.noteDuration, activeInstrument);
            }
        });
    }

    /**
     * Parses a note string (e.g., "C-4", "F#-3") into a frequency.
     * @param {string} noteString - The note string to parse.
     * @returns {number|null} The frequency in Hz, or null if parsing fails.
     */
    parseNoteString(noteString) {
        if (!noteString || typeof noteString !== 'string' || noteString.trim() === '---') {
            return null;
        }

        const upperNoteString = noteString.toUpperCase().trim();
        // Expects format like "C-4", "F#-3", "A#-5"
        const match = upperNoteString.match(/^([A-G])([#]?)-([0-9])$/);

        if (!match) {
            // console.warn(`AudioEngine.parseNoteString: Invalid note format: "${noteString}". Expected format like "C-4" or "F#-3".`);
            return null;
        }

        const baseNote = match[1];
        const accidental = match[2]; // "#" or ""
        const octave = parseInt(match[3]);
        const noteName = baseNote + accidental;

        const noteValues = { // Semitones from C
            'C': 0, 'C#': 1,
            'D': 2, 'D#': 3,
            'E': 4,
            'F': 5, 'F#': 6,
            'G': 7, 'G#': 8,
            'A': 9, 'A#': 10,
            'B': 11
        };

        if (!noteValues.hasOwnProperty(noteName)) {
            console.warn(`AudioEngine.parseNoteString: Unknown note name: "${noteName}" in "${noteString}"`);
            return null;
        }

        const semitone = noteValues[noteName];

        // MIDI note number calculation: C4 = 60.
        // C0 = 12, C1 = 24, ..., C4 = 60, C5 = 72
        const midiNote = semitone + (octave * 12) + 12;

        if (midiNote < 0 || midiNote > 127) {
            console.warn(`AudioEngine.parseNoteString: MIDI note ${midiNote} for "${noteString}" is out of typical range 0-127.`);
            return null;
        }

        // Standard reference: A4 = 440 Hz (MIDI note 69)
        const frequency = 440 * Math.pow(2, (midiNote - 69) / 12);
        // console.log(`Parsed "${noteString}" to MIDI: ${midiNote}, Freq: ${frequency.toFixed(2)} Hz`);
        return frequency;
    }


    /**
     * Stops the audio scheduler/playback.
     */
    stopPlayback() {
        clearTimeout(this.timerID);
        this.isPlaying = false;
        this.isPaused = false;
        if (this.onStepChangeCallback) {
            this.onStepChangeCallback(-1); // Signal to clear playing row highlight
        }
        this.currentStep = 0;
        this.nextNoteTime = 0.0;
        console.log("Playback stopped, Web Audio scheduler timeout cleared.");
        return true;
    }

    /**
     * Pauses playback by stopping the scheduler and noting the paused state.
     */
    pausePlayback() {
        if (!this.isPlaying || this.isPaused) {
            console.log("Playback not active or already paused.");
            return false;
        }
        clearTimeout(this.timerID);
        this.isPaused = true;
        // this.isPlaying remains true, as playback is active but paused
        console.log("Playback paused.");
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
        if (gridInstance) {
            this.maxSteps = gridInstance.numRows || 16;
        }
        console.log(`AudioEngine: TrackerGrid instance received. maxSteps set to ${this.maxSteps}.`);
    }

    /**
     * Loads an instrument configuration into the engine.
     * @param {object} instrumentObject - The instrument definition.
     */
    loadInstrument(instrumentObject) {
        if (instrumentObject && instrumentObject.id) {
            this.instruments.set(instrumentObject.id, instrumentObject);
            console.log(`Instrument '${instrumentObject.name || instrumentObject.id}' (ID: ${instrumentObject.id}) loaded.`);
        } else {
            console.warn('Failed to load instrument: Instrument object or ID is missing.');
        }
    }

    /**
     * Retrieves an instrument configuration by its ID.
     * @param {string} instrumentId - The ID of the instrument.
     * @returns {object} The instrument configuration or the default instrument if not found.
     */
    getInstrument(instrumentId) {
        return this.instruments.get(instrumentId) || this.defaultInstrument;
    }

    /**
     * Sets the Beats Per Minute (BPM) for the sequencer.
     * @param {number} newBPM - The new BPM value.
     */
    setBPM(newBPM) {
        if (typeof newBPM === 'number' && newBPM > 0) {
            this.bpm = newBPM;
            console.log(`AudioEngine: BPM set to ${this.bpm}`);
            // The change will take effect in the scheduler via calculateStepDuration()
        } else {
            console.warn(`AudioEngine.setBPM: Invalid BPM value provided: ${newBPM}`);
        }
    }

    /**
     * Sets a callback function to be invoked when the current playback step changes.
     * @param {function} callback - The function to call. It will receive the current step number.
     */
    setOnStepChange(callback) {
        this.onStepChangeCallback = callback;
    }

    /**
     * Returns an array of all loaded instrument data objects.
     * @returns {Array<object>} Array of instrument data.
     */
    getInstrumentsData() {
        return Array.from(this.instruments.values());
    }

    /**
     * Loads multiple instruments from an array, clearing existing ones.
     * @param {Array<object>} instrumentsArray - An array of instrument data objects.
     */
    loadInstrumentsData(instrumentsArray) {
        this.instruments.clear();
        if (instrumentsArray && Array.isArray(instrumentsArray)) {
            instrumentsArray.forEach(instrData => {
                this.loadInstrument(instrData); // Use existing loadInstrument method
            });
            console.log("AudioEngine: Instruments data loaded from array.");
        } else {
            console.warn("AudioEngine.loadInstrumentsData: Invalid or empty data provided.");
        }
        // Ensure defaultInstrument is available if no instruments were loaded or if it was cleared
        if (!this.instruments.has(this.defaultInstrument.id) && this.defaultInstrument.id !== 'default') {
             // Avoid loading the 'default' instrument if it's just a placeholder name and not a real ID
             // This logic might need refinement based on how 'default' ID is handled.
        } else if (this.instruments.size === 0) {
            // If after loading, no instruments are present (e.g. empty array), ensure default is there.
            // this.loadInstrument(this.defaultInstrument); // This could be added if desired.
            // For now, it's fine if it's empty if user loads an empty set.
        }
    }
}

// Export the AudioEngine instance
const audioEngine = new AudioEngine();
export default audioEngine;
