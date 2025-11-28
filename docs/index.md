# AI Background Assistant

A web-based screen capture and monitoring tool for periodic screenshot capture with integrated AI analysis capabilities.

## Overview

AI Background Assistant is a browser-based screen capture application built with HTML/CSS/JavaScript using the Screen Capture API. It combines automated screenshot capture with optional AI-powered analysis using various LLM providers. The application runs entirely in the browser with no backend required.

## Quick Start

1. Clone or download this repository
2. Open [index.html](../index.html) in a modern web browser (Chrome, Edge, or other Chromium-based browsers recommended)
3. Click the ⚙️ Settings button to configure:
   - Capture frequency (default: 1m)
   - Save location for screenshots
   - AI analysis options (LLM provider, model, API key)
4. Grant screen capture permissions when prompted
5. Click "Start Screen Capture" to begin monitoring

**Note**: Requires HTTPS or localhost due to browser security requirements for the Screen Capture API.

## Features

### Current Features

- **Automated Screen Capture**: Capture screenshots at configurable intervals
- **Flexible Scheduling**: Custom time format (`1d2h30m45s`) for capture frequency
- **AI-Powered Analysis**: Optional LLM integration for automatic screenshot analysis
  - Supports multiple providers: Groq, OpenAI, Anthropic, Google, Together AI, Ollama
  - Customizable analysis prompts
  - Configurable model selection and max tokens
- **Local File Storage**: Save screenshots and AI analysis to a selected directory
- **Screenshot History**: Grid view of up to 50 recent screenshots with inline analysis
- **Preview & Management**:
  - Live preview of latest capture
  - Full-size modal view
  - Individual screenshot deletion
  - Bulk clear history
- **Layered Configuration**: Settings hierarchy using localStorage (app-specific → defaults)
- **Memory Management**: Automatic 50-screenshot limit to prevent browser memory issues

## Usage Guide

### Setting Capture Frequency

The capture frequency uses a flexible time format: `AdBhCmDs`

- `A` = number of days (d)
- `B` = number of hours (h)
- `C` = number of minutes (m)
- `D` = number of seconds (s)

**Examples**:

- `10s` - Every 10 seconds
- `5m` - Every 5 minutes
- `1h` - Every 1 hour
- `2h30m` - Every 2 hours and 30 minutes
- `1d2h30m45s` - Every 1 day, 2 hours, 30 minutes, and 45 seconds

**Constraints**:

- Minimum: 1 second
- Maximum: 7 days
- Must include at least one time unit

### Capturing Screenshots

1. Enter desired frequency in the input field
2. Click "Start Screen Capture"
3. Select the screen/window to capture from the browser prompt
4. First screenshot captured after 1 second
5. Click "Stop Capture" to end the session

### Configuring AI Analysis

1. **Open Settings**: Click the ⚙️ Settings button
2. **Enable AI Analysis**: Check the "Enable AI Analysis" checkbox (enabled by default)
3. **Select LLM Service**: Choose from supported providers:
   - Groq (default)
   - OpenAI
   - Anthropic
   - Google
   - Together AI
   - Ollama (Local)
4. **Enter Model Name**: Specify the model (e.g., `meta-llama/llama-4-scout-17b-16e-instruct`, `gpt-4o`, `claude-3-5-sonnet-20241022`)
5. **Add API Key**: Enter your API key for the selected service
6. **Configure Max Tokens**: Set the maximum token limit (default: 8192)
7. **Customize Prompt**: Edit the analysis prompt to tailor AI responses
8. **Save Settings**: Click "Save Settings" to persist configuration

**Note**: API keys and settings are stored locally in your browser's localStorage.

### Setting Up File Storage

1. Click the ⚙️ Settings button
2. Click "Select Directory" under Save Location
3. Choose a folder where screenshots will be saved
4. Screenshots will be saved as PNG files with timestamps
5. AI analysis results will be saved as accompanying .txt files

**File Naming Format**:
- Screenshot: `screenshot_YYYYMMDD_HHMMSS.png`
- Analysis: `screenshot_YYYYMMDD_HHMMSS_analysis.txt`

### Managing Screenshots

- **View History**: Scroll through thumbnails in the history grid
- **Read Analysis**: Each screenshot displays its AI analysis inline
- **Full View**: Click any thumbnail to view full-size in a modal
- **Delete**: Hover over a thumbnail and click the × button
- **Clear All**: Use "Clear All History" button to remove all screenshots from browser memory

**Note**: Screenshots in browser memory are cleared on page reload. Use file storage to persist captures.

## Configuration

### Layered Configuration System

The application uses a layered configuration approach with localStorage:

1. **Application-Specific Settings** (`ai-background-assistant` key):
   - Takes precedence over defaults
   - Stores: `analysisPrompt`, `api_key`, `service`, `model`, `max_tokens`

2. **Default Settings** (`llm-defaults` key):
   - Fallback values when app-specific settings are not defined

