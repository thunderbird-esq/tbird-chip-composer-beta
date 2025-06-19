/**
 * @file midi-export.js
 * Utility functions for exporting data to Standard MIDI Files (SMF).
 */

// Constants from midi-import.js might be useful or redefined here if not sharing.
const MIDI_EVENT_TYPES = {
    NOTE_OFF: 0x80,
    NOTE_ON: 0x90,
    SET_TEMPO: 0x51,    // Meta event
    END_OF_TRACK: 0x2F, // Meta event
    META_EVENT: 0xFF,
    PROGRAM_CHANGE: 0xC0, // Added for instrument selection if needed
    CONTROL_CHANGE: 0xB0, // Added for control messages if needed
    TIME_SIGNATURE: 0x58, // Meta event for time signature
};

/**
 * Writes a variable-length quantity to a Uint8Array.
 * @param {number} value - The number to write.
 * @param {Uint8Array} byteArray - The array to write to.
 * @param {number} offset - The offset in the array to start writing.
 * @returns {number} The new offset after writing.
 */
function writeVariableLengthQuantity(value, byteArray, offset) {
    let buffer = value & 0x7F;
    while ((value >>= 7) > 0) {
        buffer <<= 8;
        buffer |= ((value & 0x7F) | 0x80);
    }
    let newOffset = offset;
    while (true) {
        byteArray[newOffset++] = buffer & 0xFF;
        if (buffer & 0x80) {
            buffer >>= 8;
        } else {
            break;
        }
    }
    return newOffset;
}

/**
 * Converts an internal song representation to a MIDI file (ArrayBuffer).
 *
 * @param {object} songData - The internal song data. Expected structure:
 *   {
 *     ppqn: number, // Pulses per quarter note (e.g., 96, 120, 480)
 *     tempo: number, // Beats per minute (will be converted to microseconds per quarter note)
 *     timeSignature: { numerator: number, denominator: number }, // e.g., { numerator: 4, denominator: 4 }
 *     tracks: [
 *       { // Each track is an array of events
 *         instrument: { channel: number, program: number }, // Optional: program change for instrument
 *         events: [
 *           // Note event: { time: number (in ticks), type: "note", pitch: number, duration: number (in ticks), velocity: number (0-127) }
 *           // Tempo event (usually on track 0): { time: number (in ticks), type: "tempo", bpm: number }
 *           // Other events can be added if necessary
 *         ]
 *       }
 *     ]
 *   }
 * @returns {ArrayBuffer|null} An ArrayBuffer containing the MIDI file data, or null on error.
 */
