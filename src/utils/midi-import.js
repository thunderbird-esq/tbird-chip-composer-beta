export function parseMIDIFile(arrayBuffer) {
    const dv = new DataView(arrayBuffer);
    if (dv.getUint32(0) !== 0x4d546864) throw new Error('Invalid MIDI header');
    const format = dv.getUint16(8);
    if (format > 1) throw new Error('Unsupported MIDI format');
    // very naive parser: only reads note on events of first track
    const trackOffset = 14;
    if (dv.getUint32(trackOffset) !== 0x4d54726b) throw new Error('Missing track');
    const length = dv.getUint32(trackOffset + 4);
    const trackData = new Uint8Array(arrayBuffer, trackOffset + 8, length);
    let i = 0; let time = 0; const pattern = [];
    let row = [];
    while (i < trackData.length) {
        const delta = trackData[i++];
        time += delta / 96;
        const status = trackData[i++];
        if (status === 0xff) break;
        const note = trackData[i++];
        const vel = trackData[i++];
        if (status === 0x90 && vel > 0) {
            const octave = Math.floor((note - 12) / 12);
            const noteNames = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
            const name = noteNames[note % 12] + '-' + octave;
            row.push({ note: name, instrument: '01', effectCmd: '--', effectVal: '--' });
        }
        if (delta > 0) {
            pattern.push(row);
            row = [];
        }
    }
    return pattern;
}
