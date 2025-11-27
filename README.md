# AI Background Assistant

A web-based screen capture tool that periodically takes screenshots for AI analysis and activity monitoring.

## Features

- **Automated Screen Capture**: Capture screenshots at configurable intervals
- **Flexible Scheduling**: Custom time format (`AdBhCmDs`) for capture frequency
- **Screenshot History**: View all captured screenshots in a grid layout
- **Preview & Management**:
  - Live preview of latest capture
  - Full-size modal view
  - Individual screenshot deletion
  - Bulk clear history
- **Memory Management**: Automatic limit of 50 screenshots to prevent browser memory issues
- **User-Friendly Interface**: Clean, modern UI with real-time status updates

## Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Edge, Safari)
- HTTPS connection or localhost (required for Screen Capture API)

### Installation

1. Clone or download this repository
2. Open `index.html` in your web browser
3. Grant screen capture permissions when prompted

### Usage

1. **Set Capture Frequency**:
   - Enter a time interval using the format: `AdBhCmDs`
   - Examples:
     - `30s` - Every 30 seconds
     - `1m` - Every 1 minute (default)
     - `2h30m` - Every 2 hours, 30 minutes
     - `1d12h` - Every 1 day, 12 hours

2. **Start Capture**:
   - Click "Start Screen Capture"
   - Select the screen/window to capture
   - First screenshot captured after 1 second

3. **View History**:
   - Scroll through captured screenshots in the history grid
   - Click any thumbnail to view full-size
   - Hover over thumbnails to see delete button

4. **Stop Capture**:
   - Click "Stop Capture" to end the session
   - History is preserved until page reload

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
- Screenshots are stored in browser memory only
- Data is cleared on page reload (unless localStorage is enabled)
- No automatic upload to servers (see customization)
- Ensure you have permission to capture screens in your jurisdiction

## Customization

### AI Integration

To send screenshots to an AI service, uncomment and modify the code in [app.js](app.js#L194-L200):

```javascript
fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: imageData })
});
```

### Persistent Storage

To save screenshots across page reloads, uncomment the localStorage code in [app.js](app.js#L305-L311):

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

Change the history limit in [app.js](app.js#L180-L182):

```javascript
if (screenshotHistory.length > 50) {  // Change 50 to your desired limit
    screenshotHistory = screenshotHistory.slice(0, 50);
}
```

## File Structure

```
ai-background-assistant/
- index.html       # Main HTML structure
- styles.css       # All styling and layout
- app.js          # Screen capture logic and event handlers
- README.md       # This file
- SPEC.md         # Technical specifications
```

## Known Limitations

- Requires HTTPS or localhost (browser security requirement)
- Screenshot quality depends on display resolution
- Memory usage increases with screenshot count
- No mobile browser support (Screen Capture API not available)

## Future Enhancements

- [ ] Export screenshots as ZIP file
- [ ] AI-powered screenshot analysis
- [ ] Activity tracking and reports
- [ ] Cloud storage integration
- [ ] Screenshot annotations
- [ ] OCR text extraction

## License

See LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a pull request.

## Support

For issues, questions, or suggestions, please open an issue in the repository.