export function exportSongToMidi(songData) {
    if (!songData || !songData.tracks || !songData.ppqn) {
        console.error("Invalid song data for MIDI export.");
        return null;
    }

    const ppqn = songData.ppqn;
    // Default tempo if not provided in track 0, or use a global songData.tempo
    const globalTempoBPM = songData.tempo || 120;
    const globalTimeSignature = songData.timeSignature || { numerator: 4, denominator: 4 };


    // Helper to convert string to byte array
    function stringToBytes(str) {
        const bytes = [];
        for (let i = 0; i < str.length; i++) {
            bytes.push(str.charCodeAt(i));
        }
        return bytes;
    }

    // Calculate microseconds per quarter note for tempo events
    function bpmToMicrosecondsPerQuarterNote(bpm) {
        return Math.round(60000000 / bpm);
    }

    let totalSize = 0;
    const trackChunks = [];

    songData.tracks.forEach((track, trackIndex) => {
        const trackEventBytes = []; // Temporary array for this track's event data
        let currentOffset = 0;

        // Utility to add bytes to trackEventBytes and update currentOffset
        function addBytes(arr) {
            arr.forEach(b => trackEventBytes.push(b));
            currentOffset += arr.length;
        }
        function addUint8(val) { addBytes([val]); }
        function addUint16(val) { addBytes([(val >> 8) & 0xFF, val & 0xFF]); }
        function addUint32(val) { addBytes([(val >> 24) & 0xFF, (val >> 16) & 0xFF, (val >> 8) & 0xFF, val & 0xFF]); }

        function addVariableLength(val) {
            const tempArr = new Uint8Array(4); // Max 4 bytes for VLQ
            const newLength = writeVariableLengthQuantity(val, tempArr, 0);
            for(let k=0; k < newLength; k++) {
                trackEventBytes.push(tempArr[k]);
            }
            currentOffset += newLength;
        }


        // Sort events by time for correct delta time calculation
        const sortedEvents = [...(track.events || [])].sort((a, b) => a.time - b.time);
        let lastEventTime = 0;

        // Add initial track events (like Program Change if specified for the track)
        if (track.instrument && typeof track.instrument.channel === 'number' && typeof track.instrument.program === 'number') {
            addVariableLength(0); // Delta time 0
            addUint8(MIDI_EVENT_TYPES.PROGRAM_CHANGE | track.instrument.channel);
            addUint8(track.instrument.program); // Program number
        }

        // Add initial Time Signature and Tempo for the first track (MIDI convention)
        if (trackIndex === 0) {
            // Time Signature Event
            addVariableLength(0); // Delta time 0
            addUint8(MIDI_EVENT_TYPES.META_EVENT);
            addUint8(MIDI_EVENT_TYPES.TIME_SIGNATURE);
            addVariableLength(4); // Length of meta message
            addUint8(globalTimeSignature.numerator);
            addUint8(Math.log2(globalTimeSignature.denominator)); // Denominator as power of 2 (e.g., 2 for quarter, 3 for eighth)
            addUint8(Math.round(ppqn / 4)); // MIDI clocks per metronome click (often 24, but depends on ppqn)
            addUint8(8); // Number of 32nd notes per beat (usually 8 for standard quarter note beat)

            // Set Tempo Event
            addVariableLength(0); // Delta time 0
            addUint8(MIDI_EVENT_TYPES.META_EVENT);
            addUint8(MIDI_EVENT_TYPES.SET_TEMPO);
            addVariableLength(3); // Length
            const tempoMicroseconds = bpmToMicrosecondsPerQuarterNote(globalTempoBPM);
            addUint8((tempoMicroseconds >> 16) & 0xFF);
            addUint8((tempoMicroseconds >> 8) & 0xFF);
            addUint8(tempoMicroseconds & 0xFF);
        }


        const midiEvents = [];
        sortedEvents.forEach(event => {
            if (event.type === "note") {
                midiEvents.push({ time: event.time, type: MIDI_EVENT_TYPES.NOTE_ON, pitch: event.pitch, velocity: event.velocity, channel: track.instrument?.channel || 0 });
                midiEvents.push({ time: event.time + event.duration, type: MIDI_EVENT_TYPES.NOTE_OFF, pitch: event.pitch, velocity: 0, channel: track.instrument?.channel || 0 });
            } else if (event.type === "tempo" && trackIndex === 0) { // Tempo events typically on track 0
                 midiEvents.push({ time: event.time, type: "SetTempoMeta", bpm: event.bpm });
            }
            // Add other event types from internal format to MIDI events if necessary
        });

        midiEvents.sort((a, b) => a.time - b.time); // Sort all, including NoteOffs

        midiEvents.forEach(event => {
            const deltaTime = event.time - lastEventTime;
            addVariableLength(deltaTime);

            if (event.type === MIDI_EVENT_TYPES.NOTE_ON) {
                addUint8(MIDI_EVENT_TYPES.NOTE_ON | (event.channel & 0x0F));
                addUint8(event.pitch & 0x7F);
                addUint8(event.velocity & 0x7F);
            } else if (event.type === MIDI_EVENT_TYPES.NOTE_OFF) {
                addUint8(MIDI_EVENT_TYPES.NOTE_OFF | (event.channel & 0x0F));
                addUint8(event.pitch & 0x7F);
                addUint8(event.velocity & 0x7F); // Or fixed 0 for NoteOff
            } else if (event.type === "SetTempoMeta") {
                addUint8(MIDI_EVENT_TYPES.META_EVENT);
                addUint8(MIDI_EVENT_TYPES.SET_TEMPO);
                addVariableLength(3);
                const tempoMicroseconds = bpmToMicrosecondsPerQuarterNote(event.bpm);
                addUint8((tempoMicroseconds >> 16) & 0xFF);
                addUint8((tempoMicroseconds >> 8) & 0xFF);
                addUint8(tempoMicroseconds & 0xFF);
            }
            lastEventTime = event.time;
        });

        // End of Track event
        addVariableLength(0); // Typically 0, or time from last event to end of track
        addUint8(MIDI_EVENT_TYPES.META_EVENT);
        addUint8(MIDI_EVENT_TYPES.END_OF_TRACK);
        addVariableLength(0); // Length of EOT meta message is 0

        // Create track chunk
        const trackHeader = stringToBytes("MTrk");
        const trackLengthBytes = [
            (currentOffset >> 24) & 0xFF,
            (currentOffset >> 16) & 0xFF,
            (currentOffset >> 8) & 0xFF,
            currentOffset & 0xFF,
        ];
        trackChunks.push(new Uint8Array([...trackHeader, ...trackLengthBytes, ...trackEventBytes]));
        totalSize += 8 + currentOffset; // 4 for 'MTrk', 4 for length, plus data
    });

    // MIDI Header
    const headerChunk = new Uint8Array([
        ...stringToBytes("MThd"),
        0, 0, 0, 6, // Header length (always 6)
        0, songData.tracks.length > 1 ? 1 : 0, // Format (0 for single track, 1 for multi-track)
        (songData.tracks.length >> 8) & 0xFF, songData.tracks.length & 0xFF, // Number of tracks
        (ppqn >> 8) & 0xFF, ppqn & 0xFF, // Division (PPQN)
    ]);
    totalSize += headerChunk.length;

    // Concatenate all chunks
    const finalMidiBytes = new Uint8Array(totalSize);
    let currentPosition = 0;
    finalMidiBytes.set(headerChunk, currentPosition);
    currentPosition += headerChunk.length;

    trackChunks.forEach(chunk => {
        finalMidiBytes.set(chunk, currentPosition);
        currentPosition += chunk.length;
    });

    return finalMidiBytes.buffer;
}


