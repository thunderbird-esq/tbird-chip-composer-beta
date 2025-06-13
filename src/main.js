/**
 * @file Main application script for Thunderbird Chiptune Composer.
 * Initializes and coordinates all modules.
 */

import audioEngine from './audio/engine.js'; // audioEngine is an instance
import { PanelManager } from './ui/panels.js';
import TransportControl from './ui/transport.js';
import TrackerGrid from './ui/grid.js';
import Visualizer from './ui/visualizer.js';

let panelManager; // Declare panelManager here to make it accessible

/**
 * Populates the instrument editor form with details of a given instrument.
 * @param {string} instrumentId - The ID of the instrument to display.
 * @param {object} audioEngineInstance - The AudioEngine instance.
 * @param {object} panelManagerInstance - The PanelManager instance.
 */
function populateInstrumentEditorForm(instrumentId, audioEngineInstance, panelManagerInstance) {
    const instrument = audioEngineInstance.getInstrument(instrumentId);
    if (!instrument) {
        console.warn(`Cannot populate form: Instrument ID "${instrumentId}" not found.`);
        return;
    }

    const editorPanel = panelManagerInstance.getPanel('instrument-editor-panel');
    if (!editorPanel || !editorPanel.panelElement) {
        console.warn("Instrument editor panel not found or not rendered for form population.");
        return;
    }

    editorPanel.panelElement.querySelector('#editing-inst-id').textContent = instrument.id || '--';
    editorPanel.panelElement.querySelector('#editing-inst-name').textContent = instrument.name || 'N/A';
    editorPanel.panelElement.querySelector('#inst-waveform').value = instrument.waveform || 'sine';
    editorPanel.panelElement.querySelector('#inst-attack').value = (instrument.attack !== undefined ? Number(instrument.attack).toFixed(3) : '0.010');
    editorPanel.panelElement.querySelector('#inst-decay').value = (instrument.decay !== undefined ? Number(instrument.decay).toFixed(3) : '0.100');

    console.log(`Populated instrument editor form for instrument "${instrument.id || 'default'}".`);
}

/**
 * Populates the project settings form with current settings from AudioEngine.
 * @param {object} audioEngineInstance - The AudioEngine instance.
 * @param {object} panelManagerInstance - The PanelManager instance.
 */
function populateProjectSettingsForm(audioEngineInstance, panelManagerInstance) {
    const panel = panelManagerInstance.getPanel('project-settings-panel');
    if (!panel || !panel.panelElement) {
        console.warn("Project settings panel not found or not rendered for form population.");
        return;
    }
    const bpmInput = panel.panelElement.querySelector('#setting-bpm');
    if (bpmInput) {
        bpmInput.value = audioEngineInstance.bpm;
    }
    // Add other project settings here later (e.g., project name)
    console.log(`Populated project settings form. BPM: ${audioEngineInstance.bpm}`);
}


