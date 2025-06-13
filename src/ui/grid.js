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
        this.editingCell = null; // Stores { row, track, column, originalValue, inputElement, tdElement }
        this.playingRow = -1; // Initialize playingRow to -1 (no row playing)
        this.clipboard = null; // To store the copied cell data object
        this.tableElement = null; // To store a reference to the main table element
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
            if (r === this.playingRow) {
                row.classList.add('playing-row');
            } else {
                row.classList.remove('playing-row'); // Ensure it's removed if not the playing row
            }

            const rowNumCell = row.insertCell();
            rowNumCell.textContent = r.toString().padStart(2, '0'); // Format row number
            rowNumCell.classList.add('row-number');

            for (let t = 0; t < this.numTracks; t++) {
                const trackData = this.patternData[r][t];
                const columnKeys = ['note', 'instrument', 'effectCmd', 'effectVal'];

                columnKeys.forEach(columnKey => {
                    const cell = row.insertCell();
                    cell.classList.add(`${columnKey}-cell`);
                    cell.dataset.row = r;
                    cell.dataset.track = t;
                    cell.dataset.column = columnKey;

                    if (this.editingCell && this.editingCell.row === r && this.editingCell.track === t && this.editingCell.column === columnKey) {
                        // If this cell is being edited, append the input element instead of text
                        cell.innerHTML = ''; // Clear any old content
                        cell.appendChild(this.editingCell.inputElement);
                        // Focus might need to be reapplied if render is called often
                        // this.editingCell.inputElement.focus();
                    } else {
                        cell.textContent = trackData[columnKey];
                    }

                    if (r === this.selectedCell.row && t === this.selectedCell.track && columnKey === this.selectedCell.column) {
                        cell.classList.add('selected-cell');
                    }
                });
            }
        }

        this.tableElement = table; // Store reference to the table
        this.containerElement.appendChild(this.tableElement);
        // console.log("TrackerGrid rendered."); // Reduce console noise
    }

    /**
     * Attaches event listeners to the grid cells for selection using event delegation.
     */
    _attachEventListeners() {
        // Single click for selection
        this.containerElement.addEventListener('click', (event) => {
            if (this.editingCell) { // If currently editing, a click outside might commit
                if (!this.editingCell.inputElement.contains(event.target)) {
                    this._commitEdit();
                }
                // If click is on input, let input's blur/keydown handle it
                return;
            }
            const cell = event.target.closest('td[data-row][data-track][data-column]');
            if (cell) {
                this.selectedCell.row = parseInt(cell.dataset.row);
                this.selectedCell.track = parseInt(cell.dataset.track);
                this.selectedCell.column = cell.dataset.column;
                this.render();
            }
        });

        // Double click to start editing
        this.containerElement.addEventListener('dblclick', (event) => {
            const cell = event.target.closest('td[data-row][data-track][data-column]');
            if (cell) {
                const columnKey = cell.dataset.column;
                if (columnKey === 'note') { // Only 'note' column editable for now
                    this._beginEdit(cell, parseInt(cell.dataset.row), parseInt(cell.dataset.track), columnKey);
                }
            }
        });

        document.addEventListener('keydown', (event) => this.handleKeyDown(event));
    }

    _createCellInputElement(value) {
        const input = document.createElement('input');
        input.type = 'text';
        input.value = value === "---" ? "" : value;
        input.classList.add('grid-cell-input');
        // Styles are better in CSS, but for quick setup:
        input.style.width = '100%';
        input.style.height = '100%';
        input.style.border = 'none';
        input.style.padding = '0';
        input.style.margin = '0';
        input.style.boxSizing = 'border-box';
        input.style.textAlign = 'center';
        input.style.backgroundColor = '#252530'; // Distinct editing background
        input.style.color = '#e0e0e0';       // Ensure text is visible

        input.addEventListener('blur', () => this._commitEdit());
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this._commitEdit();
                e.preventDefault();
            } else if (e.key === 'Escape') {
                this._cancelEdit();
                e.preventDefault();
            }
            // Stop arrow keys from navigating grid while editing cell
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.stopPropagation();
            }
        });
        return input;
    }

    _beginEdit(tdElement, row, track, columnKey) {
        if (this.editingCell) {
            // Check if trying to edit the same cell that's already being edited.
            if (this.editingCell.row === row && this.editingCell.track === track && this.editingCell.column === columnKey) {
                return; // Already editing this cell, do nothing.
            }
            this._commitEdit(); // Commit any previous edit.
        }

        // Ensure we are not trying to re-enter edit mode on a cell that was just committed by a click elsewhere.
        if (this.editingCell) return;


        const currentValue = this.patternData[row][track][columnKey];
        const inputElement = this._createCellInputElement(currentValue);

        this.editingCell = { row, track, column: columnKey, originalValue: currentValue, inputElement, tdElement };

        tdElement.innerHTML = ''; // Clear the cell content
        tdElement.appendChild(inputElement);
        inputElement.focus();
        inputElement.select();
        this.render(); // Re-render to ensure the input is placed and other cells are normal
    }

    _commitEdit() {
        if (!this.editingCell) return;

        const { row, track, column, inputElement, originalValue, tdElement } = this.editingCell;
        let newValue = inputElement.value.trim().toUpperCase();

        if (column === 'note') {
            if (newValue === "") {
                newValue = "---";
            } else if (!newValue.match(/^[A-G][#]?-[0-7]$/) && newValue !== "---") {
                console.warn(`Invalid note format: "${newValue}". Reverting to original.`);
                newValue = originalValue;
            }
        }
        // Add validation for other column types here in future

        if (this.patternData[row][track][column] !== newValue) {
            this.patternData[row][track][column] = newValue;
            console.log(`Committed edit: R${row}T${track} Col:${column} = ${newValue}`);
            // Potentially emit an event here: this.emit('cellChanged', { row, track, column, newValue });
        }

        tdElement.innerHTML = ''; // Remove input
        tdElement.textContent = newValue; // Set text of cell

        this.editingCell = null;
        // No full re-render needed here if only text content of one cell changes
        // However, if other UI elements depend on this data, a full render or targeted update might be needed.
        // For now, let's call render to ensure selection highlight is correct if focus changes.
        // this.render(); // Re-rendering here can cause focus loss issues.
        // Instead, let's ensure the selected cell class is correctly managed if needed.
        // Since selection is handled by single click and render, this direct text update is okay.
    }

    _cancelEdit() {
        if (!this.editingCell) return;

        const { originalValue, tdElement } = this.editingCell;
        tdElement.innerHTML = ''; // Remove input
        tdElement.textContent = originalValue; // Restore original value
        this.editingCell = null;
        // this.render(); // Similar to commit, avoid full render if possible to maintain focus context.
    }

    findTdForSelectedCell() {
        if (!this.selectedCell || !this.tableElement) {
            // console.warn("findTdForSelectedCell: No selectedCell or tableElement");
            return null;
        }
        return this.tableElement.querySelector(
            `td[data-row="${this.selectedCell.row}"][data-track="${this.selectedCell.track}"][data-column="${this.selectedCell.column}"]`
        );
    }


    handleKeyDown(event) {
        if (this.editingCell) {
            if (event.key === 'Tab') {
                // Allow Tab to commit and then bubble for navigation if _commitEdit doesn't preventDefault on Tab.
                // Assuming _commitEdit is synchronous and editingCell will be null after it.
            } else {
                return; // Other keys handled by input's own listeners
            }
        }

        // Ctrl+C/Cmd+C (Copy) or Ctrl+X/Cmd+X (Cut, treated as copy)
        if ((event.ctrlKey || event.metaKey) && (event.key.toLowerCase() === 'c' || event.key.toLowerCase() === 'x')) {
            if (this.selectedCell) {
                const cellData = this.patternData[this.selectedCell.row][this.selectedCell.track];
                this.clipboard = JSON.parse(JSON.stringify(cellData));
                console.log('Cell data copied to clipboard:', this.clipboard);
                event.preventDefault();
            }
            return;
        }

        // Ctrl+V/Cmd+V (Paste)
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'v') {
            if (this.selectedCell && this.clipboard) {
                const dataToPaste = JSON.parse(JSON.stringify(this.clipboard));
                this.patternData[this.selectedCell.row][this.selectedCell.track] = dataToPaste;
                console.log('Pasted data to cell:', this.selectedCell, dataToPaste);
                this.render();
                event.preventDefault();
            }
            return;
        }

        let { row, track, column } = this.selectedCell;
        let preventDefault = false;
        let needsRender = false;

        // Edit initiation / Direct data modification (when NOT editing)
        if (!this.editingCell) { // This check is now slightly redundant due to the top check, but good for clarity
            if (event.key === 'Enter' && column === 'note') {
                const td = this.findTdForSelectedCell();
                if (td) {
                    this._beginEdit(td, row, track, column);
                    event.preventDefault();
                    return;
                }
            } else if (column === 'note' && event.key.match(/^[a-zA-Z0-9#\-]$/) && !event.ctrlKey && !event.metaKey && !event.altKey) {
                const td = this.findTdForSelectedCell();
                if (td) {
                    this._beginEdit(td, row, track, column);
                    if (this.editingCell && this.editingCell.inputElement) {
                        if (event.key === '-') { this.editingCell.inputElement.value = event.key; }
                        else if (event.key.match(/^[a-gA-G]$/)) { this.editingCell.inputElement.value = event.key.toUpperCase() + "-4"; }
                        else { this.editingCell.inputElement.value = event.key.toUpperCase(); }
                        this.editingCell.inputElement.select();
                    }
                    event.preventDefault();
                    return;
                }
            } else if ((event.key === 'Delete' || event.key === 'Backspace') && column === 'note') {
                // Direct delete/backspace when not editing the 'note' cell
                if (this.patternData[row][track].note !== "---") {
                    this.patternData[row][track].note = "---";
                    const td = this.findTdForSelectedCell();
                    if (td) {
                        td.textContent = "---"; // Direct DOM update
                    } else {
                        needsRender = true; // Fallback to full render if TD not found
                    }
                    console.log(`Cleared cell R${row}T${track}C${column} via direct key press.`);
                }
                event.preventDefault();
                if (needsRender) this.render(); // Render only if fallback was needed
                return; // Handled
            }
        }

        // If needsRender was set by any prior logic that didn't return (e.g. future direct edits for other columns)
        // This path is currently not hit due to early returns after direct modifications.
        // if (needsRender) {
        //     if (preventDefault) event.preventDefault();
        //     this.render();
        //     return;
        // }

        // Navigation keys (Tab, Shift+Tab, Arrows)
        let newRow = row;
        let newTrack = track;
        let newColumn = column;

        if (event.key === 'Tab') {
            preventDefault = true;
            const columnsOrder = ['note', 'instrument', 'effectCmd', 'effectVal'];
            const currentColumnIndex = columnsOrder.indexOf(column);
            let newColIdx = currentColumnIndex;

            if (event.shiftKey) {
                newColIdx--;
                if (newColIdx < 0) {
                    newColIdx = columnsOrder.length - 1;
                    newTrack--;
                    if (newTrack < 0) { newTrack = this.numTracks - 1; }
                }
            } else {
                newColIdx++;
                if (newColIdx >= columnsOrder.length) {
                    newColIdx = 0;
                    newTrack++;
                    if (newTrack >= this.numTracks) { newTrack = 0; }
                }
            }
            newColumn = columnsOrder[newColIdx];
        } else {
            switch (event.key) {
                case 'ArrowUp':
                    newRow = Math.max(0, row - 1);
                    preventDefault = true;
                    break;
                case 'ArrowDown':
                    newRow = Math.min(this.numRows - 1, row + 1);
                    preventDefault = true;
                    break;
                case 'ArrowLeft':
                    newTrack = Math.max(0, track - 1);
                    preventDefault = true;
                    break;
                case 'ArrowRight':
                    newTrack = Math.min(this.numTracks - 1, track + 1);
                    preventDefault = true;
                    break;
                default:
                    return;
            }
        }

        if (preventDefault) event.preventDefault();

        if (newRow !== row || newTrack !== track || newColumn !== column) {
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

    /**
     * Sets the currently playing row for visual feedback.
     * @param {number} rowIndex - The index of the row currently being played by the sequencer.
     *                            -1 to clear the highlight.
     */
    setPlayingRow(rowIndex) {
        if (this.playingRow !== rowIndex) {
            this.playingRow = rowIndex;
            this.render();
        } else if (rowIndex === -1 && this.playingRow !== -1) {
            // Explicitly clear if called with -1 and something was highlighted
            this.playingRow = -1;
            this.render();
        }
    }

    /**
     * Returns the entire pattern data.
     * @returns {Array<Array<object>>} The current pattern data.
     */
    getPatternData() {
        return this.patternData;
    }

    /**
     * Sets the entire pattern data and re-renders the grid.
     * @param {Array<Array<object>>} data - The new pattern data.
     */
    setPatternData(data) {
        if (data && Array.isArray(data)) { // Basic validation
            this.patternData = data;
            this.numRows = data.length;
            this.numTracks = data.length > 0 ? data[0].length : 0; // Assuming consistent track count
            this.render(); // Re-render with new data
            console.log("TrackerGrid: Pattern data updated and grid re-rendered.");
        } else {
            console.warn("TrackerGrid.setPatternData: Invalid data provided.");
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
