/**
 * @file Audio Visualizer UI component for Thunderbird Chiptune Composer.
 * Displays visual feedback based on the audio output.
 */

class Visualizer {
    /**
     * Creates an instance of Visualizer.
     * @param {HTMLElement} containerElement - The DOM element to render the visualizer into.
     * @param {AudioContext} [audioContext] - The Web Audio API AudioContext.
     * @param {AnalyserNode} [analyserNode] - An AnalyserNode to get audio data from.
     */
    constructor(containerElement, audioContext, analyserNode) {
        if (!containerElement) {
            throw new Error("Container element is required for Visualizer.");
        }
        this.containerElement = containerElement;
        this.audioContext = audioContext;
        this.analyserNode = analyserNode;

        this.canvas = null;
        this.canvasCtx = null;
        this.animationFrameId = null;

        // Placeholder properties for simple animation
        this.xPosition = 0;
        this.direction = 1;
        this.barHeight = 20;
    }

    /**
     * Initializes the visualizer by creating the canvas and setting up basic properties.
     */
    init() {
        this.containerElement.innerHTML = ''; // Clear previous content

        this.canvas = document.createElement('canvas');
        this.canvas.id = 'audio-visualizer-canvas';
        this.containerElement.appendChild(this.canvas);
        this.canvasCtx = this.canvas.getContext('2d');

        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas()); // Adjust canvas on window resize

        console.log("Visualizer initialized.");
        this.startAnimation(); // Start drawing immediately
    }

    /**
     * Resizes the canvas to fit its container.
     */
    resizeCanvas() {
        if (this.canvas) {
            this.canvas.width = this.containerElement.clientWidth;
            this.canvas.height = this.containerElement.clientHeight || 100; // Default height if container has none
            console.log(`Visualizer canvas resized to ${this.canvas.width}x${this.canvas.height}`);
        }
    }

    /**
     * Starts the animation loop for drawing the visualization.
     */
    startAnimation() {
        if (this.animationFrameId) {
            this.stopAnimation();
        }
        const animationLoop = () => {
            this.draw();
            this.animationFrameId = requestAnimationFrame(animationLoop);
        };
        this.animationFrameId = requestAnimationFrame(animationLoop);
        console.log("Visualizer animation started.");
    }

    /**
     * Stops the animation loop.
     */
    stopAnimation() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
            console.log("Visualizer animation stopped.");
        }
    }

    /**
     * Draws the visualization on the canvas.
     * This will draw a simple placeholder if no AnalyserNode is provided or active.
     */
    draw() {
        if (!this.canvasCtx || !this.canvas) return;

        const width = this.canvas.width;
        const height = this.canvas.height;

        // Clear canvas
        this.canvasCtx.fillStyle = 'rgb(20, 20, 30)'; // Dark background
        this.canvasCtx.fillRect(0, 0, width, height);

        if (this.analyserNode) {
            // Example: Drawing frequency data (bar graph)
            this.analyserNode.fftSize = 256; // Adjust as needed
            const bufferLength = this.analyserNode.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            this.analyserNode.getByteFrequencyData(dataArray);

            this.canvasCtx.fillStyle = 'rgb(50, 150, 250)';
            const barWidth = (width / bufferLength) * 2.5;
            let barX = 0;

            for (let i = 0; i < bufferLength; i++) {
                const barHeightValue = dataArray[i];
                const barHeightScaled = (barHeightValue / 255) * height;

                this.canvasCtx.fillRect(barX, height - barHeightScaled, barWidth, barHeightScaled);
                barX += barWidth + 1; // +1 for spacing
            }
        } else {
            // Placeholder visualization: A simple bouncing horizontal line
            this.canvasCtx.fillStyle = 'rgb(100, 200, 250)';

            // Update position for the bouncing line
            this.xPosition += 2 * this.direction;
            if (this.xPosition > width - 50 || this.xPosition < 0) {
                this.direction *= -1;
            }
            // Ensure xPosition stays within bounds if resize happens mid-animation
            this.xPosition = Math.max(0, Math.min(this.xPosition, width - 50));


            const yPosition = height / 2 - this.barHeight / 2;
            this.canvasCtx.fillRect(this.xPosition, yPosition, 50, this.barHeight);

            this.canvasCtx.font = '12px Arial';
            this.canvasCtx.fillStyle = 'rgb(200, 200, 200)';
            this.canvasCtx.textAlign = 'center';
            this.canvasCtx.fillText('Visualizer Active (Placeholder)', width / 2, height / 2 - 20);
        }
    }

    /**
     * Connects an AnalyserNode to the visualizer.
     * @param {AnalyserNode} analyserNode
     */
    connectAnalyser(analyserNode) {
        this.analyserNode = analyserNode;
        console.log("AnalyserNode connected to Visualizer.");
    }

    /**
     * Disconnects the AnalyserNode.
     */
    disconnectAnalyser() {
        this.analyserNode = null;
        console.log("AnalyserNode disconnected from Visualizer.");
    }
}

export default Visualizer;

// How it might be initialized in a main application script:
//
// import Visualizer from './ui/visualizer.js';
// import audioEngine from './audio/engine.js'; // Assuming audioEngine is initialized and has an analyser
//
// document.addEventListener('DOMContentLoaded', () => {
//     const visualizerContainer = document.getElementById('visualizer-container');
//     if (visualizerContainer) {
//         // Assuming audioEngine is initialized and has an analyserNode accessible
//         // For example, audioEngine.masterGain could be connected to an analyserNode,
//         // and that analyserNode is exposed by the audioEngine instance.
//         // const analyser = audioEngine.getAnalyserNode(); // Hypothetical method
//
//         // For now, initialize without a real analyser for placeholder visuals
//         const visualizer = new Visualizer(visualizerContainer);
//         visualizer.init(); // This also starts the animation
//
//         // Later, if an analyser is available from the audio engine:
//         // if (audioEngine && audioEngine.analyserNode) { // Or however it's exposed
//         //    visualizer.connectAnalyser(audioEngine.analyserNode);
//         // }
//
//     } else {
//         console.error("Visualizer container not found in the DOM.");
//     }
// });
//
// As with other UI modules, the above init logic is for a main app script.
// The subtask is focused on creating visualizer.js.
// Example in main.js:
// import Visualizer from './ui/visualizer.js';
// import audioEngine from './audio/engine.js'; // if it exposes an analyser
//
// const visualizerContainer = document.getElementById('visualizer-container');
// const visualizer = new Visualizer(visualizerContainer, audioEngine.audioContext, audioEngine.analyserNode); // Pass nodes if available
// visualizer.init();
// If analyserNode is added to audioEngine later, visualizer.connectAnalyser(audioEngine.analyserNode) can be called.
