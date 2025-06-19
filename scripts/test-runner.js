// Basic test-runner bootstrapper
import { testAudioSystem } from "../tests/unit/audio.test.js";
import { testUIComponents } from "../tests/unit/ui.test.js";
import { testMidi } from "../tests/unit/midi.test.js";

(async () => {
  try { testAudioSystem(); console.log('audio ok'); } catch(e){ console.error(e); }
  try { testUIComponents(); console.log('ui ok'); } catch(e){ console.error(e); }
  try { await testMidi(); console.log('midi ok'); } catch(e){ console.error(e); }
})();