async function loadConfigAndInitialize() {
    let config = {};
    try {
        const response = await fetch('config.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        config = await response.json();
        console.log("Configuration loaded:", config);
    } catch (error) {
        console.error("Failed to load config.json. Using default values.", error);
        config = { bpmDefault: 120, audioVolume: 0.7 };
    }

    // 1. Initialize Audio Engine
    if (!audioEngine.init()) {
        console.error("Fatal Error: AudioEngine initialization failed.");
        const appContainer = document.getElementById('app-container');
        if (appContainer) {
            appContainer.innerHTML = '<p style="color: red; text-align: center; margin-top: 50px;">Error: Web Audio API not supported or failed to initialize.</p>';
        }
        return;
    }
    audioEngine.setMasterVolume(config.audioVolume !== undefined ? config.audioVolume : 0.7);
    audioEngine.setBPM(config.bpmDefault !== undefined ? config.bpmDefault : 120);
    console.log(`Initial BPM set to: ${audioEngine.bpm}, Volume: ${audioEngine.masterGain.gain.value.toFixed(2)}`);

    // 2. Initialize Panel Manager
    panelManager = new PanelManager();
    const controlPanelsContainer = document.getElementById('control-panels-container');
    if (controlPanelsContainer) {
        panelManager.init('#control-panels-container');
        console.log("PanelManager initialized.");
    } else {
        console.error("Control panels container (#control-panels-container) not found.");
    }

    // 3. Initialize Tracker Grid
    let trackerGrid = null;
    const gridContainer = document.getElementById('tracker-grid-container');
    if (gridContainer) {
        trackerGrid = new TrackerGrid(gridContainer);
        trackerGrid.init();
        console.log("TrackerGrid initialized.");
        audioEngine.setTrackerGrid(trackerGrid);
    } else {
        console.error("Tracker grid container (#tracker-grid-container) not found.");
    }

    // 4. Initialize Transport Control
    const transportContainer = document.getElementById('transport-controls-container');
    if (transportContainer) {
        const transportControl = new TransportControl(transportContainer, audioEngine);
        transportControl.init();
        console.log("TransportControl initialized.");
    } else {
        console.error("Transport controls container (#transport-controls-container) not found.");
    }

    // 5. Initialize Visualizer
    const visualizerContainer = document.getElementById('visualizer-container');
    if (visualizerContainer && audioEngine.audioContext) {
        try {
            const visualizer = new Visualizer(visualizerContainer, audioEngine);
            visualizer.init();
            console.log("Visualizer component initialized.");
            // Store visualizer instance if needed for global stop/start, e.g., window.visualizer = visualizer;
        } catch (error) {
            console.error("Failed to initialize Visualizer:", error);
            visualizerContainer.innerHTML = '<p style="color:orange;">Visualizer failed to load.</p>';
        }
    } else {
        console.warn("Visualizer container not found or AudioContext not ready for Visualizer.");
        if(visualizerContainer) visualizerContainer.innerHTML = '<p style="color:gray;">Visualizer disabled.</p>';
    }

    // Load default instruments into AudioEngine
    audioEngine.loadInstrument({
        id: '01',
        name: 'Simple Lead',
        waveform: 'triangle',
        attack: 0.01,
        decay: 0.2
    });
    audioEngine.loadInstrument({
        id: '02',
        name: 'Basic Kick',
        waveform: 'sine',
        attack: 0.005,
        decay: 0.1
    });
    console.log("Default instruments loaded into AudioEngine.");

    // Populate forms and set up panel interactions
    if (panelManager) {
        // Instrument Editor Panel
        populateInstrumentEditorForm('01', audioEngine, panelManager);
        const instrEditorPanelElement = panelManager.getPanel('instrument-editor-panel')?.panelElement;
        if (instrEditorPanelElement) {
            const updateButton = instrEditorPanelElement.querySelector('#update-instrument-button');
            if (updateButton) {
                updateButton.addEventListener('click', () => {
                    const currentInstrumentId = '01';
                    const waveform = instrEditorPanelElement.querySelector('#inst-waveform').value;
                    const attack = parseFloat(instrEditorPanelElement.querySelector('#inst-attack').value);
                    const decay = parseFloat(instrEditorPanelElement.querySelector('#inst-decay').value);

                    const existingInstrument = audioEngine.getInstrument(currentInstrumentId);
                    if (!existingInstrument || existingInstrument.id === 'default' && currentInstrumentId !== 'default') {
                        console.error(`Cannot update: Original instrument \${currentInstrumentId} not found or is the default fallback.`);
                        alert(`Error: Instrument \${currentInstrumentId} could not be found for update.`);
                        return;
                    }
                    if (isNaN(attack) || attack <= 0 || isNaN(decay) || decay <= 0) {
                        console.error("Invalid attack or decay value. Must be positive numbers > 0.");
                        alert("Error: Attack and Decay must be positive numbers greater than 0.");
                        return;
                    }
                    const updatedInstrumentData = { ...existingInstrument, waveform, attack, decay };
                    audioEngine.loadInstrument(updatedInstrumentData);
                    populateInstrumentEditorForm(currentInstrumentId, audioEngine, panelManager);
                    alert(`Instrument '\${currentInstrumentId}' updated successfully!`);
                });
            } else { console.warn("Update instrument button not found in panel."); }
        }

        // Project Settings Panel
        populateProjectSettingsForm(audioEngine, panelManager);
        const projSettingsPanelElement = panelManager.getPanel('project-settings-panel')?.panelElement;
        if (projSettingsPanelElement) {
            const updateButton = projSettingsPanelElement.querySelector('#update-project-settings-button');
            if (updateButton) {
                updateButton.addEventListener('click', () => {
                    const bpmInput = projSettingsPanelElement.querySelector('#setting-bpm');
                    const newBPM = parseInt(bpmInput.value);

                    if (isNaN(newBPM) || newBPM < 20 || newBPM > 999) {
                        alert("Error: BPM must be a number between 20 and 999.");
                        populateProjectSettingsForm(audioEngine, panelManager); // Reset to current value
                        return;
                    }
                    audioEngine.setBPM(newBPM);
                    populateProjectSettingsForm(audioEngine, panelManager); // Reflect change in form
                    alert("Project settings updated successfully!");
                });
            } else { console.warn("Update project settings button not found in panel."); }
        }
    }

    console.log("Thunderbird Chiptune Composer: Initialization complete with config.");
}


document.addEventListener('DOMContentLoaded', () => {
    console.log("Thunderbird Chiptune Composer: DOMContentLoaded. Starting initialization process...");
    loadConfigAndInitialize().catch(error => {
        console.error("Unhandled error during initialization:", error);
        const appContainer = document.getElementById('app-container');
        if (appContainer) {
            appContainer.innerHTML = '<p style="color: red; text-align: center; margin-top: 50px;">An unexpected error occurred during application startup. Please try refreshing the page.</p>';
        }
    });
});
