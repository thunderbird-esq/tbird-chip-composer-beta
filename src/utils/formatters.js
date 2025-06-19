/**
 * @file formatters.js
 * Utility functions for formatting data for display.
 */

/**
 * Converts a MIDI note number to its pitch string representation (e.g., C-4, G#5).
 * @param {number} midiNote - The MIDI note number (0-127).
 * @returns {string} The note string.
 */
export function formatMidiNote(midiNote) {
    if (midiNote < 0 || midiNote > 127) {
        return "---";
    }
    const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const octave = Math.floor(midiNote / 12) - 1; // MIDI C4 is note 60. Octave -1 is standard for C0.
    const noteIndex = midiNote % 12;
    return `${noteNames[noteIndex]}${octave}`;
}

/**
 * Converts a number to a hexadecimal string with a specified padding.
 * @param {number} number - The number to convert.
 * @param {number} padding - The minimum length of the hex string (e.g., 2 for "0F", 4 for "00FF").
 * @returns {string} The uppercase hexadecimal string.
 */
export function formatHex(number, padding = 2) {
    if (typeof number !== 'number' || isNaN(number)) {
        return ".".repeat(padding); // Or some other placeholder for invalid input
    }
    return number.toString(16).toUpperCase().padStart(padding, '0');
}

/**
 * Formats a step number (e.g., for a sequencer track) with leading zeros.
 * @param {number} stepNumber - The step number.
 * @param {number} totalSteps - The total number of steps, used to determine padding. Max 256 for 2 digits, etc.
 * @returns {string} The formatted step number.
 */
export function formatStepNumber(stepNumber, totalSteps = 256) {
    const padding = totalSteps > 999 ? 4 : totalSteps > 99 ? 3 : 2;
    return String(stepNumber).padStart(padding, '0');
}

/**
 * Formats a generic value for display in the grid, handling undefined or null.
 * @param {*} value - The value to format.
 * @param {string} placeholder - Placeholder for undefined/null values (e.g., "---").
 * @returns {string} The formatted value or placeholder.
 */
export function formatGridValue(value, placeholder = "---") {
    if (value === undefined || value === null) {
        return placeholder;
    }
    if (typeof value === 'number') {
        return formatHex(value); // Default to hex for numbers in grid if not specified otherwise
    }
    return String(value);
}

/**
 * Formats a floating point number to a fixed number of decimal places.
 * @param {number} number - The number to format.
 * @param {number} decimalPlaces - The number of decimal places.
 * @returns {string} The formatted number as a string.
 */
export function formatFloat(number, decimalPlaces = 2) {
    if (typeof number !== 'number' || isNaN(number)) {
        return "?.??";
    }
    return number.toFixed(decimalPlaces);
}

// Example usage (can be removed or kept for testing):
// console.log("Note 60:", formatMidiNote(60)); // C4
// console.log("Note 69:", formatMidiNote(69)); // A4
// console.log("Note 21:", formatMidiNote(21)); // A0
// console.log("Hex 15:", formatHex(15)); // 0F
// console.log("Hex 255, padding 4:", formatHex(255, 4)); // 00FF
// console.log("Step 5 of 64:", formatStepNumber(5, 64)); // 05
// console.log("Step 123 of 1024:", formatStepNumber(123, 1024)); // 123 (will be 0123 with 4 padding if totalSteps >= 1000)
// console.log("Grid Value (undefined):", formatGridValue(undefined)); // ---
// console.log("Grid Value (number 10):", formatGridValue(10)); // 0A
// console.log("Float value:", formatFloat(3.14159265, 3)); // 3.142
