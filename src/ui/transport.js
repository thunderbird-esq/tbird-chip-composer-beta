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

        this.buttons = {}; // To store references to button elements
    }

    /**
     * Initializes the transport controls by creating and rendering the buttons
     * and attaching event listeners.
     */
    init() {
        this.render();
        this._attachEventListeners();
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
            { id: 'record-button', text: 'Record', icon: '⏺️', disabled: true }, // Record disabled by default
        ];

        buttonConfigs.forEach(config => {
            const button = document.createElement('button');
            button.id = config.id;
            button.classList.add('transport-button');
            // button.textContent = config.text; // Using icons primarily
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
            this.audioEngine.startPlayback();
            // Update UI state if needed (e.g., disable play, enable pause/stop)
            this.buttons['play-button'].disabled = true;
            this.buttons['pause-button'].disabled = false;
            this.buttons['stop-button'].disabled = false;
        } else {
            console.warn("AudioEngine not available or startPlayback not implemented.");
        }
    }

    /**
     * Handles the pause button click.
     */
    handlePause() {
        console.log("Pause button clicked");
        // Placeholder for audioEngine.pausePlayback() if that's implemented
        if (this.audioEngine && typeof this.audioEngine.pausePlayback === 'function') {
            // this.audioEngine.pausePlayback(); // Assuming a pause method might exist
            console.log("AudioEngine pausePlayback() called (placeholder)");
        } else if (this.audioEngine && typeof this.audioEngine.stopPlayback === 'function') {
            // As a fallback, stop might be used if true pause isn't available in a simple engine
            // this.audioEngine.stopPlayback();
            console.log("AudioEngine stopPlayback() called as fallback for pause (placeholder)");
        } else {
            console.warn("AudioEngine not available or pause/stop functionality not implemented.");
        }
        // Update UI state
        this.buttons['play-button'].disabled = false;
        this.buttons['pause-button'].disabled = true;
        // Stop button might remain enabled or be handled differently based on desired pause behavior
    }

    /**
     * Handles the stop button click.
     */
    handleStop() {
        console.log("Stop button clicked");
        if (this.audioEngine && typeof this.audioEngine.stopPlayback === 'function') {
            this.audioEngine.stopPlayback();
             // Update UI state
            this.buttons['play-button'].disabled = false;
            this.buttons['pause-button'].disabled = true;
            this.buttons['stop-button'].disabled = true;
        } else {
            console.warn("AudioEngine not available or stopPlayback not implemented.");
        }
    }

    /**
     * Handles the record button click.
     */
    handleRecord() {
        console.log("Record button clicked (Not Implemented)");
        // Placeholder for future recording functionality
        // Toggle recording state, update UI, etc.
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
        }
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
