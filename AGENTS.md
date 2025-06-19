# AGENTS.md - Guide for AI Development Agents

Welcome, AI Agent! This document provides guidelines and information for contributing to the Thunderbird Chiptune Composer project. Your primary goal is to assist in developing a robust, user-friendly, web-based chiptune tracker.

## 1. Project Overview

The Thunderbird Chiptune Composer is a web application that allows users to:
- Create and edit musical patterns using a tracker-style interface.
- Customize instruments with different waveforms and envelopes.
- Control playback (play, pause, stop, BPM).
- Visualize audio output.
- Save and load projects (initially via localStorage, potentially file-based later).

The project aims for a retro aesthetic and a highly interactive, keyboard-centric user experience.

## 2. Agent's Role & Responsibilities

As an AI development agent, you are expected to:
- **Understand the Codebase:** Familiarize yourself with the project structure (see `docs/CODE_MANIFEST.md` and `README.md`).
- **Write and Modify Code:** Implement new features, fix bugs, and refactor existing code across HTML, CSS, and JavaScript (ES Modules).
- **Adhere to Standards:** Follow guidelines outlined in `docs/UX_STANDARDS.md`, `docs/BACKEND_STANDARDS.md` (though this is primarily a frontend project, principles apply), and any inline code comments regarding style or approach.
- **Testing:**
    - Write unit tests for new functionality (see `tests/unit/`).
    - Assist in creating and running integration tests.
    - Perform conceptual testing of the application's features.
- **Documentation:**
    - Update existing documentation to reflect changes.
    - Create new documentation as needed (e.g., for new modules or complex features).
    - Maintain this `AGENTS.md` file if new agent-specific guidelines emerge.
- **Problem Solving:** Analyze issues, propose solutions, and implement them effectively.
- **Planning:** Create and follow development plans for complex tasks. Request user approval for plans.
- **Communication:** Provide clear updates on progress, ask clarifying questions when needed, and report any blockers.

## 3. Key Technologies and Architecture

- **Frontend:** HTML5, CSS3, JavaScript (ES Modules)
- **Audio:** Web Audio API
- **Core Modules:**
    - `src/audio/engine.js`: Core audio playback, scheduling, instrument synthesis.
    - `src/ui/grid.js`: The main tracker grid UI and interaction logic.
    - `src/ui/panels.js`: Manages UI panels (instrument editor, project settings).
    - `src/ui/transport.js`: Playback controls.
    - `src/ui/visualizer.js`: Audio visualization.
    - `src/main.js`: Application entry point, module coordinator.
- **Configuration:** `config.json` for default settings.
- **Assets:** Located in `assets/` (fonts, sprites, etc.).
- **Styling:** Uses plain CSS. Key files include `styles/core.css`, `styles/grid.css`, `styles/panels.css`, `styles/fonts.css`.

## 4. Current Development Focus (Example - to be updated by user/lead)

*As of [Current Date]:*
1.  **Stabilization:** Ensure all core features described in `README.md` are fully functional and robust.
2.  **Placeholder Removal:** Systematically remove all placeholder comments, stub functions, and incomplete code sections. Replace them with functional implementations or remove them if obsolete.
3.  **Bug Fixing:** Address known issues from user feedback or testing.
4.  **Feature Enhancement:** Based on user priorities (e.g., improving effects system, song structure management).

## 5. Agent Interaction Guidelines

- **Plan Approval:** For any non-trivial task, create a plan using the `set_plan` tool and request user approval via `request_user_input` before proceeding.
- **Subtasks:** Use the `run_subtask` tool for focused code changes, file manipulations, or running commands. Ensure subtask descriptions are clear and actionable.
- **Tool Usage:**
    - `ls()`: To explore file structure.
    - `read_files()`: To read specific file contents.
    - `plan_step_complete()`: To mark progress on the approved plan.
    - `message_user()`: For general updates or responses.
    - `request_user_input()`: When user feedback or explicit approval is required.
    - `submit()`: To commit completed and tested work with a clear commit message and appropriate branch name.
- **Error Handling:** If a tool fails or a subtask doesn't produce the expected output, analyze the error, revise your approach, and try again. Do not repeatedly try the exact same failing command.
- **Branching:** Assume work is done on a feature branch. The `submit()` tool will handle branch creation.
- **Commit Messages:** Follow standard commit message guidelines: a concise summary line, followed by a more detailed explanation if needed.
- **Idempotency:** Strive for your actions (especially in subtasks) to be idempotent where possible, or at least to be re-runnable without negative side effects if a previous attempt was interrupted.

## 6. What to Avoid

- **Making Assumptions:** If requirements are unclear, ask for clarification using `request_user_input`.
- **Direct DOM Manipulation outside UI Components:** Functionality should be encapsulated within the respective JavaScript modules.
- **Introducing New Dependencies:** Do not add new libraries or frameworks without explicit user approval.
- **Ignoring Errors:** Address errors from tools or subtasks before proceeding.
- **Submitting Untested Code:** Ensure changes are conceptually sound and, where applicable, covered by tests.

## 7. Getting Help

- If you are stuck due to limitations in your tools or understanding, clearly explain the issue to the user via `request_user_input`.
- Refer to existing documentation in the `docs/` folder.

By following these guidelines, you can effectively contribute to the Thunderbird Chiptune Composer project. We look forward to your assistance!
