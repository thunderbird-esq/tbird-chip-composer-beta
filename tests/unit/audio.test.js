import audioEngine from '../../src/audio/engine.js';
console.log('[TEST] audio.test.js loaded.');
export function testAudioSystem() {
    const freq = audioEngine.parseNoteString('C-4');
    if (typeof freq !== 'number') throw new Error('parseNoteString failed');
    console.log('parseNoteString C-4 ->', freq);
}
testAudioSystem();
