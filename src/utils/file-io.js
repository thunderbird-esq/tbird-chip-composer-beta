/**
 * @file file-io.js
 * Utility functions for handling file input/output operations.
 */

/**
 * Triggers a browser download for the given content.
 * @param {string} content - The content to be downloaded.
 * @param {string} fileName - The suggested name for the downloaded file.
 * @param {string} contentType - The MIME type of the content.
 */
function triggerDownload(content, fileName, contentType) {
    const a = document.createElement("a");
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    document.body.appendChild(a); // Required for Firefox
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
}

/**
 * Saves application data as a JSON file.
 * Assumes 'songData' is a globally accessible object or passed in.
 * For a modular approach, this function should accept the data to save as an argument.
 * @param {object} dataToSave - The JavaScript object to save as JSON.
 * @param {string} defaultFileName - The default file name (e.g., "song.json").
 */
export function saveSongToFile(dataToSave, defaultFileName = "chiptune-song.json") {
    if (!dataToSave) {
        console.error("No data provided to save.");
        alert("Error: No data to save.");
        return;
    }
    try {
        const jsonData = JSON.stringify(dataToSave, null, 2); // Pretty print JSON
        triggerDownload(jsonData, defaultFileName, "application/json");
    } catch (error) {
        console.error("Error saving song data:", error);
        alert(`Error saving file: ${error.message}`);
    }
}

/**
 * Loads song data from a user-selected JSON file.
 * @returns {Promise<object|null>} A promise that resolves with the parsed JSON object, or null if an error occurs or no file is selected.
 */
export function loadSongFromFile() {
    return new Promise((resolve, reject) => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "application/json,.json"; // Accept JSON files

        input.onchange = (event) => {
            const file = event.target.files[0];
            if (!file) {
                resolve(null); // No file selected
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const parsedData = JSON.parse(e.target.result);
                    resolve(parsedData);
                } catch (error) {
                    console.error("Error parsing JSON from file:", error);
                    alert(`Error loading file: ${error.message}`);
                    reject(error); // Or resolve(null) depending on desired error handling
                }
            };
            reader.onerror = (error) => {
                console.error("FileReader error:", error);
                alert(`Error reading file: ${error.message}`);
                reject(error); // Or resolve(null)
            };
            reader.readAsText(file);
        };

        input.click();
    });
}

// Example of how these might be integrated (conceptual):
// Assuming you have buttons with id="save-button" and id="load-button"
// and a global or state-managed 'currentSongData' object.

// document.getElementById('save-button')?.addEventListener('click', () => {
//     // const currentSongData = getMyCurrentSongData(); // Function to get your app's song data
//     // if (currentSongData) {
//     //     saveSongToFile(currentSongData, "my-chiptune.json");
//     // }
// });

// document.getElementById('load-button')?.addEventListener('click', async () => {
//     // try {
//     //     const loadedData = await loadSongFromFile();
//     //     if (loadedData) {
//     //         // setMyCurrentSongData(loadedData); // Function to set your app's song data
//     //         console.log("Song loaded successfully:", loadedData);
//     //         // Update UI accordingly
//     //     } else {
//     //         console.log("No file selected or file load cancelled.");
//     //     }
//     // } catch (error) {
//     //     console.error("Failed to load song:", error);
//     //     // UI feedback for error
//     // }
// });
