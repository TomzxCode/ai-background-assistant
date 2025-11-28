# AI Background Assistant

A web-based screen capture tool that periodically takes screenshots with integrated AI analysis and activity monitoring.

## Features

- **Automated Screen Capture**: Capture screenshots at configurable intervals
- **Flexible Scheduling**: Custom time format (`AdBhCmDs`) for capture frequency
- **AI Analysis Integration**: Real-time screenshot analysis using LLM.js with configurable providers (Groq, OpenAI, Anthropic, etc.)
- **Screenshot History**: View all captured screenshots with AI analysis in a grid layout
- **Preview & Management**:
  - Live preview of latest capture
  - AI analysis displayed alongside each screenshot
  - Full-size modal view
  - Individual screenshot deletion
  - Bulk clear history
- **File System Storage**: Save screenshots and analysis to disk using the File System Access API
- **Layered Configuration**: Persistent settings with application-specific and global defaults
- **Memory Management**: Automatic limit of 50 screenshots to prevent browser memory issues
- **User-Friendly Interface**: Clean, modern UI with real-time status updates

## Getting Started

### Prerequisites

- Modern Chromium-based browser (Chrome, Edge) for full feature support
  - Screen Capture API
  - File System Access API (for saving to disk)
- HTTPS connection or localhost (required for Screen Capture API)
- LLM API key (optional, for AI analysis):
  - Groq API (default)
  - OpenAI
  - Anthropic
  - Or other LLM.js-compatible providers

### Installation

1. Clone or download this repository
2. Open `index.html` in your web browser
3. Grant screen capture permissions when prompted

### Usage

1. **Configure Settings** (click ⚙️ icon):
   - **Capture Frequency**: Enter interval using format `AdBhCmDs` (e.g., `1m`, `30s`, `2h30m`)
   - **AI Analysis**: Toggle on/off
   - **Analysis Prompt**: Customize what you want the AI to analyze
   - **LLM Provider**: Select service (Groq, OpenAI, Anthropic, etc.)
   - **Model**: Specify the model to use
   - **API Key**: Enter your LLM provider API key
   - **Max Tokens**: Set response length limit
   - **Save Directory** (optional): Choose where to save screenshots to disk

2. **Start Capture**:
   - Click "Start Screen Capture"
   - Select the screen/window to capture
   - First screenshot captured after 1 second
   - AI analysis runs automatically if enabled

3. **View History**:
   - Scroll through captured screenshots with AI analysis in the history grid
   - Click any thumbnail to view full-size
   - Read AI insights for each screenshot
   - Hover over thumbnails to see delete button

4. **Stop Capture**:
   - Click "Stop Capture" to end the session
   - History is preserved in browser memory
   - Saved files remain on disk if directory was configured

## Frequency Format

The capture frequency uses the format `AdBhCmDs` where:
- `A` = number of days (d)
- `B` = number of hours (h)
- `C` = number of minutes (m)
- `D` = number of seconds (s)

**Valid Examples**:
- `10s` => 10 seconds
- `5m` => 5 minutes
- `1h` => 1 hour
- `2h30m` => 2 hours and 30 minutes
- `1d2h30m45s` => 1 day, 2 hours, 30 minutes, and 45 seconds

**Constraints**:
- Minimum: 1 second
- Maximum: 7 days
- Must include at least one time unit

## Privacy & Security

� **Important Privacy Notes**:
- Screenshots are stored in browser memory by default
- Optional disk storage uses File System Access API (local only)
- AI analysis requires sending screenshots to your configured LLM provider
- LLM API keys are stored in browser localStorage
- Settings are persisted locally using layered configuration system
- No automatic upload to third-party servers beyond your chosen LLM provider
- Ensure you have permission to capture and analyze screens in your jurisdiction

## Configuration

### Layered Configuration System

The application uses a layered configuration approach with localStorage:

1. **Application-specific settings** (`ai-background-assistant` key):
   - Analysis prompt
   - LLM service, model, API key
   - Max tokens

2. **Global defaults** (`llm-defaults` key):
   - Fallback values for LLM configuration
   - Shared across multiple applications

Settings are loaded in order: application-specific → global defaults → hardcoded defaults.

### LLM Configuration

Configure AI analysis in the Settings modal or via localStorage:

```javascript
localStorage.setItem('ai-background-assistant', JSON.stringify({
    service: 'groq',
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    api_key: 'your-api-key-here',
    max_tokens: 8192,
    analysisPrompt: 'Analyze this screenshot and describe what you see.'
}));
```

### Screenshot Limit

Change the history limit in [app.js:397-399](app.js#L397-L399):

```javascript
if (screenshotHistory.length > 50) {  // Change 50 to your desired limit
    screenshotHistory = screenshotHistory.slice(0, 50);
}
```

### File Naming

Screenshot files are saved with timestamp format in [app.js:203](app.js#L203):
```
screenshot_YYYYMMDD_HHMMSS.png
screenshot_YYYYMMDD_HHMMSS_analysis.txt
```

## File Structure

```
ai-background-assistant/
├── index.html              # Main HTML structure with settings modal
├── styles.css              # All styling and layout
├── app.js                  # Screen capture, LLM integration, and event handlers
├── README.md               # This file
├── SPEC.md                 # Technical specifications
└── CLAUDE.md               # Claude Code project guidance
```

## Known Limitations

- Requires HTTPS or localhost (browser security requirement)
- File System Access API only available in Chromium browsers (Chrome, Edge)
- Screenshot quality depends on display resolution
- Memory usage increases with screenshot count
- LLM analysis adds latency to capture process
- API keys stored in localStorage (consider security implications)
- No mobile browser support (Screen Capture API not available)

## Future Enhancements

- [ ] Export screenshots as ZIP file
- [ ] Advanced LLM analysis features (trends, summaries, insights)
- [ ] Activity tracking and productivity reports
- [ ] Multiple analysis profiles/prompts
- [ ] Cloud storage integration
- [ ] Screenshot annotations
- [ ] OCR text extraction
- [ ] IndexedDB for larger screenshot history
- [ ] Scheduled capture (start/stop at specific times)

## License

See LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a pull request.

## Support

For issues, questions, or suggestions, please open an issue in the repository.
