/**
 * @file midi-import.js
 * Utility functions for importing Standard MIDI Files (SMF).
 */

// Constants for MIDI event types
const MIDI_EVENT_TYPES = {
    NOTE_OFF: 0x80,
    NOTE_ON: 0x90,
    SET_TEMPO: 0x51, // Meta event
    END_OF_TRACK: 0x2F, // Meta event
    META_EVENT: 0xFF,
    SYSEX_EVENT: 0xF0,
    SYSEX_EVENT_END: 0xF7, // Also known as EOX (End of Exclusive)
};

/**
 * Parses MIDI file data (ArrayBuffer).
 * @param {ArrayBuffer} arrayBuffer - The MIDI file data.
 * @returns {object|null} An object representing the parsed MIDI data, or null on error.
 * The structure will be:
 * {
 *   format: number (0, 1, or 2),
 *   ppqn: number (pulses per quarter note),
 *   tracks: [
 *     [ // Array of events for track 1
 *       { deltaTime: number, type: string, channel?: number, noteNumber?: number, velocity?: number, tempo?: number, data?: Uint8Array }
 *     ],
 *     // ... more tracks
 *   ]
 * }
 */
export function parseMidiFile(arrayBuffer) {
    const dataView = new DataView(arrayBuffer);
    let offset = 0;

    function readBytes(length) {
        const bytes = new Uint8Array(arrayBuffer, offset, length);
        offset += length;
        return bytes;
    }

    function readString(length) {
        const bytes = readBytes(length);
        return String.fromCharCode.apply(null, bytes);
    }

    function readUint8() {
        const val = dataView.getUint8(offset);
        offset += 1;
        return val;
    }

    function readUint16() {
        const val = dataView.getUint16(offset, false); // MIDI files are big-endian
        offset += 2;
        return val;
    }

    function readUint32() {
        const val = dataView.getUint32(offset, false); // Big-endian
        offset += 4;
        return val;
    }

    function readVariableLengthQuantity() {
        let value = 0;
        let byte;
        do {
            byte = readUint8();
            value = (value << 7) | (byte & 0x7F);
        } while (byte & 0x80);
        return value;
    }

    // Header Chunk
    if (readString(4) !== "MThd") {
        console.error("Invalid MIDI file: Missing MThd header.");
        return null;
    }
    const headerLength = readUint32();
    if (headerLength !== 6) {
        console.error("Invalid MIDI header length.");
        return null;
    }

    const format = readUint16();
    const numberOfTracks = readUint16();
    const division = readUint16(); // This is PPQN (Pulses Per Quarter Note) if MSB is 0

    let ppqn;
    if (division & 0x8000) {
        // SMTPE format (frames per second), not typically used for chiptunes, more complex.
        // For simplicity, we'll primarily support PPQN.
        console.warn("SMTPE time division format detected, which is not fully supported by this basic parser.");
        // Frames per second (top byte) and ticks per frame (bottom byte)
        const framesPerSecond = (division & 0x7F00) >> 8;
        const ticksPerFrame = division & 0x00FF;
        ppqn = framesPerSecond * ticksPerFrame; // Approximate PPQN, or handle as special case
    } else {
        ppqn = division;
    }

    const parsedTracks = [];
    let lastEventType = 0; // For running status

    for (let i = 0; i < numberOfTracks; i++) {
        if (offset >= dataView.byteLength) {
             console.warn(`Track ${i+1} header expected but EOF reached.`);
             break;
        }
        if (readString(4) !== "MTrk") {
            console.error(`Invalid MIDI track header for track ${i + 1}.`);
            // Skip this track or return null
            // For robustness, we might try to find the next MTrk, but for now, assume valid structure or fail.
            return null;
        }
        const trackLength = readUint32();
        const trackEndOffset = offset + trackLength;
        const currentTrackEvents = [];

        while (offset < trackEndOffset) {
            const deltaTime = readVariableLengthQuantity();
            let eventType = readUint8();
            let event = { deltaTime };

            if ((eventType & 0xF0) !== 0xF0) { // Not a meta or sysex event
                 // Check for running status
                if ((eventType & 0x80) === 0) { // MSB is 0, so it's running status
                    event.dataByte1 = eventType; // This byte is actually the first data byte
                    eventType = lastEventType;   // Re-use the last event type
                } else {
                    event.dataByte1 = readUint8();
                    lastEventType = eventType;
                }
            }


            const eventCategory = eventType & 0xF0;
            const channel = eventType & 0x0F;

            switch (eventCategory) {
                case MIDI_EVENT_TYPES.NOTE_OFF:
                    event.type = "NoteOff";
                    event.channel = channel;
                    event.noteNumber = event.dataByte1; // Was dataByte1 from running status logic
                    event.velocity = readUint8();
                    break;
                case MIDI_EVENT_TYPES.NOTE_ON:
                    event.channel = channel;
                    event.noteNumber = event.dataByte1; // Was dataByte1
                    const velocity = readUint8();
                    if (velocity === 0) {
                        event.type = "NoteOff"; // NoteOn with velocity 0 is often treated as NoteOff
                    } else {
                        event.type = "NoteOn";
                    }
                    event.velocity = velocity;
                    break;
                // Add other channel events here if needed (Polyphonic Key Pressure, Control Change, Program Change, etc.)
                // For chiptune, NoteOn/Off are most critical.
                // Example for Control Change (0xB0):
                // case 0xB0: // Control Change
                //     event.type = "ControlChange";
                //     event.channel = channel;
                //     event.controllerNumber = event.dataByte1;
                //     event.controllerValue = readUint8();
                //     break;


                default: // Could be Meta event (0xFF) or Sysex (0xF0, 0xF7)
                    if (eventType === MIDI_EVENT_TYPES.META_EVENT) {
                        const metaType = readUint8();
                        const metaLength = readVariableLengthQuantity();
                        switch (metaType) {
                            case MIDI_EVENT_TYPES.SET_TEMPO:
                                event.type = "SetTempo";
                                // Tempo is 3 bytes, microseconds per quarter note
                                event.tempo = (readUint8() << 16) | (readUint8() << 8) | readUint8();
                                break;
                            case MIDI_EVENT_TYPES.END_OF_TRACK:
                                event.type = "EndOfTrack";
                                // No further data for EOT
                                break;
                            // Add other meta events if needed (Time Signature, Key Signature, etc.)
                            default:
                                event.type = "MetaUnknown";
                                event.metaType = metaType;
                                event.data = readBytes(metaLength); // Read and store unknown meta data
                                break;
                        }
                    } else if (eventType === MIDI_EVENT_TYPES.SYSEX_EVENT || eventType === MIDI_EVENT_TYPES.SYSEX_EVENT_END) {
                        event.type = eventType === MIDI_EVENT_TYPES.SYSEX_EVENT ? "SysEx" : "SysExEnd";
                        const sysexLength = readVariableLengthQuantity();
                        event.data = readBytes(sysexLength);
                        // For SysEx, lastEventType is not updated because SysEx messages can be split.
                    } else {
                        // This case handles the running status where eventType was dataByte1
                        // We should have already processed it if it was a channel message.
                        // If it's an unrecognized event type, log it.
                        console.warn(`Unknown MIDI event type: ${eventType.toString(16)} at offset ${offset-1}. This might be due to running status data being misinterpreted.`);
                        // To prevent infinite loops on malformed data, try to skip based on a guess or track length.
                        // This part can be tricky. For now, we assume valid MIDI or the track ends.
                        // If it's truly unknown and not running status, it might be better to skip the rest of the track.
                        event.type = "Unknown";
                        // To be safe, we might consume the rest of the track if an unknown event is truly hit.
                        // offset = trackEndOffset; // Force end of track processing
                    }
                    break;
            }
            currentTrackEvents.push(event);

            // Ensure we don't read past the declared track length, especially if an error occurs
            if (offset >= trackEndOffset && event.type !== "EndOfTrack") {
                 if(currentTrackEvents[currentTrackEvents.length-1].type !== "EndOfTrack") {
                    currentTrackEvents.push({ deltaTime: 0, type: "EndOfTrack", warning: "Manually added EOT due to offset exceeding track length."});
                }
            }
        }
        parsedTracks.push(currentTrackEvents);
    }

    return {
        format,
        ppqn,
        tracks: parsedTracks,
    };
}

// Example usage (conceptual):
// async function handleMidiUpload(file) {
//     if (!file) return;
//     const arrayBuffer = await file.arrayBuffer();
//     const songData = parseMidiFile(arrayBuffer);
//     if (songData) {
//         console.log("MIDI Parsed:", songData);
//         // Convert songData to your application's internal format
//         // E.g., convertToInternalFormat(songData);
//     } else {
//         console.error("Failed to parse MIDI file.");
//     }
// }
