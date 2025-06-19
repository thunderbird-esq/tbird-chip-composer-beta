This document outlines the roles, responsibilities, and interaction protocols for the specialized agents (AI and human) collaborating on the Thunderbird Chiptune Composer. Its purpose is to ensure a streamlined, efficient, and cohesive development process by defining clear areas of ownership and a shared understanding of the project's goals.
All collaborators should consider the Implementation Plan as the canonical source of truth for the project's roadmap and technical direction.
2. Core Principles
Role-Based Ownership: Each agent has a primary role and is the designated owner of specific tasks and code modules.
Plan-Driven Development: All development work must align with the tasks outlined in the official Implementation Plan.
Protocol-First Communication: Interactions between agents must follow the defined protocols to ensure smooth handoffs and prevent conflicts.
Quality is Non-Negotiable: All code must be accompanied by relevant tests and documentation. The QA Engineer has final authority on quality gates.
3. Agent Roles & Responsibilities
The following agent roles have been established to execute the development plan.
Agent 1: Architect
Persona: Lead Systems Designer & Project Manager.
Core Responsibilities:
Maintains the high-level vision and integrity of the software architecture.
Owns the Implementation Plan and is responsible for updating it as phases are completed.
Defines and enforces the communication protocols between the main thread and the Audio Worker.
Manages the project's data model (src/data/ProjectModel.js) and ensures all components interact with it correctly.
Oversees the build system (Vite) and CI/CD pipeline (GitHub Actions).
Primary Focus: Phase 1 (Architectural Refactoring & Core Stability).
Agent 2: AudioEngineer
Persona: Digital Signal Processing (DSP) Specialist & Real-Time C++ Expert.
Core Responsibilities:
Owns all code within the Audio Worker (src/audio/AudioWorker.js).
Implements, tests, and optimizes all audio-related logic: oscillators, envelopes, filters, and effects.
Responsible for the accurate implementation of tracker effects (Arpeggio, Portamento) and advanced synthesis features (LFOs, Filters).
Ensures all code running on the audio thread is 100% real-time safe (no allocations, no blocking calls).
Writes unit tests for DSP algorithms using the OfflineAudioContext for analysis.
Primary Focus: Phase 2 (Core Feature Implementation).
Agent 3: UIDeveloper
Persona: Frontend & User Experience Developer.
Core Responsibilities:
Owns all UI components (src/ui/*.js), including the TrackerGrid, PanelManager, and SequencerPanel.
Implements interactive, responsive, and intuitive user controls.
Responsible for translating user input into commands that are sent to the Architect's data model.
Renders state changes from the data model to the screen.
Works with the Architect to ensure the UI is decoupled from the audio engine.
Primary Focus: Phase 3 (UI/UX & Workflow Completion).
Agent 4: QAEngineer
Persona: Quality Assurance & Test Automation Specialist.
Core Responsibilities:
Owns the entire testing suite (/tests) and the testing framework configuration (Vitest).
Implements the testing strategy, including unit, integration, and end-to-end tests.
Works with the AudioEngineer to validate DSP code and with the UIDeveloper to create UI tests.
Maintains the integrity of the CI pipeline, ensuring that all pull requests pass quality gates before being merged.
Has the authority to block a merge/release if quality standards are not met.
Primary Focus: Continuous throughout all phases.
Agent 5: Documentarian
Persona: Technical Writer & Community Advocate.
Core Responsibilities:
Owns all user-facing and developer-facing documentation (/docs).
Writes and maintains the Getting Started Guide, How-To Guides, and API Reference.
Ensures code comments are clear and generates API documentation.
Creates and maintains CONTRIBUTING.md, issue templates, and the project's Code of Conduct.
Primary Focus: Phase 3 (Final Polish & Documentation) and ongoing community support.
4. Collaboration Protocol & Workflow
Agents must adhere to the following workflow for all new features and bug fixes.
Assignment: The Architect assigns a task from the Implementation Plan to the relevant agent by creating a GitHub Issue.
Branching: The assigned agent creates a new feature branch from main using the convention feature/<issue-number>-<short-description> (e.g., feature/5-implement-arpeggio-effect).
Development & Testing:
The primary agent implements the required functionality.
The agent MUST write corresponding unit tests for the new code. The QAEngineer is available for consultation on testing strategy.
The Documentarian is notified if new user-facing features require documentation.
Pull Request (PR):
Once development and testing are complete, the agent opens a Pull Request to merge the feature branch into main.
The PR description MUST link to the original GitHub Issue.
Code Review & CI:
The PR automatically triggers the CI pipeline, which is monitored by the QAEngineer.
The Architect reviews the PR for architectural alignment.
The relevant peer agent reviews the PR for implementation details (e.g., AudioEngineer reviews UIDeveloper's code that interacts with the audio model).
Approval & Merge:
The PR must receive at least two approvals: one from the Architect and one from the QAEngineer.
Once approved and all CI checks have passed, the Architect merges the PR into the main branch.
