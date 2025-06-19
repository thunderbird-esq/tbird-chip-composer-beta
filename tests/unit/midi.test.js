import { patternToMIDI } from '../../src/utils/midi-export.js';
import { parseMIDIFile } from '../../src/utils/midi-import.js';

console.log('[TEST] midi.test.js loaded.');

export async function testMidi() {
    const pattern = [[{note:'C-4',instrument:'01',effectCmd:'--',effectVal:'--'}]];
    const blob = patternToMIDI(pattern,120);
    if (!(blob instanceof Blob)) throw new Error('MIDI export failed');
    const buf = await blob.arrayBuffer();
    const pat = parseMIDIFile(buf);
    if (!Array.isArray(pat)) throw new Error('MIDI import failed');
    console.log('MIDI roundtrip rows:', pat.length);
}
testMidi();
