# Code Manifest

This document provides an overview of the codebase structure and key files.

## Source Code (`src/`)

The `src/` directory contains the core application logic, organized into the following subdirectories and files:

### `src/audio/`

This directory contains modules related to audio processing and generation.

- **`effects.js`**: Implements various audio effects (e.g., delay, reverb, distortion).
- **`engine.js`**: The core audio engine responsible for scheduling, mixing, and rendering audio.
- **`generators.js`**: Contains code for generating sound waveforms (e.g., sine, square, sawtooth).
- **`instruments.js`**: Defines virtual instruments that can be played within the application.

### `src/ui/`

This directory houses modules responsible for the user interface and user interactions.

- **`grid.js`**: Manages the main musical grid or sequencer interface.
- **`panels.js`**: Handles the various UI panels (e.g., instrument selection, effect controls).
- **`transport.js`**: Implements transport controls (play, stop, record, tempo).
- **`visualizer.js`**: Provides audio visualization components.

### `src/utils/`

This directory contains utility functions and helper modules used throughout the application.

- **`file-io.js`**: Handles file input/output operations (e.g., saving and loading projects).
- **`formatters.js`**: Provides functions for formatting data (e.g., time, MIDI).
- **`midi-export.js`**: Implements functionality for exporting projects or patterns to MIDI files.
- **`midi-import.js`**: Implements functionality for importing MIDI files into the application.

### Root `src/` Files

- **`constants.js`**: Defines global constants and configuration values used throughout the application.
- **`main.js`**: The main entry point of the application, responsible for initializing modules and starting the application.

## Assets (`assets/`)

The `assets/` directory contains static files used by the application:

- **`audio/`**: Audio samples and sound effects.
- **`fonts/`**: Font files for custom typography.
- **`sprites/`**: Image sprites for UI elements.

## Styles (`styles/`)

The `styles/` directory contains CSS files for styling the application:

- **`core.css`**: Core application styles.
- **`fonts.css`**: Font declarations and typography styles.
- **`grid.css`**: Styles specific to the musical grid/sequencer.
- **`panels.css`**: Styles for UI panels.

## Tests (`tests/`)

The `tests/` directory contains automated tests for the application:

- **`unit/`**: Unit tests for individual modules and functions.
- **`audio_samples/`**: Audio samples used in tests.

## Documentation (`docs/`)

The `docs/` directory contains project documentation, including this code manifest.

## Build and Configuration

- **`build.sh`**: Shell script for building the application.
- **`config.json`**: Configuration file for the application.
- **`package.json`**: NPM package file, defining project dependencies and scripts.
- **`serviceWorker.js`**: Service worker for enabling offline capabilities and caching.
- **`index.html`**: The main HTML file for the application.
- **`dev-panel.html`**: A utility HTML page for development and debugging purposes.

This manifest provides a high-level overview. For more detailed information, refer to the source code and comments within each file.
