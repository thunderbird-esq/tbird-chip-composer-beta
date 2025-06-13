/**
 * @file UI Panels component for Thunderbird Chiptune Composer.
 * Handles the creation and management of various control panels.
 */

/**
 * Represents a single UI Panel.
 */
class UIPanel {
    /**
     * Creates an instance of UIPanel.
     * @param {object} config - Configuration for the panel.
     * @param {string} config.id - A unique ID for the panel element.
     * @param {string} config.title - Text for the panel's title bar.
     * @param {HTMLElement|string} config.contentElement - An HTML element or HTML string for the panel's content.
     */
    constructor({ id, title, contentElement }) {
        if (!id || !title) {
            throw new Error("Panel ID and Title are required.");
        }
        this.id = id;
        this.title = title;
        this.contentElement = contentElement;
        this.panelElement = null; // Will hold the rendered panel
    }

    /**
     * Renders the panel and appends it to the provided container.
     * @param {HTMLElement} containerElement - The DOM element to append this panel to.
     * @returns {HTMLElement} The rendered panel element.
     */
    render(containerElement) {
        if (!containerElement) {
            throw new Error("A container element is required to render the panel.");
        }

        this.panelElement = document.createElement('div');
        this.panelElement.id = this.id;
        this.panelElement.classList.add('ui-panel');

        const titleBar = document.createElement('div');
        titleBar.classList.add('panel-title-bar');
        titleBar.textContent = this.title;
        this.panelElement.appendChild(titleBar);

        const contentArea = document.createElement('div');
        contentArea.classList.add('panel-content');

        if (typeof this.contentElement === 'string') {
            contentArea.innerHTML = this.contentElement;
        } else if (this.contentElement instanceof HTMLElement) {
            contentArea.appendChild(this.contentElement);
        } else {
            contentArea.textContent = 'Invalid content for panel.';
        }
        this.panelElement.appendChild(contentArea);

        containerElement.appendChild(this.panelElement);
        return this.panelElement;
    }

    /**
     * Updates the content of the panel.
     * @param {HTMLElement|string} newContentElement - New content for the panel.
     */
    updateContent(newContentElement) {
        if (!this.panelElement) {
            console.warn(`Panel ${this.id} has not been rendered yet. Cannot update content.`);
            return;
        }
        const contentArea = this.panelElement.querySelector('.panel-content');
        if (contentArea) {
            contentArea.innerHTML = ''; // Clear existing content
            if (typeof newContentElement === 'string') {
                contentArea.innerHTML = newContentElement;
            } else if (newContentElement instanceof HTMLElement) {
                contentArea.appendChild(newContentElement);
            }
            this.contentElement = newContentElement; // Update stored content
        }
    }

    // Add methods for show/hide, etc. later if needed
}

/**
 * Manages a collection of UI Panels.
 */
class PanelManager {
    constructor() {
        this.panels = new Map(); // Stores UIPanel instances by ID
        this.containerElement = null;
    }

    /**
     * Initializes the PanelManager with a container where panels will be rendered.
     * @param {string} containerSelector - CSS selector for the panels' container element.
     */
    init(containerSelector) {
        this.containerElement = document.querySelector(containerSelector);
        if (!this.containerElement) {
            console.error(`PanelManager: Container element with selector "${containerSelector}" not found.`);
            return false;
        }
        console.log(`PanelManager initialized with container: ${containerSelector}`);
        this._createDefaultPanels(); // Create default panels upon initialization
        this.renderPanels();
        return true;
    }

    /**
     * Creates and adds a new panel to the manager.
     * @param {object} panelConfig - Configuration object for the UIPanel (id, title, contentElement).
     * @returns {UIPanel|null} The created UIPanel instance or null if creation failed.
     */
    addPanel(panelConfig) {
        if (!panelConfig || !panelConfig.id) {
            console.error("Panel configuration with an ID is required to add a panel.");
            return null;
        }
        if (this.panels.has(panelConfig.id)) {
            console.warn(`Panel with ID "${panelConfig.id}" already exists. Use updatePanel or remove it first.`);
            return this.panels.get(panelConfig.id);
        }

        try {
            const panel = new UIPanel(panelConfig);
            this.panels.set(panel.id, panel);
            console.log(`Panel "${panel.title}" (ID: ${panel.id}) added.`);

            // If manager is already initialized, render the new panel immediately
            if (this.containerElement) {
                panel.render(this.containerElement);
            }
            return panel;
        } catch (error) {
            console.error("Failed to create panel:", error);
            return null;
        }
    }

