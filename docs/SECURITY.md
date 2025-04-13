// Placeholder content for SECURITY.md


## BBS-Specific Security Considerations

### midi-import.js
- Validate file type (MIDI only).
- Enforce file size limits (e.g., < 1MB).
- Reject malformed headers or SysEx abuse.

### file-io.js
- Restrict write access based on user permissions.
- Sanitize file paths and names to avoid directory traversal.
- Enforce file extension validation.

