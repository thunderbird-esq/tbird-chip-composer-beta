import { AudioEngine } from '../../src/audio/engine.js';

// Mock global AudioBuffer constructor for instanceof checks
global.AudioBuffer = jest.fn(function AudioBufferMock() {});

describe('AudioEngine', () => {
    let audioEngineInstance;
    let mockAudioContext;
    let mockGainNode;
    let mockAudioBufferSourceNode;
    let mockAudioBuffer;

    beforeEach(() => {
        // Create a new instance for each test to ensure isolation
        audioEngineInstance = new AudioEngine();

        // Mock AudioBufferSourceNode
        mockAudioBufferSourceNode = {
            buffer: null,
            connect: jest.fn(),
            start: jest.fn(),
            stop: jest.fn(),
            loop: false,
            loopStart: 0,
            loopEnd: 0,
            onended: null,
        };

        // Mock GainNode
        mockGainNode = {
            gain: {
                value: 0.7,
                setValueAtTime: jest.fn(),
                linearRampToValueAtTime: jest.fn(),
                exponentialRampToValueAtTime: jest.fn(),
                setTargetAtTime: jest.fn(),
                cancelScheduledValues: jest.fn(),
            },
            connect: jest.fn(),
            disconnect: jest.fn(),
        };

        // Mock AudioContext
        mockAudioContext = {
            currentTime: 0,
            state: 'running',
            decodeAudioData: jest.fn(),
            createBufferSource: jest.fn(() => mockAudioBufferSourceNode),
            createGain: jest.fn(() => mockGainNode),
            resume: jest.fn(() => Promise.resolve()),
            destination: {} // Simple mock for destination
        };

        // Mock AudioBuffer
        mockAudioBuffer = new global.AudioBuffer(); // Use the mocked constructor

        // Assign the mock context to the instance.
        // This bypasses the need to mock `window.AudioContext` for the `init()` method,
        // assuming we can control the `audioContext` property directly for testing.
        // If `init()` must be called, we'd mock `window.AudioContext` instead.
        audioEngineInstance.audioContext = mockAudioContext;
        audioEngineInstance.masterGain = mockGainNode; // Also assign mock masterGain

        // Mock window.fetch
        global.fetch = jest.fn();

        // Spy on console messages
        jest.spyOn(console, 'error').mockImplementation(() => {});
        jest.spyOn(console, 'warn').mockImplementation(() => {});
        jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        // Restore original console functions and fetch
        jest.restoreAllMocks();
        // Clear loaded samples for the next test if using a shared instance (not the case here)
        // audioEngineInstance.loadedSamples.clear();
    });

    describe('loadSound', () => {
        it('should load and decode audio data successfully', async () => {
            const mockUrl = 'mock_url.wav';
            const mockArrayBuffer = new ArrayBuffer(8);

            global.fetch.mockResolvedValueOnce({
                ok: true,
                arrayBuffer: () => Promise.resolve(mockArrayBuffer),
            });
            // The actual AudioEngine.loadSound uses `await this.audioContext.decodeAudioData(arrayBuffer);`
            // so it expects decodeAudioData to return a Promise.
            mockAudioContext.decodeAudioData.mockResolvedValue(mockAudioBuffer);

            const result = await audioEngineInstance.loadSound(mockUrl);

            expect(global.fetch).toHaveBeenCalledWith(mockUrl);
            expect(mockAudioContext.decodeAudioData).toHaveBeenCalledWith(mockArrayBuffer);
            expect(result).toBe(mockAudioBuffer);
            expect(audioEngineInstance.loadedSamples.get(mockUrl)).toBe(mockAudioBuffer);
        });

        it('should return null if fetch fails (response not ok)', async () => {
            const mockUrl = 'fetch_error_url.wav';
            global.fetch.mockResolvedValueOnce({
                ok: false,
                status: 404,
            });

            const result = await audioEngineInstance.loadSound(mockUrl);

            expect(result).toBeNull();
            expect(audioEngineInstance.loadedSamples.has(mockUrl)).toBe(false);
            expect(console.error).toHaveBeenCalledWith(expect.stringContaining('HTTP error! status: 404'), expect.stringContaining(mockUrl));
        });

        it('should return null if fetch throws an error (network issue)', async () => {
            const mockUrl = 'fetch_network_error.wav';
            const networkError = new Error('Network error');
            global.fetch.mockRejectedValueOnce(networkError);

            const result = await audioEngineInstance.loadSound(mockUrl);
            expect(result).toBeNull();
            expect(audioEngineInstance.loadedSamples.has(mockUrl)).toBe(false);
            expect(console.error).toHaveBeenCalledWith(expect.stringContaining(`Error fetching sound from ${mockUrl}`), networkError);
        });


        it('should return null if decodeAudioData fails', async () => {
            const mockUrl = 'decode_error_url.wav';
            const mockArrayBuffer = new ArrayBuffer(8);
            const decodeError = new Error('Decode error');
            global.fetch.mockResolvedValueOnce({
                ok: true,
                arrayBuffer: () => Promise.resolve(mockArrayBuffer),
            });
            mockAudioContext.decodeAudioData.mockRejectedValueOnce(decodeError);

            const result = await audioEngineInstance.loadSound(mockUrl);

            expect(result).toBeNull();
            expect(audioEngineInstance.loadedSamples.has(mockUrl)).toBe(false);
            expect(console.error).toHaveBeenCalledWith(expect.stringContaining(`Error decoding audio data from ${mockUrl}`), decodeError);
        });

        it('should return existing buffer if sound is already loaded', async () => {
            const mockUrl = 'already_loaded.wav';
            audioEngineInstance.loadedSamples.set(mockUrl, mockAudioBuffer);

            const fetchSpy = jest.spyOn(global, 'fetch'); // Re-spy after global mock in beforeEach

            const result = await audioEngineInstance.loadSound(mockUrl);

            expect(result).toBe(mockAudioBuffer);
            expect(fetchSpy).not.toHaveBeenCalled();
        });

        it('should return null if audioContext is not initialized', async () => {
            audioEngineInstance.audioContext = null;
            const result = await audioEngineInstance.loadSound('any_url.wav');
            expect(result).toBeNull();
            expect(console.error).toHaveBeenCalledWith("AudioContext not initialized. Cannot load sound.");
        });
    });

    describe('playSound', () => {
        it('should create buffer source, connect and start it', () => {
            audioEngineInstance.playSound(mockAudioBuffer, 0);

            expect(mockAudioContext.createBufferSource).toHaveBeenCalledTimes(1);
            expect(mockAudioBufferSourceNode.buffer).toBe(mockAudioBuffer);
            expect(mockAudioBufferSourceNode.connect).toHaveBeenCalledWith(audioEngineInstance.masterGain);
            expect(mockAudioBufferSourceNode.start).toHaveBeenCalledWith(0);
        });

        it('should log an error if AudioContext is not initialized', () => {
            audioEngineInstance.audioContext = null;
            audioEngineInstance.playSound(mockAudioBuffer, 0);
            expect(console.error).toHaveBeenCalledWith("AudioContext not initialized. Cannot play sound.");
            expect(mockAudioContext.createBufferSource).not.toHaveBeenCalled();
        });

        it('should log an error if masterGain is not initialized', () => {
            audioEngineInstance.masterGain = null;
            audioEngineInstance.playSound(mockAudioBuffer, 0);
            expect(console.error).toHaveBeenCalledWith("MasterGain not initialized. Cannot play sound.");
            // createBufferSource might still be called if audioContext exists, but connect would fail.
            // The current implementation checks audioContext, then buffer, then masterGain.
            // So, if audioContext is present but masterGain is null, createBufferSource would not be called
            // if the buffer check happens before masterGain check, OR if masterGain check is before createBufferSource.
            // Let's check the actual implementation: audioContext, buffer, masterGain. So createBufferSource won't be called.
            expect(mockAudioContext.createBufferSource).not.toHaveBeenCalled();
        });

        it('should log an error for invalid AudioBuffer (not an instanceof AudioBuffer)', () => {
            const invalidBuffer = {}; // Not an AudioBuffer instance
            audioEngineInstance.playSound(invalidBuffer, 0);

            expect(console.error).toHaveBeenCalledWith("Invalid AudioBuffer provided to playSound.");
            expect(mockAudioContext.createBufferSource).not.toHaveBeenCalled();
        });

        it('should handle errors during playback setup (e.g. source.start throws)', () => {
            const playbackError = new Error("Failed to start");
            // Ensure createBufferSource is called, but start throws
            mockAudioContext.createBufferSource.mockReturnValueOnce(mockAudioBufferSourceNode);
            mockAudioBufferSourceNode.start.mockImplementationOnce(() => {
                throw playbackError;
            });

            audioEngineInstance.playSound(mockAudioBuffer, 0);

            expect(mockAudioContext.createBufferSource).toHaveBeenCalledTimes(1);
            expect(mockAudioBufferSourceNode.start).toHaveBeenCalledWith(0);
            expect(console.error).toHaveBeenCalledWith("Error playing sound:", playbackError);
        });
    });
});