3. **Hardcoded Defaults**:
   - Final fallback if no localStorage values exist
   - Service: `groq`
   - Model: `meta-llama/llama-4-scout-17b-16e-instruct`
   - Max Tokens: `8192`

### Customization

#### Screenshot History Limit

Adjust the history limit in [app.js](../app.js#L396-L399):

```javascript
if (screenshotHistory.length > 50) {  // Change to desired limit
    screenshotHistory = screenshotHistory.slice(0, 50);
}
```

#### Persistent Screenshot History

To save screenshots across page reloads in localStorage (not recommended for large histories), uncomment [app.js](../app.js#L562-L569):

```javascript
window.addEventListener('load', () => {
    const saved = localStorage.getItem('screenshotHistory');
    if (saved) {
        screenshotHistory = JSON.parse(saved);
        updateHistory();
    }
});
```

**Warning**: Storing base64 image data in localStorage can quickly exceed browser limits.

## Development

### Prerequisites

- Modern web browser (Chrome, Edge, or other Chromium-based browsers recommended for File System Access API)
- Text editor or IDE
- Optional: Local web server for testing (e.g., `python -m http.server`)

### Setup

```bash
# Clone repository
git clone <repository-url>
cd ai-background-assistant

# Open in browser
# Simply open index.html in your browser
# or serve with a local server:
python -m http.server 8080
```

### File Structure

```
ai-background-assistant/
├── index.html              # Main HTML structure with settings modal
├── app.js                  # Screen capture logic, LLM integration, event handlers
├── styles.css              # All styling and layout
├── README.md               # Project overview
├── CLAUDE.md               # Developer guidance for Claude Code
├── SPEC.md                 # Technical specifications
└── docs/                   # Documentation
    └── index.md            # This file
```

## Privacy & Security

**Important Privacy Notes**:

- **Browser Memory**: Screenshots are stored in browser memory by default and cleared on page reload
- **Local Storage Only**: When file storage is enabled, screenshots are saved locally to your selected directory
- **API Keys**: LLM API keys are stored in browser localStorage and never transmitted except to the configured LLM service
- **AI Analysis**: When enabled, screenshot data is sent to the configured LLM provider's API
- **No Backend Server**: The application runs entirely in the browser - no data is sent to any backend controlled by this project
- **User Consent**: Screen capture and directory access require explicit user permission via browser prompts

**Security Considerations**:

1. **API Key Storage**: Keys are stored in plaintext in localStorage - use browser security best practices
2. **Screenshot Content**: Ensure you have permission to capture and analyze screen content
3. **LLM Provider Privacy**: Review the privacy policy of your chosen LLM provider regarding data handling
4. **File System Access**: The application can only write to the directory you explicitly select

## Browser Compatibility

### Supported Browsers

- ✅ **Chrome/Chromium** (recommended) - Full support including File System Access API
- ✅ **Edge** - Full support including File System Access API
- ⚠️ **Firefox** - Screen capture supported, File System Access API not supported
- ⚠️ **Safari** - Limited support, may require additional permissions

### Feature Availability

| Feature | Chrome/Edge | Firefox | Safari |
|---------|-------------|---------|--------|
| Screen Capture | ✅ | ✅ | ⚠️ |
| File Storage (File System Access API) | ✅ | ❌ | ❌ |
| AI Analysis (llm.js) | ✅ | ✅ | ✅ |
| localStorage | ✅ | ✅ | ✅ |

**Note**: Chromium-based browsers (Chrome, Edge) provide the best experience with full feature support.

## Known Limitations

- Requires HTTPS or localhost (browser security requirement)
- File System Access API only available in Chromium-based browsers
- Screenshot quality depends on display resolution
- Memory usage increases with screenshot count (limited to 50 items)
- No mobile browser support (Screen Capture API unavailable on mobile)
- LLM analysis requires internet connection and valid API key
- Large screenshots may impact browser performance

## Troubleshooting

### Common Issues

**"Your browser does not support the File System Access API"**
- Use Chrome, Edge, or another Chromium-based browser
- Screenshots can still be viewed in browser history without file storage

**"Error analyzing screenshot with LLM"**
- Verify API key is correct in Settings
- Check that the selected model is available for your LLM service
- Ensure you have sufficient API credits/quota
- Check browser console for detailed error messages

**Screen capture stops unexpectedly**
- The capture stream automatically stops if you close or switch away from the captured window
- Click "Start Screen Capture" again to resume

**Screenshots not saving to disk**
- Ensure you've selected a directory in Settings
- Verify the browser has write permissions to the selected folder
- Check browser console for permission errors

## See Also

- [README.md](../README.md) - Project overview
- [SPEC.md](../SPEC.md) - Technical specifications
- [CLAUDE.md](../CLAUDE.md) - Developer guidance

## Contributing

Contributions are welcome! Please feel free to submit a pull request.

## License

See LICENSE file for details.

## Support

For issues, questions, or suggestions, please open an issue in the repository.
