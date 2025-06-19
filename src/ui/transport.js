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
        this.isRecording = !this.isRecording;
        const recordButton = this.buttons['record-button'];

        if (recordButton) {
            const iconElement = recordButton.querySelector('.icon');
            const textElement = recordButton.querySelector('.text');

            if (this.isRecording) {
                if (iconElement) iconElement.textContent = '⏹️'; // Change icon to stop-like
                if (textElement) textElement.textContent = 'Stop Rec';
                recordButton.classList.add('recording-active');
                console.log("Recording started");
                // Potentially disable other buttons like play/pause if needed during recording
                // this.updateButtonStates({ play: false, pause: false, stop: true, record: true });

            } else {
                if (iconElement) iconElement.textContent = '⏺️'; // Revert icon
                if (textElement) textElement.textContent = 'Record';
                recordButton.classList.remove('recording-active');
                console.log("Recording stopped");
                // Re-enable other buttons based on current playback state (e.g., call syncButtonStates)
                // this.syncButtonStates(); // This will set record to false, which is fine.
            }
            // Explicitly ensure record button itself is always enabled after click.
            // recordButton.disabled = false; // This might be handled by syncButtonStates or updateButtonStates
        }
        // For now, the record button's enabled state is not managed by syncButtonStates in a special way
        // beyond the initial setup. If other buttons should be disabled during recording,
        // that logic would go into updateButtonStates or a specific call here.
        // We also need to ensure that syncButtonStates correctly reflects the record button's state
        // if it's meant to be part of the general button state logic.
        // For this task, toggling its own appearance and state is primary.
        this.syncButtonStates(); // Call sync to ensure other buttons are in correct state relative to play/pause/stop
                                 // and record button's enabled state is also handled.
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
        if (!this.audioEngine || !this.audioEngine.audioContext) {
            this.updateButtonStates({ play: false, pause: false, stop: false, record: false }); // All disabled
            console.warn("TransportControl.syncButtonStates: AudioEngine not available.");
            return;
        }

        const isPlaying = this.audioEngine.isPlaying;
        const isPaused = this.audioEngine.isPaused;
        const recordButtonEnabled = true; // Record button is generally enabled if audio context is available.
                                        // Its appearance (Record/Stop Rec) is handled by updateButtonStates.

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
