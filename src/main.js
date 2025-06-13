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
let trackerGrid = null; // Declare trackerGrid here to make it accessible for save/load
let currentEditingInstrumentId = '01'; // Default to '01'

/**
 * Populates the instrument editor form with details of a given instrument.
 * @param {string} instrumentId - The ID of the instrument to display.
 * @param {object} audioEngineInstance - The AudioEngine instance.
 * @param {object} panelManagerInstance - The PanelManager instance.
 */
function populateInstrumentEditorForm(instrumentId, audioEngineInstance, panelManagerInstance) {
    const instrument = audioEngineInstance.getInstrument(instrumentId);

    const editorPanel = panelManagerInstance.getPanel('instrument-editor-panel');
    if (!editorPanel || !editorPanel.panelElement) {
        console.warn("Instrument editor panel not found or not rendered for form population.");
        return;
    }

    const idInputField = editorPanel.panelElement.querySelector('#instrument-select-id');
    if (idInputField) idInputField.value = instrumentId;

    editorPanel.panelElement.querySelector('#editing-inst-id-display').textContent = instrument.id;
    editorPanel.panelElement.querySelector('#editing-inst-name-display').textContent = instrument.name || (instrument.id === instrumentId ? `Instrument ${instrumentId}` : 'Default');

    editorPanel.panelElement.querySelector('#inst-waveform').value = instrument.waveform || 'sine';
    editorPanel.panelElement.querySelector('#inst-volume').value = (instrument.volume !== undefined ? Number(instrument.volume).toFixed(2) : '0.70');
    editorPanel.panelElement.querySelector('#inst-attack').value = (instrument.attack !== undefined ? Number(instrument.attack).toFixed(3) : '0.010');
    editorPanel.panelElement.querySelector('#inst-decay').value = (instrument.decay !== undefined ? Number(instrument.decay).toFixed(3) : '0.100');
    editorPanel.panelElement.querySelector('#inst-sustain').value = (instrument.sustainLevel !== undefined ? Number(instrument.sustainLevel).toFixed(2) : '0.70');
    editorPanel.panelElement.querySelector('#inst-release').value = (instrument.releaseTime !== undefined ? Number(instrument.releaseTime).toFixed(3) : '0.200');

    currentEditingInstrumentId = instrumentId;
    console.log(`Populated instrument editor form for instrument ID: "${instrumentId}" (Actual loaded: "${instrument.id}")`);
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
    console.log(`Populated project settings form. BPM: ${audioEngineInstance.bpm}`);
}

function gatherProjectData(audioEngineInstance, trackerGridInstance) {
    if (!audioEngineInstance || !trackerGridInstance) {
        console.error("gatherProjectData: AudioEngine or TrackerGrid instance not available.");
        return null;
    }
    return {
        bpm: audioEngineInstance.bpm,
        instruments: audioEngineInstance.getInstrumentsData(),
        pattern: trackerGridInstance.getPatternData(),
        currentEditingInstrumentId: currentEditingInstrumentId,
        savedAt: new Date().toISOString()
    };
}

function applyProjectData(data, audioEngineInstance, trackerGridInstance, panelManagerInstance) {
    if (!data) { console.error("applyProjectData: No data to apply."); return; }
    if (!audioEngineInstance || !trackerGridInstance || !panelManagerInstance) {
        console.error("applyProjectData: Core instances not available."); return;
    }

    if (data.bpm) audioEngineInstance.setBPM(data.bpm);
    if (data.instruments) audioEngineInstance.loadInstrumentsData(data.instruments);
    if (data.pattern) trackerGridInstance.setPatternData(data.pattern);
    if (data.currentEditingInstrumentId) currentEditingInstrumentId = data.currentEditingInstrumentId;
    else currentEditingInstrumentId = '01'; // Fallback if not in saved data

    populateProjectSettingsForm(audioEngineInstance, panelManagerInstance);
    populateInstrumentEditorForm(currentEditingInstrumentId, audioEngineInstance, panelManagerInstance);

    console.log("Project data applied. Loaded project saved at:", data.savedAt || "Unknown");
}


