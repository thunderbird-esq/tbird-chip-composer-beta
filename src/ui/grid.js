/**
 * @file Tracker Grid UI component for Thunderbird Chiptune Composer.
 * Handles the display and interaction with the main pattern editor.
 */

const DEFAULT_ROWS = 16;
const DEFAULT_TRACKS = 4;

class TrackerGrid {
    /**
     * Creates an instance of TrackerGrid.
     * @param {HTMLElement} containerElement - The DOM element to render the grid into.
     */
    constructor(containerElement) {
        if (!containerElement) {
            throw new Error("Container element is required for TrackerGrid.");
        }
        this.containerElement = containerElement;
        this.numRows = DEFAULT_ROWS;
        this.numTracks = DEFAULT_TRACKS;

        // Sample data structure (can be expanded later)
        this.patternData = this._createEmptyPatternData(this.numRows, this.numTracks);
        this._populateSampleData(); // Add some initial data for display

        this.selectedCell = { row: 0, track: 0, column: 'note' }; // Default selection
        this.activeInput = null; // To hold a temporary input field
    }

    /**
     * Initializes the grid by rendering it.
     */
    init() {
        this.render();
        this._attachEventListeners(); // Called once after initial render
    }

    /**
     * Creates an empty data structure for the pattern.
     * @param {number} rows - Number of rows.
     * @param {number} tracks - Number of tracks.
     * @returns {Array<Array<object>>} A 2D array representing pattern data.
     */
    _createEmptyPatternData(rows, tracks) {
        return Array(rows).fill(null).map(() =>
            Array(tracks).fill(null).map(() => ({
                note: '---',
                instrument: '--',
                effectCmd: '--',
                effectVal: '--',
            }))
        );
    }

    /**
     * Populates the pattern data with some sample values for demonstration.
     */
    _populateSampleData() {
        if (this.numRows > 0 && this.numTracks > 0) {
            this.patternData[0][0] = { note: 'C-4', instrument: '01', effectCmd: 'D0', effectVal: '0F' };
            this.patternData[2][0] = { note: 'E-4', instrument: '01', effectCmd: '--', effectVal: '--' };
            this.patternData[4][0] = { note: 'G-4', instrument: '01', effectCmd: '--', effectVal: '--' };
        }
        if (this.numRows > 0 && this.numTracks > 1) {
            this.patternData[1][1] = { note: 'F#3', instrument: '02', effectCmd: 'A0', effectVal: '03' };
            this.patternData[5][1] = { note: 'A#3', instrument: '02', effectCmd: '--', effectVal: '--' };
        }
    }

