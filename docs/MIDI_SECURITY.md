# MIDI Security Notes

MIDI parsing utilities only handle simple type‑0 files. Imported files are
limited to 1 MB and validated for standard headers to avoid malformed data or
potential exploits.
