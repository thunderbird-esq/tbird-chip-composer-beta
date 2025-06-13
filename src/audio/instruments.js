/**
 * @file Instrument definitions for Thunderbird Chiptune Composer.
 * Defines how different instruments sound and behave, utilizing sound generators.
 */

import * as Generators from './generators.js';

class Instrument {
    /**
     * Creates an instance of an Instrument.
     * @param {AudioContext} audioContext - The global AudioContext.
     * @param {object} config - Configuration for the instrument.
     * @param {string} config.name - Name of the instrument.
     * @param {string} config.waveformType - Type of waveform (e.g., 'sine', 'square', 'noise').
     * @param {object} [config.generatorParams={}] - Default parameters for the waveform generator.
     * @param {number} [config.generatorParams.amplitude=0.5] - Default amplitude.
     * @param {Array} [config.effectsChain=[]] - Placeholder for an array of effect nodes or configurations.
     */
    constructor(audioContext, config) {
        if (!audioContext) {
            throw new Error("AudioContext is required to create an Instrument.");
        }
        if (!config || !config.name || !config.waveformType) {
            throw new Error("Instrument configuration must include a name and waveformType.");
        }

        this.audioContext = audioContext;
        this.name = config.name;
        this.waveformType = config.waveformType;
        this.generatorParams = {
            amplitude: 0.5, // Default amplitude
            ...config.generatorParams,
        };
        this.effectsChain = config.effectsChain || []; // Placeholder for effects

        // Validate waveform type
        const generatorFunctionName = `create${this.waveformType.charAt(0).toUpperCase() + this.waveformType.slice(1)}Wave`;
        if (this.waveformType !== 'noise' && !Generators[generatorFunctionName]) {
            const noiseFunctionName = `create${this.waveformType.charAt(0).toUpperCase() + this.waveformType.slice(1)}`;
            if(!Generators[noiseFunctionName]) {
                 throw new Error(`Unsupported waveformType: ${this.waveformType}. No matching generator found in src/audio/generators.js`);
            }
        } else if (this.waveformType === 'noise' && !Generators['createNoise']) {
             throw new Error(`Noise generator 'createNoise' not found in src/audio/generators.js`);
        }
    }

    /**
     * Plays a note using the instrument's configuration.
     * @param {object} noteDetails - Details of the note to play.
     * @param {number} noteDetails.frequency - The frequency of the note in Hz.
     * @param {number} noteDetails.startTime - The AudioContext time to start playing the note.
     * @param {number} noteDetails.duration - The duration of the note in seconds.
     * @param {number} [noteDetails.amplitude] - Amplitude override for this specific note.
     * @param {object} [noteDetails.params] - Additional generator parameter overrides.
     * @returns {AudioNode | null} The final node in the sound chain for this note (e.g., a GainNode) or null if playback failed.
     */
    playNote({ frequency, startTime, duration, amplitude, params = {} }) {
        if (frequency === undefined || startTime === undefined || duration === undefined) {
            console.error("Frequency, startTime, and duration are required to play a note.");
            return null;
        }

        const noteAmplitude = amplitude !== undefined ? amplitude : this.generatorParams.amplitude;
        const finalParams = { ...this.generatorParams, ...params }; // Allow overriding instrument's base params

        let soundSourceNode;

        // Determine the correct generator function name
        // For 'noise', it's createNoise, for others like 'sine', it becomes 'createSineWave'
        let generatorFunctionName;
        if (this.waveformType.toLowerCase() === 'noise') {
            generatorFunctionName = 'createNoise';
        } else {
            generatorFunctionName = `create${this.waveformType.charAt(0).toUpperCase() + this.waveformType.slice(1)}Wave`;
        }


        if (Generators[generatorFunctionName]) {
            if (this.waveformType.toLowerCase() === 'noise') {
                 soundSourceNode = Generators[generatorFunctionName](
                    this.audioContext,
                    startTime,
                    duration,
                    noteAmplitude
                );
            } else {
                soundSourceNode = Generators[generatorFunctionName](
                    this.audioContext,
                    frequency,
                    startTime,
                    duration,
                    noteAmplitude
                );
            }
        } else {
            console.error(`Generator function ${generatorFunctionName} not found for waveform type ${this.waveformType}.`);
            return null;
        }

        if (!soundSourceNode) {
            console.error("Failed to create sound source node.");
            return null;
        }

        // Placeholder for connecting through an effects chain
        let currentNode = soundSourceNode;
        // this.effectsChain.forEach(effect => {
        //     effect.connect(currentNode); // This is a simplified connection logic
        //     currentNode = effect;
        // });

        // For now, connect directly to the audioContext destination (or a master gain eventually)
        // This should ideally go to the audioEngine's masterGain or a track gain.
        // currentNode.connect(this.audioContext.destination);

        // The returned node is the one that should be connected to the next stage (e.g. master gain)
        return currentNode;
    }
}