    /**
     * Renders the tracker grid into the container element.
     */
    render() {
        this.containerElement.innerHTML = ''; // Clear previous content

        const table = document.createElement('table');
        table.classList.add('tracker-grid-table');

        // Create table header
        const thead = table.createTHead();
        const headerRow = thead.insertRow();
        const rowNumHeader = document.createElement('th');
        rowNumHeader.textContent = 'Row';
        headerRow.appendChild(rowNumHeader);

        for (let i = 0; i < this.numTracks; i++) {
            const trackHeader = document.createElement('th');
            trackHeader.colSpan = 4; // Note, Instrument, Effect Cmd, Effect Val
            trackHeader.textContent = `Track ${i + 1}`;
            headerRow.appendChild(trackHeader);
        }

        // Create sub-headers for track columns
        const subHeaderRow = thead.insertRow();
        const subRowNumHeader = document.createElement('th'); // Empty cell for row number column
        subHeaderRow.appendChild(subRowNumHeader);

        for (let i = 0; i < this.numTracks; i++) {
            const noteTh = document.createElement('th');
            noteTh.textContent = 'Note';
            subHeaderRow.appendChild(noteTh);
            const instTh = document.createElement('th');
            instTh.textContent = 'Ins';
            subHeaderRow.appendChild(instTh);
            const cmdTh = document.createElement('th');
            cmdTh.textContent = 'Cmd';
            subHeaderRow.appendChild(cmdTh);
            const valTh = document.createElement('th');
            valTh.textContent = 'Val';
            subHeaderRow.appendChild(valTh);
        }


        // Create table body
        const tbody = table.createTBody();
        for (let r = 0; r < this.numRows; r++) {
            const row = tbody.insertRow();
            const rowNumCell = row.insertCell();
            rowNumCell.textContent = r.toString().padStart(2, '0'); // Format row number
            rowNumCell.classList.add('row-number');

            for (let t = 0; t < this.numTracks; t++) {
                const trackData = this.patternData[r][t];

                const noteCell = row.insertCell();
                noteCell.textContent = trackData.note;
                noteCell.classList.add('note-cell');
                noteCell.dataset.row = r;
                noteCell.dataset.track = t;
                noteCell.dataset.column = 'note';
                if (r === this.selectedCell.row && t === this.selectedCell.track && 'note' === this.selectedCell.column) {
                    noteCell.classList.add('selected-cell');
                }

                const instCell = row.insertCell();
                instCell.textContent = trackData.instrument;
                instCell.classList.add('instrument-cell');
                instCell.dataset.row = r;
                instCell.dataset.track = t;
                instCell.dataset.column = 'instrument';
                if (r === this.selectedCell.row && t === this.selectedCell.track && 'instrument' === this.selectedCell.column) {
                    instCell.classList.add('selected-cell');
                }

                const effectCmdCell = row.insertCell();
                effectCmdCell.textContent = trackData.effectCmd;
                effectCmdCell.classList.add('effect-cmd-cell');
                effectCmdCell.dataset.row = r;
                effectCmdCell.dataset.track = t;
                effectCmdCell.dataset.column = 'effectCmd';
                if (r === this.selectedCell.row && t === this.selectedCell.track && 'effectCmd' === this.selectedCell.column) {
                    effectCmdCell.classList.add('selected-cell');
                }

                const effectValCell = row.insertCell();
                effectValCell.textContent = trackData.effectVal;
                effectValCell.classList.add('effect-val-cell');
                effectValCell.dataset.row = r;
                effectValCell.dataset.track = t;
                effectValCell.dataset.column = 'effectVal';
                if (r === this.selectedCell.row && t === this.selectedCell.track && 'effectVal' === this.selectedCell.column) {
                    effectValCell.classList.add('selected-cell');
                }
            }
        }

        // this.tableElement = table; // Not needed if delegating from container
        this.containerElement.appendChild(table);
        // console.log("TrackerGrid rendered."); // Reduce console noise
    }

    /**
     * Attaches event listeners to the grid cells for selection using event delegation.
     */
    _attachEventListeners() {
        this.containerElement.addEventListener('click', (event) => {
            const cell = event.target.closest('td[data-row][data-track][data-column]');
            if (cell) {
                this.selectedCell.row = parseInt(cell.dataset.row);
                this.selectedCell.track = parseInt(cell.dataset.track);
                this.selectedCell.column = cell.dataset.column;

                // console.log(`Selected cell: R${this.selectedCell.row} T${this.selectedCell.track} Col:${this.selectedCell.column}`);
                this.render(); // Re-render to show new selection
            }
        });
        // console.log("TrackerGrid click listener attached to containerElement.");

        // Add keydown listener to the document for arrow key navigation
        // Using an arrow function to ensure 'this' context is correct for handleKeyDown
        document.addEventListener('keydown', (event) => this.handleKeyDown(event));
        // console.log("TrackerGrid keydown listener attached to document.");

        // Optional: Make the grid container focusable
        // this.containerElement.setAttribute('tabindex', '0');
    }