/**
 * Triggers a browser download for the given ArrayBuffer as a MIDI file.
 * (This function could be in file-io.js and imported if preferred)
 * @param {ArrayBuffer} midiBuffer - The MIDI file data as an ArrayBuffer.
 * @param {string} fileName - The suggested name for the downloaded file.
 */
export function downloadMidiFile(midiBuffer, fileName = "export.mid") {
    if (!midiBuffer) {
        console.error("No MIDI data to download.");
        alert("Error: No MIDI data to download.");
        return;
    }
    const blob = new Blob([midiBuffer], { type: "audio/midi" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}


// Example Usage (conceptual):
// function handleExport() {
//     const mySongData = {
//         ppqn: 480,
//         tempo: 120, // Global tempo for track 0 meta event
//         timeSignature: { numerator: 4, denominator: 4 },
//         tracks: [
//             { // Track 0 - often for tempo/meta, but can have notes
//               instrument: { channel: 0, program: 0 }, // Example: Acoustic Grand Piano on channel 0
//               events: [
//                   // Tempo event already handled by global songData.tempo for track 0
//                   { time: 0, type: "note", pitch: 60, duration: 480, velocity: 90 }, // C4 for 1 beat
//                   { time: 480, type: "note", pitch: 62, duration: 480, velocity: 90 }, // D4 for 1 beat
//                   { time: 960, type: "note", pitch: 64, duration: 960, velocity: 90 }, // E4 for 2 beats
//               ]
//             },
//             { // Track 1
//               instrument: { channel: 1, program: 32 }, // Example: Acoustic Bass on channel 1
//               events: [
//                   { time: 0, type: "note", pitch: 36, duration: 960, velocity: 80 },   // C2 for 2 beats
//                   { time: 960, type: "note", pitch: 40, duration: 960, velocity: 80 }, // E2 for 2 beats
//               ]
//             }
//         ]
//     };
//     const midiFileBuffer = exportSongToMidi(mySongData);
//     if (midiFileBuffer) {
//         downloadMidiFile(midiFileBuffer, "my-chiptune-export.mid");
//     }
// }
// handleExport(); // For testing