/**
 * Manages a collection of instruments.
 */
class InstrumentManager {
    constructor(audioContext) {
        this.audioContext = audioContext;
        this.instruments = new Map();
        this._loadDefaultInstruments();
    }

    _loadDefaultInstruments() {
        // Define some default instruments
        this.addInstrument({
            name: 'SimpleSine',
            waveformType: 'sine',
            generatorParams: { amplitude: 0.6 }
        });
        this.addInstrument({
            name: 'SimpleSquare',
            waveformType: 'square',
            generatorParams: { amplitude: 0.4 }
        });
        this.addInstrument({
            name: 'SimpleSawtooth',
            waveformType: 'sawtooth',
            generatorParams: { amplitude: 0.45 }
        });
         this.addInstrument({
            name: 'SimpleTriangle',
            waveformType: 'triangle',
            generatorParams: { amplitude: 0.55 }
        });
        this.addInstrument({
            name: 'WhiteNoiseBurst',
            waveformType: 'noise',
            generatorParams: { amplitude: 0.25 }
        });
    }

    /**
     * Adds a new instrument or updates an existing one.
     * @param {object} config - Instrument configuration (see Instrument constructor).
     */
    addInstrument(config) {
        if (!this.audioContext) {
            console.error("Cannot add instrument: InstrumentManager's AudioContext is not initialized.");
            return;
        }
        const instrument = new Instrument(this.audioContext, config);
        this.instruments.set(instrument.name, instrument);
        console.log(`Instrument "${instrument.name}" added/updated.`);
    }

    /**
     * Retrieves an instrument by its name.
     * @param {string} name - The name of the instrument.
     * @returns {Instrument|undefined} The instrument instance, or undefined if not found.
     */
    getInstrument(name) {
        return this.instruments.get(name);
    }

    /**
     * Lists all available instrument names.
     * @returns {string[]} Array of instrument names.
     */
    listInstrumentNames() {
        return Array.from(this.instruments.keys());
    }
}

// To use instruments, you'll need an AudioContext.
// This module will export the Instrument class and an instance of InstrumentManager.
// The InstrumentManager should ideally be initialized by the AudioEngine or main app controller
// once an AudioContext is available.

export { Instrument, InstrumentManager };

// Example of how it might be initialized and used (in your main app logic):
// import audioEngine from './audio/engine.js';
// import { InstrumentManager } from './audio/instruments.js';
//
// if (audioEngine.init()) {
//     const instrumentManager = new InstrumentManager(audioEngine.audioContext);
//     const sineLead = instrumentManager.getInstrument('SimpleSine');
//     if (sineLead) {
//          const noteOutput = sineLead.playNote({
//              frequency: 440,
//              startTime: audioEngine.getCurrentTime() + 0.1,
//              duration: 0.5,
//          });
//          if (noteOutput) {
//              noteOutput.connect(audioEngine.masterGain); // Connect to master gain
//          }
//     }
// }