    /**
     * Retrieves a panel by its ID.
     * @param {string} id - The ID of the panel to retrieve.
     * @returns {UIPanel|undefined} The UIPanel instance or undefined if not found.
     */
    getPanel(id) {
        return this.panels.get(id);
    }

    /**
     * Renders all managed panels into the container.
     * If panels are already rendered, this might clear and re-render or be smarter.
     * For now, it assumes panels once added are rendered if container is set.
     */
    renderPanels() {
        if (!this.containerElement) {
            console.error("PanelManager: Container element not set. Call init() first.");
            return;
        }
        this.containerElement.innerHTML = ''; // Clear existing panels before re-rendering all
        this.panels.forEach(panel => {
            panel.render(this.containerElement);
        });
        console.log("All panels rendered.");
    }

    /**
     * Creates a set of default panels.
     * This is called internally by init().
     */
    _createDefaultPanels() {
        this.addPanel({
            id: 'instrument-editor-panel',
            title: 'Instrument Editor',
            contentElement: `
                <div id="instrument-editor-content">
                    <p>Editing Instrument: <strong id="editing-inst-id">--</strong> (<span id="editing-inst-name">--</span>)</p>
                    <div id="instrument-details-form">
                        <label for="inst-waveform">Waveform:</label>
                        <select id="inst-waveform">
                            <option value="sine">Sine</option>
                            <option value="square">Square</option>
                            <option value="sawtooth">Sawtooth</option>
                            <option value="triangle">Triangle</option>
                        </select><br>

                        <label for="inst-attack">Attack (s):</label>
                        <input type="number" id="inst-attack" step="0.001" min="0.001" value="0.01"><br>

                        <label for="inst-decay">Decay (s):</label>
                        <input type="number" id="inst-decay" step="0.001" min="0.001" value="0.1"><br>

                        <button id="update-instrument-button">Update Instrument '01'</button>
                    </div>
                    <p><small>Currently editing Instrument '01'. Other instrument selection will be added later.</small></p>
                </div>
            `
        });

        this.addPanel({
            id: 'project-settings-panel',
            title: 'Project Settings',
            contentElement: `
                <div id="project-settings-content">
                    <label for="project-name">Project Name:</label>
                    <input type="text" id="project-name" value="My Chiptune"><br><br>

                    <label for="setting-bpm">BPM (Beats Per Minute):</label>
                    <input type="number" id="setting-bpm" step="1" min="20" max="999" value="120"><br><br>

                    <button id="update-project-settings-button">Update Settings</button>
                    <p><small>Other settings like global swing, song length, etc., can be added later.</small></p>
                </div>
            `
        });

        this.addPanel({
            id: 'sample-library-panel',
            title: 'Sample Library (Placeholder)',
            contentElement: '<p>If samples are supported, they would be managed here.</p>'
        });
    }

    /**
     * Updates the content of a specific panel.
     * @param {string} panelId - The ID of the panel to update.
     * @param {HTMLElement|string} newContentElement - The new HTML content for the panel.
     */
    updatePanelContent(panelId, newContentElement) {
        const panel = this.getPanel(panelId);
        if (panel) {
            panel.updateContent(newContentElement);
            console.log(`PanelManager: Content updated for panel "${panelId}".`);
        } else {
            console.warn(`PanelManager: Panel "${panelId}" not found for content update.`);
        }
    }
}

export { UIPanel, PanelManager };

// How it might be initialized in a main application script:
//
// import { PanelManager } from './ui/panels.js';
//
// document.addEventListener('DOMContentLoaded', () => {
//     const panelManager = new PanelManager();
//     // The container for panels is defined in index.html as #control-panels-container
//     panelManager.init('#control-panels-container');
//     // Default panels are created and rendered by init()
//
//     // Example of adding another panel later:
//     // panelManager.addPanel({
//     //     id: 'extra-panel',
//     //     title: 'Another Panel',
//     //     contentElement: 'Some more controls...'
//     // });
// });
//
// As with grid.js, the above initialization block should live in a main app setup file.
// The index.html links to this file, so if a main script imports and runs this, it will work.
// For direct init (less ideal):
// <script type="module">
//     import { PanelManager } from './src/ui/panels.js';
//     const panelManager = new PanelManager();
//     panelManager.init('#control-panels-container');
// </script>
// This would go at the end of body in index.html.
// Subtask is only about creating panels.js.
// The existing script tags in index.html are `defer`.
// A main script would import PanelManager and call init.
// For example, in a main.js:
// import { PanelManager } from './ui/panels.js';
// const panelManager = new PanelManager();
// panelManager.init('#control-panels-container');