async function loadConfigAndInitialize() {
    let config = {};
    try {
        const response = await fetch('config.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        config = await response.json();
        console.log("Configuration loaded:", config);
    } catch (error) {
        console.error("Failed to load config.json. Using default values.", error);
        config = { bpmDefault: 120, audioVolume: 0.7 };
    }

    if (!audioEngine.init()) {
        console.error("Fatal Error: AudioEngine initialization failed.");
        document.getElementById('app-container').innerHTML = '<p style="color: red; text-align: center; margin-top: 50px;">Error: Web Audio API not supported.</p>';
        return;
    }
    audioEngine.setMasterVolume(config.audioVolume !== undefined ? config.audioVolume : 0.7);
    audioEngine.setBPM(config.bpmDefault !== undefined ? config.bpmDefault : 120);
    console.log(`Initial BPM: ${audioEngine.bpm}, Volume: ${audioEngine.masterGain.gain.value.toFixed(2)}`);

    panelManager = new PanelManager();
    const controlPanelsContainer = document.getElementById('control-panels-container');
    if (controlPanelsContainer) {
        panelManager.init('#control-panels-container');
        console.log("PanelManager initialized.");
    } else { console.error("Control panels container not found."); }

    const gridContainer = document.getElementById('tracker-grid-container');
    if (gridContainer) {
        trackerGrid = new TrackerGrid(gridContainer);
        trackerGrid.init();
        console.log("TrackerGrid initialized.");
        audioEngine.setTrackerGrid(trackerGrid);
        audioEngine.setOnStepChange((step) => { if (trackerGrid) trackerGrid.setPlayingRow(step); });
    } else { console.error("Tracker grid container not found."); }

    const transportContainer = document.getElementById('transport-controls-container');
    if (transportContainer) {
        const transportControl = new TransportControl(transportContainer, audioEngine);
        transportControl.init();
        console.log("TransportControl initialized.");
    } else { console.error("Transport controls container not found."); }

    const visualizerContainer = document.getElementById('visualizer-container');
    if (visualizerContainer && audioEngine.audioContext) {
        try {
            const visualizer = new Visualizer(visualizerContainer, audioEngine);
            visualizer.init();
            console.log("Visualizer component initialized.");
        } catch (error) {
            console.error("Failed to initialize Visualizer:", error);
            visualizerContainer.innerHTML = '<p style="color:orange;">Visualizer failed.</p>';
        }
    } else {
        if(visualizerContainer) visualizerContainer.innerHTML = '<p style="color:gray;">Visualizer disabled.</p>';
        else console.warn("Visualizer container not found.");
    }

    audioEngine.loadInstrument({
        id: '01', name: 'Simple Lead', waveform: 'triangle',
        volume: 0.6, attack: 0.01, decay: 0.2, sustainLevel: 0.6, releaseTime: 0.15
    });
    audioEngine.loadInstrument({
        id: '02', name: 'Basic Kick', waveform: 'sine',
        volume: 0.8, attack: 0.005, decay: 0.1, sustainLevel: 0.1, releaseTime: 0.05
    });
    console.log("Default instruments loaded.");

    if (panelManager) {
        const instrEditorPanelElement = panelManager.getPanel('instrument-editor-panel')?.panelElement;
        if (instrEditorPanelElement) {
            populateInstrumentEditorForm(currentEditingInstrumentId, audioEngine, panelManager);

            const loadSelectedButton = instrEditorPanelElement.querySelector('#load-selected-instr-button');
            if (loadSelectedButton) {
                loadSelectedButton.addEventListener('click', () => {
                    const idInput = instrEditorPanelElement.querySelector('#instrument-select-id');
                    const newIdToLoad = idInput.value.trim();
                    if (newIdToLoad) {
                        currentEditingInstrumentId = newIdToLoad;
                        populateInstrumentEditorForm(currentEditingInstrumentId, audioEngine, panelManager);
                    } else { alert("Please enter an Instrument ID to load."); }
                });
            }

            const updateInstrButton = instrEditorPanelElement.querySelector('#update-instrument-button');
            if (updateInstrButton) {
                updateInstrButton.addEventListener('click', () => {
                    const instrumentIdToUpdate = currentEditingInstrumentId;
                    const waveform = instrEditorPanelElement.querySelector('#inst-waveform').value;
                    const volume = parseFloat(instrEditorPanelElement.querySelector('#inst-volume').value);
                    const attack = parseFloat(instrEditorPanelElement.querySelector('#inst-attack').value);
                    const decay = parseFloat(instrEditorPanelElement.querySelector('#inst-decay').value);
                    const sustainLevel = parseFloat(instrEditorPanelElement.querySelector('#inst-sustain').value);
                    const releaseTime = parseFloat(instrEditorPanelElement.querySelector('#inst-release').value);

                    let existingInstrument = audioEngine.getInstrument(instrumentIdToUpdate);
                    const newName = (existingInstrument && existingInstrument.id === instrumentIdToUpdate) ? existingInstrument.name : `Instrument ${instrumentIdToUpdate}`;

                    if (isNaN(volume) || volume < 0 || volume > 1 ||
                        isNaN(attack) || attack < 0.001 || isNaN(decay) || decay < 0.001 ||
                        isNaN(sustainLevel) || sustainLevel < 0 || sustainLevel > 1 ||
                        isNaN(releaseTime) || releaseTime < 0.001 ) {
                         alert("Error: Invalid instrument parameters. Volume 0-1. Attack/Decay/Release >= 0.001. Sustain 0-1."); return;
                    }
                    const updatedInstrumentData = {
                        id: instrumentIdToUpdate, name: newName,
                        waveform, volume, attack, decay, sustainLevel, releaseTime
                    };
                    audioEngine.loadInstrument(updatedInstrumentData);
                    populateInstrumentEditorForm(instrumentIdToUpdate, audioEngine, panelManager);
                    alert(`Instrument '${instrumentIdToUpdate}' updated successfully!`);
                });
            }
        }

        const projSettingsPanelElement = panelManager.getPanel('project-settings-panel')?.panelElement;
        if (projSettingsPanelElement) {
            populateProjectSettingsForm(audioEngine, panelManager);
            const updateSettingsButton = projSettingsPanelElement.querySelector('#update-project-settings-button');
            if (updateSettingsButton) {
                updateSettingsButton.addEventListener('click', () => {
                    const bpmInput = projSettingsPanelElement.querySelector('#setting-bpm');
                    const newBPM = parseInt(bpmInput.value);
                    if (isNaN(newBPM) || newBPM < 20 || newBPM > 999) {
                        alert("Error: BPM must be a number between 20 and 999.");
                        populateProjectSettingsForm(audioEngine, panelManager); return;
                    }
                    audioEngine.setBPM(newBPM);
                    populateProjectSettingsForm(audioEngine, panelManager);
                    alert("Project settings updated!");
                });
            }

            const saveButton = projSettingsPanelElement.querySelector('#save-project-button');
            if (saveButton) {
                saveButton.addEventListener('click', () => {
                    const projectData = gatherProjectData(audioEngine, trackerGrid);
                    if (projectData) {
                        try {
                            localStorage.setItem('thunderbirdChiptuneProject', JSON.stringify(projectData));
                            alert('Project saved to browser localStorage!');
                        } catch (e) { alert('Error saving project.'); console.error(e); }
                    }
                });
            }

            const loadButton = projSettingsPanelElement.querySelector('#load-project-button');
            if (loadButton) {
                loadButton.addEventListener('click', () => {
                    try {
                        const savedDataString = localStorage.getItem('thunderbirdChiptuneProject');
                        if (savedDataString) {
                            const projectData = JSON.parse(savedDataString);
                            applyProjectData(projectData, audioEngine, trackerGrid, panelManager);
                            alert('Project loaded!');
                        } else { alert('No saved project found.'); }
                    } catch (e) { alert('Error loading project.'); console.error(e); }
                });
            }
        }
    }
    console.log("Thunderbird Chiptune Composer: Initialization complete.");
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("Thunderbird Chiptune Composer: DOMContentLoaded. Starting initialization process...");
    loadConfigAndInitialize().catch(error => {
        console.error("Unhandled error during initialization:", error);
        const appContainer = document.getElementById('app-container');
        if (appContainer) {
            appContainer.innerHTML = '<p style="color: red; text-align: center; margin-top: 50px;">An unexpected error occurred.</p>';
        }
    });
});
