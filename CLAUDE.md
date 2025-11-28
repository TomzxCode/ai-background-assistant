# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Background Assistant is a browser-based screen capture and monitoring tool with AI analysis capabilities:
- **Frontend**: Complete browser-based screen capture UI (HTML/CSS/JS) using Screen Capture API and File System Access API
- **AI Integration**: Real-time screenshot analysis using LLM.js with support for multiple providers (Groq, OpenAI, Anthropic, Google, Together AI, Ollama)

## Development Setup

```bash
# Install Python dependencies (for documentation only)
uv sync

# Serve frontend locally
python -m http.server 8080
# Then open http://localhost:8080 in a Chromium-based browser

# Serve documentation locally
uv run mkdocs serve

# Build and deploy documentation
uv run mkdocs build
uv run mkdocs gh-deploy
```

**Note**: The application runs entirely in the browser. No backend server is required for core functionality.

## Code Quality

Always run before committing (for Python code):
```bash
ruff format .
ruff check . --fix
```

Ruff configuration:
- Line length: 120
- Import sorting with first-party package: `ai_background_assistant`
- Selected rules: E (errors), F (pyflakes), I (isort)

## Documentation

Documentation uses MkDocs with Material theme and is located in `docs/index.md`. The documentation is comprehensive and covers:
- Installation and quick start
- Feature documentation (screen capture, AI analysis, file storage)
- Configuration (layered config system, LLM setup)
- Usage guide (frequency format, managing screenshots)
- Privacy and security considerations
- Browser compatibility matrix

## Architecture

### Frontend (Browser-based - Primary Component)
- **[index.html](index.html)**: Main UI with settings modal, screen capture controls, and screenshot history grid
- **[app.js](app.js)**: Core logic including:
  - Screen capture using `navigator.mediaDevices.getDisplayMedia()`
  - Frequency parser (format: `1d2h30m45s`)
  - LLM integration via LLM.js library
  - File System Access API for saving screenshots to disk
  - Layered configuration system (localStorage)
  - Screenshot history management (max 50 items)
- **[styles.css](styles.css)**: Material Design-inspired styling

Key features:
- Configurable capture frequency (format: `1d2h30m45s` - days, hours, minutes, seconds)
- AI-powered screenshot analysis with customizable prompts
- Multiple LLM provider support (Groq, OpenAI, Anthropic, Google, Together AI, Ollama)
- Local file storage (screenshots saved as PNG, analysis as TXT files)
- Screenshot preview and history (max 50 items in memory)
- Modal view for full-size screenshots
- Layered configuration using localStorage

## Important Notes

- Always update [SPEC.md](SPEC.md) when adding/removing features
- The project uses uv for package management (not pip)
- Frontend is **fully functional and independent** - no backend integration needed
- Screenshot data stored in browser memory by default (max 50 items)
- Optional persistent storage via File System Access API (Chromium browsers only)
- Requires HTTPS or localhost for Screen Capture API
- LLM API keys stored in browser localStorage
