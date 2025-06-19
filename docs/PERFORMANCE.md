# Performance Tips

Use as few DOM updates as possible during playback. The audio engine schedules
notes ahead of time to avoid glitches, so avoid heavy synchronous work on the
main thread while the sequencer runs.
