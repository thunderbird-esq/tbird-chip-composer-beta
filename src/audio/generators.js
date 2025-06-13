/**
 * @file Sound waveform generators for Thunderbird Chiptune Composer.
 * Provides functions to create basic sound sources like sine, square, sawtooth, triangle, and noise.
 */

/**
 * Creates a GainNode to control the amplitude of a source.
 * @param {AudioContext} audioContext - The AudioContext.
 * @param {number} amplitude - The desired amplitude (0.0 to 1.0).
 * @param {number} startTime - The time to start the amplitude envelope.
 * @param {number} duration - The duration for which the sound will play before stopping.
 * @returns {GainNode} The configured GainNode.
 */
function createAmplitudeEnvelope(audioContext, amplitude = 0.5, startTime, duration) {
    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0, startTime); // Start silent
    gainNode.gain.linearRampToValueAtTime(amplitude, startTime + 0.01); // Quick attack
    gainNode.gain.setValueAtTime(amplitude, startTime + duration - 0.01); // Sustain
    gainNode.gain.linearRampToValueAtTime(0, startTime + duration); // Quick release
    return gainNode;
}

/**
 * Creates a sine wave oscillator.
 * @param {AudioContext} audioContext - The AudioContext.
 * @param {number} frequency - The frequency of the wave in Hz.
 * @param {number} startTime - The AudioContext time to start playing.
 * @param {number} duration - The duration the note should play in seconds.
 * @param {number} [amplitude=0.5] - The amplitude of the wave (0.0 to 1.0).
 * @returns {OscillatorNode} The configured OscillatorNode, already connected to an amplitude envelope.
 */
export function createSineWave(audioContext, frequency = 440, startTime, duration, amplitude = 0.5) {
    if (!audioContext) throw new Error("AudioContext is required.");
    if (startTime === undefined || duration === undefined) throw new Error("startTime and duration are required.");

    const oscillator = audioContext.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, startTime);

    const amplitudeEnvelope = createAmplitudeEnvelope(audioContext, amplitude, startTime, duration);
    oscillator.connect(amplitudeEnvelope);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);

    // The output of this function will be the amplitude envelope,
    // which can then be connected to other effects or the master gain.
    return amplitudeEnvelope;
}

/**
 * Creates a square wave oscillator.
 * @param {AudioContext} audioContext - The AudioContext.
 * @param {number} frequency - The frequency of the wave in Hz.
 * @param {number} startTime - The AudioContext time to start playing.
 * @param {number} duration - The duration the note should play in seconds.
 * @param {number} [amplitude=0.5] - The amplitude of the wave (0.0 to 1.0).
 * @returns {OscillatorNode} The configured OscillatorNode, connected to an amplitude envelope.
 */
export function createSquareWave(audioContext, frequency = 440, startTime, duration, amplitude = 0.5) {
    if (!audioContext) throw new Error("AudioContext is required.");
    if (startTime === undefined || duration === undefined) throw new Error("startTime and duration are required.");

    const oscillator = audioContext.createOscillator();
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(frequency, startTime);

    const amplitudeEnvelope = createAmplitudeEnvelope(audioContext, amplitude, startTime, duration);
    oscillator.connect(amplitudeEnvelope);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);

    return amplitudeEnvelope;
}

/**
 * Creates a sawtooth wave oscillator.
 * @param {AudioContext} audioContext - The AudioContext.
 * @param {number} frequency - The frequency of the wave in Hz.
 * @param {number} startTime - The AudioContext time to start playing.
 * @param {number} duration - The duration the note should play in seconds.
 * @param {number} [amplitude=0.5] - The amplitude of the wave (0.0 to 1.0).
 * @returns {OscillatorNode} The configured OscillatorNode, connected to an amplitude envelope.
 */
export function createSawtoothWave(audioContext, frequency = 440, startTime, duration, amplitude = 0.5) {
    if (!audioContext) throw new Error("AudioContext is required.");
    if (startTime === undefined || duration === undefined) throw new Error("startTime and duration are required.");

    const oscillator = audioContext.createOscillator();
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(frequency, startTime);

    const amplitudeEnvelope = createAmplitudeEnvelope(audioContext, amplitude, startTime, duration);
    oscillator.connect(amplitudeEnvelope);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);

    return amplitudeEnvelope;
}

/**
 * Creates a triangle wave oscillator.
 * @param {AudioContext} audioContext - The AudioContext.
 * @param {number} frequency - The frequency of the wave in Hz.
 * @param {number} startTime - The AudioContext time to start playing.
 * @param {number} duration - The duration the note should play in seconds.
 * @param {number} [amplitude=0.5] - The amplitude of the wave (0.0 to 1.0).
 * @returns {OscillatorNode} The configured OscillatorNode, connected to an amplitude envelope.
 */
export function createTriangleWave(audioContext, frequency = 440, startTime, duration, amplitude = 0.5) {
    if (!audioContext) throw new Error("AudioContext is required.");
    if (startTime === undefined || duration === undefined) throw new Error("startTime and duration are required.");

    const oscillator = audioContext.createOscillator();
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(frequency, startTime);

    const amplitudeEnvelope = createAmplitudeEnvelope(audioContext, amplitude, startTime, duration);
    oscillator.connect(amplitudeEnvelope);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);

    return amplitudeEnvelope;
}

/**
 * Creates a white noise source.
 * @param {AudioContext} audioContext - The AudioContext.
 * @param {number} startTime - The AudioContext time to start playing.
 * @param {number} duration - The duration the noise should play in seconds.
 * @param {number} [amplitude=0.3] - The amplitude of the noise (0.0 to 1.0).
 * @returns {AudioBufferSourceNode} The configured AudioBufferSourceNode, connected to an amplitude envelope.
 */
export function createNoise(audioContext, startTime, duration, amplitude = 0.3) {
    if (!audioContext) throw new Error("AudioContext is required.");
    if (startTime === undefined || duration === undefined) throw new Error("startTime and duration are required.");

    const bufferSize = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1; // Generate random samples between -1 and 1
    }

    const noiseSource = audioContext.createBufferSource();
    noiseSource.buffer = buffer;

    const amplitudeEnvelope = createAmplitudeEnvelope(audioContext, amplitude, startTime, duration);
    noiseSource.connect(amplitudeEnvelope);

    noiseSource.start(startTime);
    noiseSource.stop(startTime + duration); // Ensure the source itself stops

    return amplitudeEnvelope;
}

// Example of how these might be grouped if preferred:
// export const Generators = {
//     createSineWave,
//     createSquareWave,
//     createSawtoothWave,
//     createTriangleWave,
//     createNoise,
// };
