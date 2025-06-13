# Thunderbird Chiptune Composer - Development Plan

This document outlines the steps to bring the Thunderbird Chiptune Composer to a functional state.

## Plan Steps

1.  **Create Basic HTML Structure (`index.html`)**:
    *   Develop a minimal HTML file to serve as the application's entry point.
    *   Include basic meta tags, a title, and links to CSS and JavaScript files.
    *   Define the main layout areas for UI components (e.g., grid, panels, transport controls).
2.  **Develop Core Audio Engine (`src/audio/engine.js`)**:
    *   Implement basic audio playback functionality using the Web Audio API.
    *   Create functions for loading and playing sounds.
    *   Develop a simple scheduling mechanism for timed audio events (essential for a tracker).
3.  **Implement Sound Generators (`src/audio/generators.js`)**:
    *   Create basic sound waveform generators (e.g., sine, square, sawtooth, noise).
    *   Allow for adjustable parameters like frequency and amplitude.
4.  **Develop Instrument Handling (`src/audio/instruments.js`)**:
    *   Design a way to define and manage different instruments.
    *   Each instrument could use one or more sound generators and effects.
5.  **Implement Audio Effects (`src/audio/effects.js`)**:
    *   Develop basic audio effects like delay, filter, and distortion.
    *   Allow these effects to be applied to instruments.
6.  **Create UI Grid (`src/ui/grid.js`)**:
    *   Develop the main tracker interface for inputting notes and commands.
    *   Display note patterns, instrument selections, and effect parameters.
    *   Handle user input for editing the grid.
7.  **Develop UI Panels (`src/ui/panels.js`)**:
    *   Create panels for managing project settings, instrument selection, effect controls, etc.
8.  **Implement UI Transport Controls (`src/ui/transport.js`)**:
    *   Develop play, stop, pause, and record buttons.
    *   Link these controls to the audio engine.
9.  **Create UI Visualizer (`src/ui/visualizer.js`)**:
    *   Implement a simple audio visualizer (e.g., waveform or spectrum display).
10. **Implement Constants (`src/constants.js`)**:
    *   Define and store global constants for the application.
11. **Develop Utility Functions (`src/utils/`)**:
    *   **File I/O (`src/utils/file-io.js`)**: Implement functions for saving and loading projects (if applicable, though README stated offline first).
    *   **Formatters (`src/utils/formatters.js`)**: Create functions for formatting data (e.g., time, note values).
    *   **MIDI Export (`src/utils/midi-export.js`)**: Develop functionality to export compositions as MIDI files.
    *   **MIDI Import (`src/utils/midi-import.js`)**: Develop functionality to import MIDI files into the tracker.
12. **Integrate Components**:
    *   Connect the UI components to the audio engine and other modules.
    *   Ensure data flows correctly between different parts of the application.
13. **Basic Styling**:
    *   Apply initial CSS to make the application usable, referencing `styles/core.css`, `styles/fonts.css`, `styles/grid.css`, and `styles/panels.css`.
14. **Testing**:
    *   Write basic unit tests for core audio and UI functionalities as they are developed.
    *   Utilize `test-runner.html` and `scripts/test-runner.js`.
15. **Build Script (`build.sh`)**:
    *   Review and update the build script if necessary, once there's actual code to build/bundle.
16. **Service Worker (`serviceWorker.js`)**:
    *   Implement basic service worker functionality for offline use as described in the README.
17. **Documentation**:
    *   Create a new file `NEW-PLAN.md` in the root directory containing this plan. (This step)
    *   As development progresses, update the existing placeholder documentation files (`PROJECT_ORG.md`, `CODE_MANIFEST.md`, `UX_STANDARDS.md`, `CHANGELOG.md`, `ONBOARDING.md`) with accurate information.
18. **Submit the initial functional version.**
