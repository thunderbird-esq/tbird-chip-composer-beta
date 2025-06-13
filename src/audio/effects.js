/**
 * @file Audio effect processors for Thunderbird Chiptune Composer.
 * Provides functions to create various audio effects like delay, filter, distortion.
 */

/**
 * Creates a delay effect.
 * @param {AudioContext} audioContext - The AudioContext.
 * @param {number} [delayTime=0.5] - The delay time in seconds.
 * @param {number} [feedback=0.3] - The feedback amount (0.0 to <1.0).
 * @returns {{input: DelayNode, output: GainNode, delayNode: DelayNode, feedbackNode: GainNode}}
 *          An object containing the input node (the DelayNode itself), the output node (the feedback GainNode,
 *          so the original signal and delay are mixed), and the individual nodes for more complex routing if needed.
 *          The main signal should be connected to `input`, and take output from `output`.
 */
export function createDelay(audioContext, delayTime = 0.5, feedback = 0.3) {
    if (!audioContext) throw new Error("AudioContext is required for createDelay.");

    const delayNode = audioContext.createDelay(Math.max(0, delayTime)); // Max delay time can be set if needed
    delayNode.delayTime.setValueAtTime(Math.max(0, delayTime), audioContext.currentTime);

    const feedbackNode = audioContext.createGain();
    feedbackNode.gain.setValueAtTime(Math.max(0, Math.min(0.99, feedback)), audioContext.currentTime); // Feedback shouldn't be 1 or more

    // Wiring: input -> delayNode -> feedbackNode -> delayNode (feedback loop)
    //                -> output (wet signal)
    // The dry signal needs to be mixed separately if desired. This effect returns the wet signal path.
    // A common pattern is: source -> gain (dry) -> destination
    //                     source -> delay.input; delay.output -> destination

    delayNode.connect(feedbackNode);
    feedbackNode.connect(delayNode); // This creates the feedback loop

    // For flexibility, we return the delayNode as input, and feedbackNode as output.
    // This means whatever is connected to 'output' gets the delayed signal.
    // To mix dry/wet, you'd connect your original source to the delay's input,
    // then connect BOTH your original source (or a gain from it) AND the delay's output
    // to a common destination (like another gain node or the master).

    // This setup returns the "wet" part of the signal path.
    // The user of this function will need to handle mixing dry and wet signals.
    // Typically, an input node is provided, and an output node is provided.
    // Let's refine this to a more standard effects unit pattern:
    // Input -> Delay -> Output (wet signal)
    //         `-> Feedback -> Delay (for the loop)

    const inputGain = audioContext.createGain(); // Acts as the input point for the effect unit
    const outputGain = audioContext.createGain(); // Acts as the output point for the effect unit (wet signal)

    inputGain.connect(delayNode);
    delayNode.connect(outputGain); // The direct delayed signal
    delayNode.connect(feedbackNode); // Also send to feedback loop
    feedbackNode.connect(delayNode); // Feedback loop connection

    return {
        input: inputGain,    // Connect source here
        output: outputGain,  // Take wet signal from here
        delayNode,           // For direct manipulation if needed
        feedbackNode,        // For direct manipulation if needed
        setDelayTime: (time) => delayNode.delayTime.setValueAtTime(Math.max(0, time), audioContext.currentTime),
        setFeedback: (level) => feedbackNode.gain.setValueAtTime(Math.max(0, Math.min(0.99, level)), audioContext.currentTime),
    };
}

/**
 * Creates a BiquadFilter effect.
 * @param {AudioContext} audioContext - The AudioContext.
 * @param {BiquadFilterType} [type='lowpass'] - The type of filter (e.g., 'lowpass', 'highpass', 'bandpass').
 * @param {number} [frequency=1000] - The cutoff or center frequency in Hz.
 * @param {number} [q=1] - The Q factor (quality factor).
 * @returns {{input: BiquadFilterNode, output: BiquadFilterNode, filterNode: BiquadFilterNode}}
 *          The BiquadFilterNode itself, as it serves as both input and output.
 *          'input' and 'output' are the same node.
 */
