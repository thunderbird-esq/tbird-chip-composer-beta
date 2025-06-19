/**
 * @file Transport Controls UI component for Thunderbird Chiptune Composer.
 * Handles playback controls like play, stop, pause, record.
 */

class TransportControl {
    /**
     * Creates an instance of TransportControl.
     * @param {HTMLElement} containerElement - The DOM element to render the transport controls into.
     * @param {object} audioEngine - An instance of the AudioEngine.
     */
    constructor(containerElement, audioEngine) {
        if (!containerElement) {
            throw new Error("Container element is required for TransportControl.");
        }
        if (!audioEngine) {
            // For now, we'll allow it to be optional for basic UI rendering,
            // but log a warning as it's crucial for functionality.
            console.warn("AudioEngine instance not provided to TransportControl. Playback functionality will be limited.");
        }
        this.containerElement = containerElement;
        this.audioEngine = audioEngine;
        this.isRecording = false; // Added for recording state

        this.buttons = {}; // To store references to button elements
    }

    /**
     * Initializes the transport controls by creating and rendering the buttons
     * and attaching event listeners.
     */
    init() {
        this.render();
        this._attachEventListeners();
        this.syncButtonStates(); // Set initial button states based on audio engine
        console.log("TransportControl initialized.");
    }

    /**
     * Creates and renders the transport buttons into the container element.
     */
    render() {
        this.containerElement.innerHTML = ''; // Clear previous content

        const buttonConfigs = [
            { id: 'play-button', text: 'Play', icon: '▶️' },
            { id: 'pause-button', text: 'Pause', icon: '⏸️' },
            { id: 'stop-button', text: 'Stop', icon: '⏹️' },
            { id: 'record-button', text: 'Record', icon: '⏺️' }, // Record enabled by default
        ];

        buttonConfigs.forEach(config => {
            const button = document.createElement('button');
            button.id = config.id;
            button.classList.add('btn'); // Use .btn from system.css
            // system.css .btn does not explicitly use <span> for icon and text,
            // but this structure should still render. The font might be Chicago_12 if not overridden.
            // For system.css, simpler might be: button.textContent = `${config.icon} ${config.text}`;
            // However, keeping spans allows for potential individual styling of icon/text if needed later.
            button.innerHTML = `<span class="icon">${config.icon}</span> <span class="text">${config.text}</span>`;
            if (config.disabled) {
                button.disabled = true;
            }
            this.containerElement.appendChild(button);
            this.buttons[config.id] = button; // Store reference
        });
    }

    /**
     * Attaches event listeners to the transport buttons.
     */
    _attachEventListeners() {
        if (this.buttons['play-button']) {
            this.buttons['play-button'].addEventListener('click', () => this.handlePlay());
        }
        if (this.buttons['pause-button']) {
            this.buttons['pause-button'].addEventListener('click', () => this.handlePause());
        }
        if (this.buttons['stop-button']) {
            this.buttons['stop-button'].addEventListener('click', () => this.handleStop());
        }
        if (this.buttons['record-button']) {
            this.buttons['record-button'].addEventListener('click', () => this.handleRecord());
        }
    }

    /**
     * Handles the play button click.
     */
    handlePlay() {
        console.log("Play button clicked");
        if (this.audioEngine && typeof this.audioEngine.startPlayback === 'function') {
            if (this.audioEngine.startPlayback()) {
                this.updateButtonStates({ play: false, pause: true, stop: true });
            } else {
                console.error("TransportControl: AudioEngine failed to start playback.");
                this.updateButtonStates({ play: true, pause: false, stop: false });
            }
        } else {
            console.warn("TransportControl: AudioEngine not available or startPlayback not implemented.");
            this.updateButtonStates({ play: true, pause: false, stop: false, record: false });
        }
    }

    /**
     * Handles the pause button click.
     */
    handlePause() {
        console.log("Pause button clicked");
        if (this.audioEngine && typeof this.audioEngine.pausePlayback === 'function') {
            if (this.audioEngine.pausePlayback()) { // Assuming pausePlayback returns success
                this.updateButtonStates({ play: true, pause: false, stop: true });
            } else {
                // Handle pause failure if necessary, though less common
                console.warn("TransportControl: AudioEngine pause failed or no change in state.");
                 // Re-sync or set to a known state if pause has complex conditions
                this.syncButtonStates();
            }
        } else {
            console.warn("TransportControl: AudioEngine not available or pausePlayback not implemented.");
            // Fallback or error state for buttons
            this.updateButtonStates({ play: true, pause: false, stop: false, record: false });
        }
    }