    handleKeyDown(event) {
        let newRow = this.selectedCell.row;
        let newTrack = this.selectedCell.track;
        let newColumn = this.selectedCell.column; // Keep current column unless changed by specific keys (e.g. Tab)
        let needsRender = false;
        let preventDefault = false;

        // Priority 1: Note/Data Entry if applicable column is selected
        if (this.selectedCell.column === 'note') {
            const trackData = this.patternData[this.selectedCell.row][this.selectedCell.track];
            let currentCellValue = trackData.note;
            let newCellValue = currentCellValue;

            // Letter (A-G) for note name
            if (event.key.length === 1 && event.key.match(/[a-g]/i)) {
                const keyUpper = event.key.toUpperCase();
                const currentOctaveMatch = currentCellValue.match(/-([0-9])$/);
                const octave = currentOctaveMatch ? currentOctaveMatch[1] : '4'; // Keep current octave or default to 4
                newCellValue = keyUpper + "-" + octave;
                preventDefault = true;
            }
            // Number (0-7) for octave
            else if (event.key.length === 1 && event.key.match(/[0-7]/) && currentCellValue !== "---" && currentCellValue.includes("-")) {
                const noteParts = currentCellValue.split('-'); // e.g. "C-4" or "F#-3"
                if (noteParts.length === 2 && noteParts[0].match(/^[A-G][#]?$/)) { // Ensure it's a valid note structure before changing octave
                    newCellValue = noteParts[0] + "-" + event.key;
                    preventDefault = true;
                }
            }
            // Hash (#) for sharp/flat toggle
            else if (event.key === '#' && currentCellValue !== "---" && currentCellValue.includes("-")) {
                const noteParts = currentCellValue.split('-'); // e.g. "C-4" or "C#-4"
                if (noteParts.length === 2) {
                    if (noteParts[0].includes("#")) { // Is sharp, remove it
                        newCellValue = noteParts[0].charAt(0) + "-" + noteParts[1]; // e.g. C#-4 -> C-4
                    } else if (noteParts[0].length === 1 && noteParts[0].match(/[A-G]/)) { // Is natural, add sharp (only if single letter like C, D, F, G, A)
                        if (noteParts[0] !== 'E' && noteParts[0] !== 'B') { // E and B don't typically get sharps this way
                           newCellValue = noteParts[0] + "#-" + noteParts[1]; // e.g. C-4 -> C#-4
                        }
                    }
                    preventDefault = true;
                }
            }
            // Delete or Backspace for clearing to "---"
            else if (event.key === 'Delete' || event.key === 'Backspace') {
                newCellValue = "---";
                preventDefault = true;
            }

            if (newCellValue !== currentCellValue) {
                this.patternData[this.selectedCell.row][this.selectedCell.track].note = newCellValue;
                // console.log(`GridData Changed: R${this.selectedCell.row}T${this.selectedCell.track} Col:${this.selectedCell.column} = ${newCellValue}`);
                needsRender = true;
            }
        }
        // Add similar blocks for 'instrument', 'effectCmd', 'effectVal' columns later

        if (needsRender) {
            if (preventDefault) event.preventDefault();
            this.render();
            return; // Handled data entry, skip navigation for this key press
        }

        // Priority 2: Navigation (Arrow keys etc.)
        // Reset preventDefault for navigation keys specifically
        preventDefault = false;
        switch (event.key) {
            case 'ArrowUp':
                newRow = Math.max(0, this.selectedCell.row - 1);
                preventDefault = true;
                break;
            case 'ArrowDown':
                newRow = Math.min(this.numRows - 1, this.selectedCell.row + 1);
                preventDefault = true;
                break;
            case 'ArrowLeft':
                // For now, simple track navigation. Column cycling would go here.
                newTrack = Math.max(0, this.selectedCell.track - 1);
                // Example of cycling columns (basic, can be improved)
                // if (this.selectedCell.track === 0 && this.selectedCell.column !== 'note') {
                //    const cols = ['effectVal', 'effectCmd', 'instrument', 'note'];
                //    newColumn = cols[cols.indexOf(this.selectedCell.column) + 1];
                // } else {
                //    newTrack = Math.max(0, this.selectedCell.track - 1);
                // }
                preventDefault = true;
                break;
            case 'ArrowRight':
                newTrack = Math.min(this.numTracks - 1, this.selectedCell.track + 1);
                // Example of cycling columns
                // if (this.selectedCell.track === this.numTracks - 1 && this.selectedCell.column !== 'effectVal') {
                //    const cols = ['note', 'instrument', 'effectCmd', 'effectVal'];
                //    newColumn = cols[cols.indexOf(this.selectedCell.column) + 1];
                // } else {
                //    newTrack = Math.min(this.numTracks - 1, this.selectedCell.track + 1);
                // }
                preventDefault = true;
                break;
            // Future: Tab for column navigation
            // case 'Tab':
            //     preventDefault = true;
            //     // Implement column cycling logic here
            //     break;
            default:
                return; // If no data entry and no navigation key, do nothing
        }

        if (preventDefault) event.preventDefault();

        if (newRow !== this.selectedCell.row || newTrack !== this.selectedCell.track || newColumn !== this.selectedCell.column) {
            this.selectedCell.row = newRow;
            this.selectedCell.track = newTrack;
            this.selectedCell.column = newColumn;
            this.render();
        }
    }

    /**
     * Updates a cell's data and re-renders that specific cell (or row for simplicity).
     * @param {number} row - Row index.
     * @param {number} track - Track index.
     * @param {object} newData - Object with new data for {note, instrument, effectCmd, effectVal}.
     */
    updateCell(row, track, newData) {
        if (row < this.numRows && track < this.numTracks) {
            this.patternData[row][track] = { ...this.patternData[row][track], ...newData };
            // For now, re-render the whole grid. Later, optimize to update only the changed cell/row.
            this.render();
            console.log(`Cell [${row}, ${track}] updated. New data:`, this.patternData[row][track]);
        } else {
            console.error("UpdateCell: Invalid row or track index.");
        }
    }

    /**
     * Gets the data for a specific cell.
     * @param {number} row - Row index.
     * @param {number} track - Track index.
     * @returns {object|null} The cell data or null if indices are invalid.
     */
    getCellData(row, track) {
        if (row < this.numRows && track < this.numTracks) {
            return this.patternData[row][track];
        }
        console.error("GetCellData: Invalid row or track index.");
        return null;
    }

    /**
     * Gets the pattern data for a specific step (row) across all tracks.
     * @param {number} stepIndex - The row index (step number).
     * @returns {Array<object>|Array} An array of track data objects for the step, or an empty array if invalid index.
     */
    getStepData(stepIndex) {
        if (stepIndex >= 0 && stepIndex < this.numRows) {
            return this.patternData[stepIndex];
        } else {
            console.warn(`TrackerGrid.getStepData: Invalid stepIndex ${stepIndex}`);
            return [];
        }
    }
}

export default TrackerGrid;

// How it might be initialized in a main application script:
//
// import TrackerGrid from './ui/grid.js';
//
// document.addEventListener('DOMContentLoaded', () => {
//     const gridContainer = document.getElementById('tracker-grid-container');
//     if (gridContainer) {
//         const trackerGrid = new TrackerGrid(gridContainer);
//         trackerGrid.init();
//
//         // Example of updating a cell
//         // trackerGrid.updateCell(0, 0, { note: 'D#5' });
//     } else {
//         console.error("Tracker grid container not found in the DOM.");
//     }
// });
//
// Note: The above initialization block should eventually live in a main app setup file,
// not here. This file should only define the TrackerGrid class.
// The index.html already links to this file, so if a main script imports and runs this, it will work.
// For direct initialization from index.html (less ideal for larger apps):
// <script type="module">
//     import TrackerGrid from './src/ui/grid.js';
//     const gridContainer = document.getElementById('tracker-grid-container');
//     if (gridContainer) {
//         const tbGrid = new TrackerGrid(gridContainer);
//         tbGrid.init();
//     }
// </script>
// This would go at the end of the body in index.html
// However, the subtask is only about creating grid.js.
// The existing script tags in index.html are `defer`, so DOMContentLoaded is not strictly needed
// if the main script that initializes components is also deferred and placed after component scripts.