export function createFilter(audioContext, type = 'lowpass', frequency = 1000, q = 1) {
    if (!audioContext) throw new Error("AudioContext is required for createFilter.");

    const filterNode = audioContext.createBiquadFilter();
    filterNode.type = type;
    filterNode.frequency.setValueAtTime(frequency, audioContext.currentTime);
    filterNode.Q.setValueAtTime(q, audioContext.currentTime);

    return {
        input: filterNode, // Connect source to filterNode
        output: filterNode, // Take filtered signal from filterNode
        filterNode, // For direct manipulation
        setType: (newType) => filterNode.type = newType,
        setFrequency: (freq) => filterNode.frequency.setValueAtTime(freq, audioContext.currentTime),
        setQ: (newQ) => filterNode.Q.setValueAtTime(newQ, audioContext.currentTime),
    };
}

/**
 * Creates a distortion effect using a WaveShaperNode.
 * @param {AudioContext} audioContext - The AudioContext.
 * @param {number} [amount=50] - The amount of distortion (controls curve intensity). Min: 0 (no distortion)
 * @returns {{input: WaveShaperNode, output: WaveShaperNode, shaperNode: WaveShaperNode}}
 *          The WaveShaperNode itself. 'input' and 'output' are the same node.
 */
export function createDistortion(audioContext, amount = 50) {
    if (!audioContext) throw new Error("AudioContext is required for createDistortion.");

    const shaperNode = audioContext.createWaveShaper();

    function makeDistortionCurve(distAmount) {
        const k = typeof distAmount === 'number' ? Math.max(0, distAmount) : 50; // Ensure k is non-negative
        const n_samples = 44100; // Number of samples in the curve
        const curve = new Float32Array(n_samples);
        const deg = Math.PI / 180;

        if (k === 0) { // No distortion, linear curve
            for (let i = 0; i < n_samples; ++i) {
                const x = i * 2 / n_samples - 1;
                curve[i] = x;
            }
        } else {
            for (let i = 0; i < n_samples; ++i) {
                const x = i * 2 / n_samples - 1; // x is in [-1, 1]
                curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
            }
        }
        return curve;
    }

    shaperNode.curve = makeDistortionCurve(amount);
    shaperNode.oversample = '4x'; // 'none', '2x', '4x'

    return {
        input: shaperNode, // Connect source to shaperNode
        output: shaperNode, // Take distorted signal from shaperNode
        shaperNode, // For direct manipulation
        setAmount: (newAmount) => {
            shaperNode.curve = makeDistortionCurve(newAmount);
        }
    };
}

// Example of how these might be used:
// import audioEngine from './engine.js'; // Assuming engine.js exports an initialized audioEngine
// import { createDelay, createFilter, createDistortion } from './effects.js';
//
// if (audioEngine.audioContext) {
//     const ctx = audioEngine.audioContext;
//
//     // Create a source (e.g., from an instrument)
//     // const mySoundSource = ...;
//
//     // Create effects
//     const delayEffect = createDelay(ctx, 0.3, 0.4);
//     const filterEffect = createFilter(ctx, 'lowpass', 800, 5);
//     const distortionEffect = createDistortion(ctx, 30);
//
//     // Connect them in a chain: source -> distortion -> filter -> delay -> destination
//     // mySoundSource.connect(distortionEffect.input);
//     // distortionEffect.output.connect(filterEffect.input);
//     // filterEffect.output.connect(delayEffect.input); // This is the dry signal path for the delay
//
//     // To mix dry/wet for delay:
//     // const masterGain = ctx.createGain();
//     // filterEffect.output.connect(masterGain); // Dry path to master
//     // delayEffect.output.connect(masterGain);    // Wet path from delay to master
//     // masterGain.connect(audioEngine.masterGain);
//
//     // Or, if the source is simple and delay is the last effect:
//     // mySoundSource.connect(distortionEffect.input);
//     // distortionEffect.output.connect(filterEffect.input);
//     // filterEffect.output.connect(delayEffect.input);
//     // delayEffect.output.connect(audioEngine.masterGain); // Connect wet signal
//     // To add dry signal: filterEffect.output.connect(audioEngine.masterGain); // also connect dry part
// }
