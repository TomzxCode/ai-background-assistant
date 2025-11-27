# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Background Assistant is a screen capture and monitoring tool with two components:
- **Frontend**: Browser-based screen capture UI (HTML/CSS/JS) that uses the Screen Capture API
- **Backend**: FastAPI server (planned/minimal implementation) for AI analysis of captured screenshots

## Development Setup

```bash
# Install dependencies and create virtual environment
uv sync

# Start API server (when implemented)
uv run uvicorn ai_background_assistant.main:app --reload

# Serve frontend locally
# Open index.html in browser or use a local server
python -m http.server 8080
```

## Code Quality

Always run before committing:
```bash
ruff format .
ruff check . --fix
```

Ruff configuration:
- Line length: 120
- Import sorting with first-party package: `ai_background_assistant`
- Selected rules: E (errors), F (pyflakes), I (isort)

## Documentation

Documentation uses MkDocs with Material theme:
```bash
# Serve docs locally
uv run mkdocs serve

# Build docs
uv run mkdocs build

# Deploy to GitHub Pages
uv run mkdocs gh-deploy
```

Note: The current docs/index.md contains k8s-cli documentation (likely copied from another project) and should be updated to reflect this project's actual functionality.

## Architecture

### Frontend (Browser-based)
- **index.html**: Main UI with screen capture controls and screenshot history
- **app.js**: Core screen capture logic using `navigator.mediaDevices.getDisplayMedia()`
- **styles.css**: Material Design-inspired styling

Key features:
- Configurable capture frequency (format: `1d2h30m45s` - days, hours, minutes, seconds)
- Screenshot preview and history (max 50 items in memory)
- Modal view for full-size screenshots
- TODO: Send captured frames to backend API for AI processing (line 176-182 in app.js)

### Backend (Python/FastAPI)
- **Package**: `ai_background_assistant` (currently empty except `__init__.py`)
- **CLI entry point**: `aiba` command (defined in pyproject.toml, not yet implemented)
- **Dependencies**: FastAPI, Uvicorn

The backend is intended to:
- Receive screenshot data from the frontend
- Process images with AI models
- Provide analysis and insights

## Important Notes

- Always update SPEC.md when adding/removing features
- The project uses uv for package management (not pip)
- Frontend operates independently; backend integration is pending
- Screenshot data is currently stored only in browser memory (not persisted)
