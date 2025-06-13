/**
 * @file Basic Audio Visualizer for Thunderbird Chiptune Composer.
 * Displays a simple representation of audio output.
 */

class Visualizer {
    /**
     * Creates an instance of Visualizer.
     * @param {HTMLElement} containerElement - The DOM element to render the visualizer into.
     * @param {AudioEngine} audioEngine - The main audio engine instance.
     */
    constructor(containerElement, audioEngine) {
        if (!containerElement) {
            throw new Error("Container element is required for Visualizer.");
        }
        if (!audioEngine || !audioEngine.audioContext) {
            throw new Error("AudioEngine with an initialized AudioContext is required for Visualizer.");
        }
        this.containerElement = containerElement;
        this.audioEngine = audioEngine;
        this.canvas = null;
        this.canvasCtx = null;
        this.analyserNode = null;
        this.dataArray = null;
        this.animationFrameId = null;

        this._setupAnalyser();
    }

    _setupAnalyser() {
        this.analyserNode = this.audioEngine.audioContext.createAnalyser();
        this.analyserNode.fftSize = 256; // Smaller FFT for simpler visualization
        this.analyserNode.smoothingTimeConstant = 0.85;

        // Connect analyser to the master gain (or a point just before destination)
        // Assuming audioEngine.masterGain is the final node before destination
        this.audioEngine.masterGain.connect(this.analyserNode);
        // NOTE: Do NOT connect analyserNode to destination, it's for analysis only.

        this.dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);
    }

    init() {
        this.containerElement.innerHTML = ''; // Clear container
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.containerElement.clientWidth || 300;
        this.canvas.height = this.containerElement.clientHeight || 100;
        this.containerElement.appendChild(this.canvas);
        this.canvasCtx = this.canvas.getContext('2d');

        if (!this.canvasCtx) {
            console.error("Failed to get 2D context from canvas for visualizer.");
            return;
        }

        this.draw(); // Start drawing loop
        console.log("Visualizer initialized and drawing started.");
    }

    draw() {
        if (!this.canvasCtx || !this.analyserNode) {
            return;
        }

        // Get time domain data (waveform)
        this.analyserNode.getByteTimeDomainData(this.dataArray);

        this.canvasCtx.fillStyle = 'rgb(20, 20, 30)'; // Background color
        this.canvasCtx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.canvasCtx.lineWidth = 2;
        this.canvasCtx.strokeStyle = 'rgb(50, 200, 50)'; // Waveform color
        this.canvasCtx.beginPath();

        const sliceWidth = this.canvas.width * 1.0 / this.analyserNode.frequencyBinCount;
        let x = 0;

        for (let i = 0; i < this.analyserNode.frequencyBinCount; i++) {
            const v = this.dataArray[i] / 128.0; // Normalize to 0.0 - 2.0
            const y = v * this.canvas.height / 2;

            if (i === 0) {
                this.canvasCtx.moveTo(x, y);
            } else {
                this.canvasCtx.lineTo(x, y);
            }
            x += sliceWidth;
        }

        this.canvasCtx.lineTo(this.canvas.width, this.canvas.height / 2);
        this.canvasCtx.stroke();

        this.animationFrameId = requestAnimationFrame(() => this.draw());
    }

    stop() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        // Optional: Disconnect analyser node if visualizer is to be permanently stopped/destroyed
        // if (this.analyserNode && this.audioEngine.masterGain) {
        //     this.analyserNode.disconnect(this.audioEngine.masterGain);
        // }
        console.log("Visualizer drawing stopped.");
    }
}

export default Visualizer;
