# Backend Standards

Thunderbird Chiptune Composer is currently a client‑only project. If a backend
is introduced in the future it should:

* Expose a simple REST API with JSON payloads.
* Sanitize all user input and avoid executing uploaded data.
* Use HTTPS and follow OWASP recommendations.
