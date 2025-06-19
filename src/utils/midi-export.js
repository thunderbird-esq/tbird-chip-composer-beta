export function patternToMIDI(pattern, bpm = 120) {
    const events = [];
    const stepTime = 60 / bpm;
    pattern.forEach((row, idx) => {
        row.forEach(cell => {
            if (cell.note && cell.note !== '---') {
                const match = cell.note.match(/^([A-G])(#?)-([0-7])$/);
                if (match) {
                    const noteValues = {C:0,'C#':1,D:2,'D#':3,E:4,F:5,'F#':6,G:7,'G#':8,A:9,'A#':10,B:11};
                    const name = match[1] + match[2];
                    const octave = parseInt(match[3]);
                    const midi = 12 + octave*12 + noteValues[name];
                    const time = idx * stepTime;
                    events.push({midi, time});
                }
            }
        });
    });
    const header = new Uint8Array([0x4d,0x54,0x68,0x64,0x00,0x00,0x00,0x06,0x00,0x00,0x00,0x01,0x00,0x60]);
    const track = [];
    let lastTime = 0;
    events.forEach(ev => {
        const delta = Math.round((ev.time - lastTime)*96);
        lastTime = ev.time;
        track.push(delta,0x90,ev.midi,0x64,0x00,0x80,ev.midi,0x40);
    });
    track.push(0x00,0xff,0x2f,0x00);
    const len = track.length;
    const trackHeader = new Uint8Array([0x4d,0x54,0x72,0x6b,(len>>>24)&0xff,(len>>>16)&0xff,(len>>>8)&0xff,len&0xff]);
    const array = new Uint8Array(header.length + trackHeader.length + track.length);
    array.set(header,0); array.set(trackHeader,header.length); array.set(track,header.length+trackHeader.length);
    return new Blob([array],{type:'audio/midi'});
}
