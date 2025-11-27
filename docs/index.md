# AI Background Assistant

A web-based screen capture and monitoring tool for periodic screenshot capture and activity monitoring.

## Overview

AI Background Assistant is a browser-based screen capture UI built with HTML/CSS/JavaScript using the Screen Capture API. It runs entirely in the browser with no backend required.

## Quick Start

1. Clone or download this repository
2. Open [index.html](../index.html) in a modern web browser (Chrome, Firefox, Edge, Safari)
3. Grant screen capture permissions when prompted
4. Configure capture frequency and start capturing

**Note**: Requires HTTPS or localhost due to browser security requirements for the Screen Capture API.

## Features

### Current Features

- **Automated Screen Capture**: Capture screenshots at configurable intervals
- **Flexible Scheduling**: Custom time format (`1d2h30m45s`) for capture frequency
- **Screenshot History**: Grid view of up to 50 recent screenshots
- **Preview & Management**:
  - Live preview of latest capture
  - Full-size modal view
  - Individual screenshot deletion
  - Bulk clear history
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

### Managing Screenshots

- **View History**: Scroll through thumbnails in the history grid
- **Full View**: Click any thumbnail to view full-size in a modal
- **Delete**: Hover over a thumbnail and click the delete button
- **Clear All**: Use "Clear History" button to remove all screenshots

## Customization

### Persistent Storage

To save screenshots across page reloads, enable localStorage in [app.js](../app.js#L305-L311):

```javascript
window.addEventListener('load', () => {
    const saved = localStorage.getItem('screenshotHistory');
    if (saved) {
        screenshotHistory = JSON.parse(saved);
        updateHistory();
    }
});
```

### Screenshot Limit

Adjust the history limit in [app.js](../app.js#L180-L182):

```javascript
if (screenshotHistory.length > 50) {  // Change to desired limit
    screenshotHistory = screenshotHistory.slice(0, 50);
}
```

## Development

### Prerequisites

- Modern web browser (Chrome, Firefox, Edge, Safari)
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
├── index.html       # Main HTML structure
├── app.js          # Screen capture logic and event handlers
├── styles.css      # All styling and layout
├── README.md       # Project overview
└── docs/           # Documentation
    └── index.md    # This file
```

## Privacy & Security

**Important Privacy Notes**:

- Screenshots are stored in browser memory only (by default)
- Data is cleared on page reload unless localStorage is enabled
- No automatic upload to servers
- External API integration is opt-in via code modification
- Ensure compliance with local laws regarding screen capture

## Known Limitations

- Requires HTTPS or localhost (browser security requirement)
- Screenshot quality depends on display resolution
- Memory usage increases with screenshot count
- No mobile browser support (Screen Capture API unavailable on mobile)

**See Also**:

- [README.md](../README.md) - Project overview

## Contributing

Contributions are welcome! Please feel free to submit a pull request.

## License

See LICENSE file for details.

## Support

For issues, questions, or suggestions, please open an issue in the repository.