    /**
     * Handles the stop button click.
     */
    handleStop() {
        console.log("Stop button clicked");
        if (this.audioEngine && typeof this.audioEngine.stopPlayback === 'function') {
            if (this.audioEngine.stopPlayback()) { // Assuming stopPlayback returns success
                this.updateButtonStates({ play: true, pause: false, stop: false });
            } else {
                // Handle stop failure if necessary, though less common
                 console.warn("TransportControl: AudioEngine stop failed (this is unusual).");
                // Re-sync, or set to a known state
                this.syncButtonStates();
            }
        } else {
            console.warn("TransportControl: AudioEngine not available or stopPlayback not implemented.");
            this.updateButtonStates({ play: true, pause: false, stop: false, record: false });
        }
    }

    /**
     * Handles the record button click.
     */
    handleRecord() {
        const statusEl = document.getElementById('global-status-message');

        if (!this.audioEngine) {
            console.error("UI: AudioEngine not available for recording.");
            if (statusEl) statusEl.textContent = 'Error: Audio engine not ready.';
            alert("Audio engine not ready. Cannot start recording.");
            return;
        }

        // Further check if recording is supported at all by the engine
        if (!this.audioEngine.isRecordingSupported && !this.isRecording) { // only check if trying to start
            console.error("UI: Recording is not supported by the audio engine (e.g. no MediaRecorder or suitable MIME type).");
            if (statusEl) statusEl.textContent = 'Error: Recording not supported by browser.';
            alert("Recording is not supported by your browser or no suitable audio format found.");
            return;
        }

        const recordButton = this.buttons['record-button'];

        if (!this.isRecording) { // Attempt to START recording
            if (this.audioEngine.startRecording()) {
                this.isRecording = true; // Sync UI state with engine
                if (statusEl) statusEl.textContent = 'Recording started...';
                console.log("UI: Recording started via AudioEngine.");
            } else {
                this.isRecording = false; // Ensure UI state reflects failure
                if (statusEl) statusEl.textContent = 'Error: Could not start recording. Check console.';
                console.error("UI: AudioEngine failed to start recording.");
                alert("Failed to start recording. See console for details.");
            }
            this.syncButtonStates(); // Update all button states and appearances
        } else { // Attempt to STOP recording
            if (recordButton) {
                const textElement = recordButton.querySelector('.text');
                if (textElement) textElement.textContent = 'Processing...';
                recordButton.disabled = true; // Disable while processing
                if (statusEl) statusEl.textContent = 'Processing audio...';
            }

            this.audioEngine.stopRecording()
                .then(blob => {
                    console.log("UI: Recording stopped by AudioEngine, blob received.", blob);
                    this.isRecording = false; // Sync UI state

                    if (blob && blob.size > 0) {
                        const mimeType = this.audioEngine.selectedMimeType || blob.type || 'audio/wav';
                        let extension = 'wav'; // Default extension
                        if (mimeType.includes('webm')) extension = 'webm';
                        else if (mimeType.includes('ogg')) extension = 'ogg';
                        else if (mimeType.includes('mp4')) extension = 'mp4';

                        const specificExtension = mimeType.split('/')[1]?.split(';')[0];
                        if (specificExtension) extension = specificExtension;

                        const filename = `thunderbird-recording-${new Date().toISOString().replace(/[:.]/g, '-')}.${extension}`;

                        const objectUrl = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.style.display = 'none';
                        a.href = objectUrl;
                        a.download = filename;

                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(objectUrl);

                        console.log(`UI: Download initiated for ${filename}`);
                        if (statusEl) {
                            statusEl.textContent = `Download initiated: ${filename}`;
                            setTimeout(() => {
                                if (statusEl.textContent === `Download initiated: ${filename}`) statusEl.textContent = '';
                            }, 5000);
                        }
                        // alert(`Recording saved as ${filename}`); // Alert might be too intrusive now with status message
                    } else {
                        console.warn("UI: Recording stopped, but blob is empty or invalid.");
                        if (statusEl) statusEl.textContent = 'Error: No audio data captured.';
                        alert("Recording completed, but no audio data was captured.");
                    }
                    this.syncButtonStates();
                })
                .catch(error => {
                    console.error("UI: Error stopping recording or processing audio:", error);
                    if (statusEl) statusEl.textContent = `Error: ${error.message || 'Could not save recording.'}`;
                    alert(`Error during recording or saving: ${error.message || error}`);
                    this.isRecording = false;
                    this.syncButtonStates();
                });
        }
    }

    /**
     * Updates the enabled/disabled state of transport buttons.
     * @param {object} states - e.g., { play: true, stop: false, record: false }
     */
    updateButtonStates(states) {
        if (states.play !== undefined && this.buttons['play-button']) {
            this.buttons['play-button'].disabled = !states.play;
        }
        if (states.pause !== undefined && this.buttons['pause-button']) {
            this.buttons['pause-button'].disabled = !states.pause;
        }
        if (states.stop !== undefined && this.buttons['stop-button']) {
            this.buttons['stop-button'].disabled = !states.stop;
        }
        if (states.record !== undefined && this.buttons['record-button']) {
            this.buttons['record-button'].disabled = !states.record;
            // If we are currently recording, the record button should reflect that.
            if (this.isRecording) {
                const iconElement = this.buttons['record-button'].querySelector('.icon');
                const textElement = this.buttons['record-button'].querySelector('.text');
                if (iconElement) iconElement.textContent = '⏹️';
                if (textElement) textElement.textContent = 'Stop Rec';
                this.buttons['record-button'].classList.add('recording-active');
            } else {
                const iconElement = this.buttons['record-button'].querySelector('.icon');
                const textElement = this.buttons['record-button'].querySelector('.text');
                if (iconElement) iconElement.textContent = '⏺️';
                if (textElement) textElement.textContent = 'Record';
                this.buttons['record-button'].classList.remove('recording-active');
            }
        }
        console.log("TransportControl: Button states updated", states);
    }

