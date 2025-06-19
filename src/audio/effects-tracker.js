export function applyTrackerEffect(audioEngine, noteInfo, effectCmd, effectVal, time) {
    if (!effectCmd || effectCmd === '--') {
        audioEngine.scheduleNote(noteInfo, time, audioEngine.noteDuration, audioEngine.getInstrument(noteInfo.instrumentId));
        return;
    }
    const cmd = effectCmd.toUpperCase();
    const val = effectVal ? effectVal.toUpperCase() : '';
    const instrument = audioEngine.getInstrument(noteInfo.instrumentId);
    if (cmd === 'SL') {
        const semis = parseInt(val, 16) || 0;
        const pitch = noteInfo.pitch * Math.pow(2, semis / 12);
        audioEngine.scheduleNote({ pitch: pitch, velocity: noteInfo.velocity }, time, audioEngine.noteDuration, instrument);
    } else if (cmd === 'AR') {
        const first = parseInt(val[0], 16) || 0;
        const second = parseInt(val[1], 16) || 0;
        const dur = audioEngine.noteDuration / 3;
        audioEngine.scheduleNote(noteInfo, time, dur, instrument);
        audioEngine.scheduleNote({ pitch: noteInfo.pitch * Math.pow(2, first / 12), velocity: noteInfo.velocity }, time + dur, dur, instrument);
        audioEngine.scheduleNote({ pitch: noteInfo.pitch * Math.pow(2, second / 12), velocity: noteInfo.velocity }, time + dur * 2, dur, instrument);
    } else {
        audioEngine.scheduleNote(noteInfo, time, audioEngine.noteDuration, instrument);
    }
}
