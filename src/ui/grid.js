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
    }

    /**
     * Initializes the grid by rendering it.
     */
    init() {
        this.render();
        this._attachEventListeners(); // Placeholder for event listeners
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

                const instCell = row.insertCell();
                instCell.textContent = trackData.instrument;
                instCell.classList.add('instrument-cell');
                instCell.dataset.row = r;
                instCell.dataset.track = t;
                instCell.dataset.column = 'instrument';

                const effectCmdCell = row.insertCell();
                effectCmdCell.textContent = trackData.effectCmd;
                effectCmdCell.classList.add('effect-cmd-cell');
                effectCmdCell.dataset.row = r;
                effectCmdCell.dataset.track = t;
                effectCmdCell.dataset.column = 'effectCmd';

                const effectValCell = row.insertCell();
                effectValCell.textContent = trackData.effectVal;
                effectValCell.classList.add('effect-val-cell');
                effectValCell.dataset.row = r;
                effectValCell.dataset.track = t;
                effectValCell.dataset.column = 'effectVal';
            }
        }

        this.containerElement.appendChild(table);
        console.log("TrackerGrid rendered.");
    }

    /**
     * Placeholder for attaching event listeners to the grid cells.
     */
    _attachEventListeners() {
        // Example:
        // this.containerElement.addEventListener('click', (event) => {
        //     const cell = event.target.closest('td[data-row]');
        //     if (cell) {
        //         const row = cell.dataset.row;
        //         const track = cell.dataset.track;
        //         const column = cell.dataset.column;
        //         console.log(`Clicked cell: Row ${row}, Track ${track}, Column ${column}`);
        //         // Handle cell selection, input focus, etc.
        //     }
        // });
        console.log("TrackerGrid event listeners placeholder.");
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