    /**
     * Synchronizes button states with the AudioEngine's current playback state.
     */
    syncButtonStates() {
        const recordButton = this.buttons['record-button'];

        if (!this.audioEngine || !this.audioEngine.audioContext) {
            this.updateButtonStates({ play: false, pause: false, stop: false, record: false });
            if (recordButton) recordButton.title = 'Audio engine not ready.';
            console.warn("TransportControl.syncButtonStates: AudioEngine or AudioContext not available.");
            return;
        }

        // Check if recording is supported by the engine
        if (!this.audioEngine.isRecordingSupported) {
            this.updateButtonStates({
                play: this.audioEngine.isPaused || !this.audioEngine.isPlaying, // Play enabled if paused or stopped
                pause: this.audioEngine.isPlaying && !this.audioEngine.isPaused, // Pause enabled if playing
                stop: this.audioEngine.isPlaying || this.audioEngine.isPaused,   // Stop enabled if playing or paused
                record: false // Record button disabled
            });
            if (recordButton) {
                recordButton.title = 'Recording not supported or no suitable audio format found.';
            }
            console.warn("TransportControl.syncButtonStates: Recording not supported by AudioEngine.");
            return; // Early exit if recording is not supported
        }

        // If recording is supported, set its title back to default (or remove it)
        if (recordButton) recordButton.title = 'Record audio';


        const isPlaying = this.audioEngine.isPlaying;
        const isPaused = this.audioEngine.isPaused;
        // Record button is generally enabled if recording is supported. Its appearance is handled by updateButtonStates.
        const recordButtonEnabled = true;

        if (isPlaying && !isPaused) { // Actively playing
            this.updateButtonStates({ play: false, pause: true, stop: true, record: recordButtonEnabled });
        } else if (isPaused) { // Paused
            this.updateButtonStates({ play: true, pause: false, stop: true, record: recordButtonEnabled });
        } else { // Stopped
            this.updateButtonStates({ play: true, pause: false, stop: false, record: recordButtonEnabled });
        }
        // The call to updateButtonStates will ensure the record button's visual state (text, class)
        // is correctly set based on this.isRecording.
        console.log(`TransportControl.syncButtonStates: isPlaying=${isPlaying}, isPaused=${isPaused}, isRecording=${this.isRecording}`);
    }
}

export default TransportControl;

// How it might be initialized in a main application script:
//
// import TransportControl from './ui/transport.js';
// import audioEngine from './audio/engine.js'; // Assuming audioEngine is exported and initialized
//
// document.addEventListener('DOMContentLoaded', () => {
//     const transportContainer = document.getElementById('transport-controls-container');
//     if (transportContainer && audioEngine) {
//         // Ensure AudioEngine is initialized first if it's not a singleton that auto-inits
//         if (typeof audioEngine.init === 'function' && !audioEngine.audioContext) {
//             audioEngine.init();
//         }
//         const transportControl = new TransportControl(transportContainer, audioEngine);
//         transportControl.init();
//         // Set initial button states
//         transportControl.updateButtonStates({ play: true, pause: false, stop: false, record: false });
//         // (Above states might need adjustment based on actual engine state after init)
//     } else {
//         console.error("Transport controls container or AudioEngine not found/initialized.");
//     }
// });
//
// As with other UI modules, the above initialization logic is for a main app script.
// The index.html already links this file.
// The subtask is only about creating transport.js.
// A main script (e.g. app.js or main.js) would handle the instantiation.
// e.g. in main.js
// import audioEngine from './audio/engine.js';
// import TransportControl from './ui/transport.js';
//
// // after audioEngine is initialized...
// const transportContainer = document.getElementById('transport-controls-container');
// const transportControls = new TransportControl(transportContainer, audioEngine);
// transportControls.init();
// transportControls.updateButtonStates({ play: true, pause: true, stop: true, record: false });
// // Initial state: Play enabled, pause/stop disabled until playing. Record disabled.
// // This needs to be smarter based on engine state. For now:
// transportControls.buttons['play-button'].disabled = false;
// transportControls.buttons['pause-button'].disabled = true;
// transportControls.buttons['stop-button'].disabled = true;
// transportControls.buttons['record-button'].disabled = true; // if record is not implemented yet.
