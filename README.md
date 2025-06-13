# Thunderbird Chiptune Composer (Dev Sandbox)

This is the development sandbox for Thunderbird, a web-based chiptune composer. It allows users to create and edit musical patterns using a tracker-style interface, customize instruments, and save their work in the browser.

## Core Features

*   **Fully Client-Side**: No installation needed, runs entirely in modern web browsers.
*   **Web Audio API Sound Engine**:
    *   Supports multiple instruments with customizable ADSR (Attack, Decay, Sustain, Release) envelopes.
    *   Adjustable per-instrument volume.
    *   Choice of waveforms (sine, square, sawtooth, triangle).
    *   Precise, Web Audio-timed playback sequencer.
*   **Interactive Tracker Grid**:
    *   Classic tracker interface for pattern-based composition.
    *   Cell selection via mouse click.
    *   Keyboard navigation (Arrow keys for rows/tracks, Tab/Shift+Tab for columns).
    *   Inline editing for notes (e.g., "C-4", "F#5").
    *   Single-cell copy/paste (Ctrl/Cmd+C, Ctrl/Cmd+V).
*   **Playback & Control**:
    *   Play, Pause, Stop, and Resume functionality.
    *   Configurable Beats Per Minute (BPM), adjustable in real-time.
    *   Automatic pattern looping.
    *   Visual highlighting of the currently playing row in the grid.
*   **Instrument Customization**:
    *   Instrument Editor panel to modify waveform, ADSR envelope parameters, and volume for selected instruments.
    *   Supports multiple instruments, selectable by ID in the editor.
*   **Project Management**:
    *   Save entire projects (pattern data, all instrument settings, BPM) to the browser's `localStorage`.
    *   Load saved projects from `localStorage`.
*   **Real-time Audio Visualizer**: Basic waveform display of the audio output.
*   **ES Module-based Architecture**: Modern JavaScript structure.
*   **Offline Capable**: Works offline thanks to ServiceWorker support (initial setup).

## Getting Started

1.  **Launch**: Open `index.html` in a compatible web browser (e.g., Chrome, Firefox, Edge).
2.  **Explore**: The application will load with a default pattern and instruments.
3.  **Experiment**: Try entering notes, changing instrument sounds, and using playback controls.

## How to Use

### Interface Overview
*   **Tracker Grid**: The main area for composing. Rows represent time steps, columns represent tracks. Each cell can hold a note, instrument number, and (eventually) effect commands.
*   **Transport Controls**: Buttons for Play, Pause, and Stop, usually located below the main content.
*   **Control Panels**:
    *   **Instrument Editor**: Select an instrument by its ID (e.g., "01", "02"). Modify its waveform, ADSR envelope, and volume. Click "Update Selected Instrument" to apply changes. New instruments can be created by entering a new ID, loading it (which populates with default values if new), modifying, and updating.
    *   **Project Settings**: Adjust the global BPM. Save or load your project using the buttons provided.
*   **Visualizer**: Shows a waveform of the sound being played.

### Basic Workflow
1.  **Select a Cell**: Click on a cell in the Tracker Grid, or use Arrow keys and Tab/Shift+Tab to navigate.
2.  **Enter/Edit Notes**:
    *   In the 'note' column, double-click or press 'Enter' (or a note character like 'c') to open the inline editor.
    *   Type a note (e.g., "C-4", "F#5", "A#3"). Press 'Enter' or click away to commit. 'Escape' cancels.
    *   Alternatively, with a 'note' cell selected (not in edit mode):
        *   Press letters A-G to set the note name (defaults to octave 4 or current octave).
        *   Press numbers 0-7 to change the octave of an existing note.
        *   Press '#' to toggle sharp on/off for some notes.
        *   Press Delete/Backspace to clear the note to "---".
3.  **Assign Instruments**: (Currently, instrument numbers in the grid are from sample data; direct grid editing for instrument numbers will be enhanced).
4.  **Edit Instrument Sounds**:
    *   In the "Instrument Editor" panel, type an Instrument ID (e.g., "01", "02", or a new one like "03") into the "Edit Instrument ID" field.
    *   Click "Load to Edit". The form will populate with that instrument's data (or defaults if it's a new ID).
    *   Adjust waveform, volume, attack, decay, sustain, and release values.
    *   Click "Update Selected Instrument". Notes in the grid using this instrument ID will now use the new sound.
5.  **Control Playback**: Use the Play, Pause, Stop buttons.
6.  **Adjust Tempo**: In the "Project Settings" panel, change the BPM value and click "Update Settings".
7.  **Save Your Work**: In "Project Settings", click "Save Project".
8.  **Load Your Work**: In "Project Settings", click "Load Project".

## Developer Tools & Resources

*   **Source Code**: Located in the `src/` directory.
    *   `main.js`: Main application coordinator.
    *   `audio/engine.js`: Core audio playback and instrument logic.
    *   `ui/grid.js`: Tracker grid UI and interaction.
    *   `ui/panels.js`: Management for UI panels.
    *   `ui/transport.js`: Playback control UI.
    *   `ui/visualizer.js`: Audio visualizer.
*   **Configuration**: Default settings in `config.json` (e.g., initial BPM, volume).
*   **Asset Files**: In `assets/` (sprites, fonts, etc.).
*   **Documentation**: In the `docs/` directory.
*   **In-browser Testing**:
    *   `dev-panel.html`: Useful for testing specific UI/audio modules in isolation.
    *   `test-runner.html`: Runs unit tests (currently placeholders, need expansion).

## Known Limitations & Future Work

*   **Grid Editing**:
    *   Inline editing is currently only for the 'note' column. Instrument numbers and effect columns are not yet editable via the inline editor.
    *   Note input validation is basic.
*   **Effects System**: No tracker effects (e.g., pitch slides, arpeggios) are implemented yet.
*   **Instruments**:
    *   Limited parameters (no filters, LFOs, etc.).
    *   No UI for easily adding, removing, or cloning instruments beyond the current ID input method.
*   **Song Structure**: Supports only a single pattern. No song sequencing or multiple pattern management.
*   **File I/O**: Project saving/loading is limited to browser `localStorage`. No file export/import yet.
*   **MIDI I/O**: No MIDI import or export capabilities.

This project is an ongoing development sandbox. Contributions and feedback are welcome!
