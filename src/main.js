/**
 * @file Main application script for Thunderbird Chiptune Composer.
 * Initializes and coordinates all modules.
 */

import audioEngine from './audio/engine.js';
import { PanelManager } from './ui/panels.js';
import TransportControl from './ui/transport.js';
import TrackerGrid from './ui/grid.js';
// import Visualizer from './ui/visualizer.js'; // Optional for now

document.addEventListener('DOMContentLoaded', () => {
    console.log("Thunderbird Chiptune Composer: Initializing...");

    // 1. Initialize Audio Engine
    if (!audioEngine.init()) {
        console.error("Fatal Error: AudioEngine initialization failed. The application may not function correctly.");
        // Optionally, display a user-friendly error message in the UI
        const appContainer = document.getElementById('app-container');
        if (appContainer) {
            appContainer.innerHTML = '<p style="color: red; text-align: center; margin-top: 50px;">Error: Web Audio API not supported or failed to initialize. Please use a modern browser.</p>';
        }
        return; // Stop further initialization if audio engine fails
    }

    // 2. Initialize Panel Manager
    const panelManager = new PanelManager();
    const controlPanelsContainer = document.getElementById('control-panels-container');
    if (controlPanelsContainer) {
        panelManager.init('#control-panels-container'); // PanelManager uses a selector
        console.log("PanelManager initialized.");
    } else {
        console.error("Control panels container (#control-panels-container) not found.");
    }

    // 3. Initialize Tracker Grid
    const gridContainer = document.getElementById('tracker-grid-container');
    let trackerGrid = null;
    if (gridContainer) {
        trackerGrid = new TrackerGrid(gridContainer);
        trackerGrid.init();
        console.log("TrackerGrid initialized.");
        audioEngine.setTrackerGrid(trackerGrid); // Provide audioEngine with a reference to trackerGrid
    } else {
        console.error("Tracker grid container (#tracker-grid-container) not found.");
    }

    // 4. Initialize Transport Control
    const transportContainer = document.getElementById('transport-controls-container');
    if (transportContainer) {
        const transportControl = new TransportControl(transportContainer, audioEngine);
        transportControl.init(); // init now calls syncButtonStates
        console.log("TransportControl initialized.");
    } else {
        console.error("Transport controls container (#transport-controls-container) not found.");
    }

    // 5. Initialize Visualizer (Optional for now)
    const visualizerContainer = document.getElementById('visualizer-container');
    if (visualizerContainer) {
        // Placeholder for Visualizer initialization if/when it's ready
        // const visualizer = new Visualizer(visualizerContainer, audioEngine);
        // visualizer.init();
        console.log("Visualizer container found (Visualizer component not yet fully integrated).");
    } else {
        console.warn("Visualizer container (#visualizer-container) not found.");
    }

    console.log("Thunderbird Chiptune Composer: Initialization complete.");

    // Example: Make trackerGrid available globally for debugging or for other modules if needed
    // window.trackerGrid = trackerGrid;
    // window.audioEngine = audioEngine;
});
