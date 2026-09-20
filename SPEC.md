# Technical Specification

## AI Background Assistant - Screen Capture Application

**Version**: 0.1.0
**Last Updated**: 2025-11-27

---

## 1. Overview

### 1.1 Purpose
A client-side web application that captures screenshots at user-defined intervals with AI-powered analysis and local file storage capabilities.

### 1.2 Architecture
- **Type**: Single Page Application (SPA)
- **Architecture Pattern**: Client-side only
- **Technologies**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **External Dependencies**: LLM.js (client-side AI integration)
- **APIs Used**:
  - Screen Capture API (`getDisplayMedia`)
  - Canvas API
  - LocalStorage API (configuration and settings)
  - File System Access API (saving screenshots to disk)

---

## 2. System Architecture

### 2.1 Component Structure

```

           index.html
  (DOM Structure & Entry Point)
                 |
                 |
                 v

       +                 +
   styles.css         app.js
  (Presentation)     (Business
                       Logic)
                     +
                     |
                  LLM.js
              (AI Analysis)
```

### 2.2 Data Flow

The application follows this processing pipeline:

1. **User Configuration**: Frequency settings, LLM options, output directory
2. **Screen Capture**: Video stream via `getDisplayMedia()`
3. **Frame Rendering**: Canvas API converts video to Base64 PNG
4. **AI Analysis**: LLM.js processes screenshot (optional)
5. **Storage**: In-memory history + optional disk save (PNG + analysis TXT)
6. **UI Update**: Display thumbnails with analysis text

### 2.3 Configuration System

**Location**: `app.js` lines 8-153

The application implements a layered configuration system using localStorage:

**Configuration Hierarchy**:
1. **App-specific settings** (`ai-background-assistant` key in localStorage)
2. **LLM defaults** (`llm-defaults` key in localStorage)
3. **Hardcoded fallbacks**

**Stored Settings**:
- `analysisPrompt`: Custom AI analysis prompt
- `api_key`: LLM API key
- `service`: LLM service provider (default: "groq")
- `model`: LLM model name (default: "meta-llama/llama-4-scout-17b-16e-instruct")
- `max_tokens`: Maximum tokens for LLM response (default: 8192)

**Functions**:
- `getConfigurationValue(key, defaultValue)` - Lines 10-39
- `loadSettings()` - Lines 83-109
- `saveSettings()` - Lines 112-153

---

## 3. Core Components

### 3.1 Configuration & Settings Module

**Location**: `app.js` lines 8-153

**Functionality**:
- Layered configuration lookup (app-specific → llm-defaults → fallback)
- Settings persistence via localStorage
- Settings modal UI for user configuration

**Configurable Options**:
- API key (secured in localStorage)
- LLM service and model selection
- Analysis prompt customization
- Max tokens configuration
- Capture frequency

### 3.2 File System Integration

**Location**: `app.js` lines 166-231

**Functions**:
- `selectDirectory()` - Lines 166-193
- `saveScreenshotToDisk(imageData, timestamp, analysis)` - Lines 195-231

**Features**:
- Directory picker using File System Access API
- Saves screenshot as PNG with timestamp filename
- Saves AI analysis as companion TXT file
- Error handling for unsupported browsers

**Filename Format**:
- Screenshot: `screenshot_YYYYMMDD_HHMMSS.png`
- Analysis: `screenshot_YYYYMMDD_HHMMSS_analysis.txt`

**Browser Compatibility**: Chrome 86+, Edge 86+ (Not supported in Firefox/Safari)

### 3.3 Frequency Parser

**Location**: `app.js` lines 233-276

**Function**: `parseFrequency(input)`

**Input Format**: `AdBhCmDs` (regex: `/^(?:(\d+)d)?(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i`)

**Examples**:
- `1m` = 1 minute
- `30s` = 30 seconds
- `1h30m` = 1 hour 30 minutes
- `1d2h30m45s` = 1 day, 2 hours, 30 minutes, 45 seconds

**Validation Rules**:
- Minimum: 1000ms (1 second)
- Maximum: 604800000ms (7 days)
- At least one time unit required
- Case-insensitive

**Return Type**:
```javascript
{
    valid: boolean,
    milliseconds?: number,
    days?: number,
    hours?: number,
    minutes?: number,
    seconds?: number,
    error?: string
}
```

**Helper Function**: `formatFrequencyText(parsed)` - Lines 278-285
- Converts parsed frequency to human-readable text

### 3.4 Screen Capture Module

**Location**: `app.js` lines 299-350

**Function**: `startCapture()`

**Process Flow**:
1. Validate frequency input
2. Request screen access via `getDisplayMedia()`
3. Create hidden video element
4. Initialize canvas for frame extraction
5. Schedule periodic captures
6. Handle stream end events
7. Disable settings during capture

**Configuration**:
```javascript
{
    video: {
        mediaSource: "screen"
    }
}
```

**UI State Changes**:
- Hide start button, show stop button
- Disable settings button
- Disable frequency input
- Disable LLM checkbox
- Update status message

### 3.5 Frame Capture & AI Analysis

**Location**: `app.js` lines 352-408

**Function**: `captureFrame()`

**Process**:
1. Draw video frame to canvas
2. Convert to PNG via `toDataURL('image/png')`
3. Analyze with LLM.js (if enabled)
4. Create screenshot object with timestamp and analysis
5. Update preview
6. Add to history array (FIFO with 50 item limit)
7. Update UI
8. Save to disk (if directory configured)

**LLM Integration** (Lines 362-382):
- Uses LLM.js `Attachment.fromImageURL()` for image processing
- Sends custom prompt with screenshot
- Handles errors gracefully
- Displays "Analyzing..." during processing
- Shows error message if analysis fails
- Shows "AI analysis disabled" when LLM is off

**Screenshot Object Schema**:
```javascript
{
    id: number,           // Date.now() timestamp
    image: string,        // Base64 encoded PNG
    timestamp: Date,      // JavaScript Date object
    analysis: string      // LLM analysis text or status message
}
```

### 3.6 History Management

**Location**: `app.js` lines 410-461

**Function**: `updateHistory()`

**Features**:
- Dynamic grid rendering with thumbnails
- Display analysis text below each screenshot
- HTML escaping for security (line 428)
- Individual delete functionality
- Bulk clear with confirmation
- Modal view for full-size screenshots

**Memory Management**:
- Maximum 50 screenshots retained
- FIFO eviction policy
- Screenshots stored as Base64 strings in memory

**UI Elements**:
- Thumbnail grid (150px width, 100px height)
- Timestamp overlay
- Analysis text display (escaped HTML)
- Delete button per screenshot
- Click to view full-size in modal

---

## 4. User Interface Specification

### 4.1 Layout Structure

```
┌─────────────────────────────────────────┐
│ Header (Title + Description)            │
├─────────────────────────────────────────┤
│ [Settings] Button                       │
├─────────────────────────────────────────┤
│ Status Message                          │
├─────────────────────────────────────────┤
│ [Start Capture] / [Stop Capture]        │
├─────────────────────────────────────────┤
│ Latest Preview                          │
│   [Screenshot Preview Image]            │
├─────────────────────────────────────────┤
│ Screenshot History (N)                  │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐       │
│ │ [1] │ │ [2] │ │ [3] │ │ [4] │       │
│ │ ts  │ │ ts  │ │ ts  │ │ ts  │       │
│ │ txt │ │ txt │ │ txt │ │ txt │       │
│ │ [×] │ │ [×] │ │ [×] │ │ [×] │       │
│ └─────┘ └─────┘ └─────┘ └─────┘       │
│                                         │
│ [Clear All History]                     │
└─────────────────────────────────────────┘
```

### 4.2 Settings Modal

**Layout**:
- Capture Frequency input with validation
- Enable LLM Analysis checkbox
- LLM Configuration section:
  - Service dropdown
  - Model input
  - API Key input (password field)
  - Max Tokens input
  - Analysis Prompt textarea
- Directory Selection:
  - [Select Directory] button
  - Directory path display
- [Save Settings] button

**Validation**:
- Real-time frequency validation
- Error messages below frequency input
- Prevents saving invalid settings

### 4.3 Modals

**Settings Modal**:
- Displays configuration options
- Validates before closing
- Saves to localStorage
- Shows success message

**Image Modal**:
- Displays full-size screenshot
- Click anywhere to close
- Close button in corner

### 4.4 Responsive Design

**Breakpoints**:
- Container: `max-width: 600px`
- Grid: `repeat(auto-fill, minmax(150px, 1fr))`
- Mobile-friendly with flexible layout

### 4.5 Color Scheme

| Element | Color | Hex Code |
|---------|-------|----------|
| Primary Gradient | Purple-Blue | `#667eea → #764ba2` |
| Background | Light Gray | `#f8f9fa` |
| Success | Green | `#2e7d32` |
| Error | Red | `#c62828` |
| Text | Dark Gray | `#333` |
| Secondary Text | Medium Gray | `#666` |

---

## 5. State Management

### 5.1 Application State

```javascript
{
    // Capture state
    stream: MediaStream | null,
    captureInterval: number | null,
    video: HTMLVideoElement | null,
    canvas: HTMLCanvasElement | null,
    ctx: CanvasRenderingContext2D | null,

    // Data state
    screenshotHistory: Screenshot[],
    directoryHandle: FileSystemDirectoryHandle | null,

    // Configuration state (in localStorage)
    llmOptions: {
        service: string,
        model: string,
        apiKey: string,
        max_tokens: number,
        extended: boolean
    }
}
```

### 5.2 State Transitions

```
IDLE → VALIDATING → REQUESTING → CAPTURING → IDLE
                           ↓
                        ERROR
```

**States**:
- **IDLE**: No active capture, settings can be modified
- **VALIDATING**: Checking frequency input
- **REQUESTING**: Prompting for screen access
- **CAPTURING**: Active screenshot cycle, settings locked
- **ERROR**: Validation or capture failure

---

## 6. API Interfaces

### 6.1 Screen Capture API

**Method**: `navigator.mediaDevices.getDisplayMedia()`

**Browser Support**: Chrome 72+, Firefox 66+, Safari 13+

**Constraints**:
- HTTPS required (or localhost)
- User permission required
- Returns: `Promise<MediaStream>`

### 6.2 Canvas API

**Methods Used**:
- `canvas.getContext('2d')`
- `ctx.drawImage(video, 0, 0)`
- `canvas.toDataURL('image/png')`

**Output Format**: Base64-encoded PNG

### 6.3 File System Access API

**Methods Used**:
- `window.showDirectoryPicker()` - Select output directory
- `directoryHandle.getFileHandle(filename, { create: true })` - Create file
- `fileHandle.createWritable()` - Get writable stream
- `writable.write(data)` - Write data
- `writable.close()` - Finalize file

**Browser Support**: Chrome 86+, Edge 86+ (Not in Firefox/Safari)

### 6.4 LLM.js Integration

**Library**: LLM.js (loaded via CDN)

**Usage**:
```javascript
const image = LLM.Attachment.fromImageURL(imageData);
const response = await LLM(prompt, {
    service: 'groq',
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    apiKey: 'YOUR_API_KEY',
    max_tokens: 8192,
    extended: true,
    attachments: [image]
});
```

**Features**:
- Multimodal image analysis
- Configurable providers and models
- Error handling
- Async/await interface

---

## 7. Security & Privacy

### 7.1 Data Storage

- **Client-Side Only**: No automatic server transmission
- **LocalStorage**: Settings and configuration only
- **Session-Based Screenshots**: Cleared on reload
- **User Control**: Manual delete and clear functions
- **Optional Disk Save**: User-selected directory only

### 7.2 Security Considerations

1. **XSS Prevention**:
   - HTML escaping for analysis text (line 160-164, 428)
   - No `innerHTML` with unsanitized user input
2. **HTTPS Required**: Browser API constraint
3. **Permission Model**: User must grant screen access
4. **API Key Storage**: Stored in localStorage (not session)
5. **File System Access**: User must explicitly select directory

### 7.3 Privacy Best Practices

- Clear user consent required
- Visible capture indicators
- Easy stop mechanism
- Transparent data handling
- No third-party analytics
- Local AI processing (no data sent to external servers except chosen LLM service)

---

## 8. Error Handling

### 8.1 Error Types

| Error Type | Handling | User Feedback |
|------------|----------|---------------|
| Invalid Frequency | Input validation | Red border + error message |
| Permission Denied | Catch + cleanup | Error status message |
| Stream Ended | Auto-stop | Status: "Capture stopped" |
| Browser Unsupported | Feature detection | Alert message |
| LLM Analysis Error | Try-catch | Error message in analysis field |
| File System Error | Catch + log | Console error (doesn't block capture) |

### 8.2 Error Recovery

```javascript
try {
    // Capture/analysis operation
} catch (error) {
    console.error('Error:', error);
    updateStatus('Error: ' + error.message, true);
    // Clean up resources if needed
    if (isCriticalError) {
        stopCapture();
    }
}
```

### 8.3 Graceful Degradation

- LLM analysis continues even if file save fails
- Capture continues even if LLM analysis fails
- Shows appropriate error messages without breaking app

---

## 9. Performance Considerations

### 9.1 Memory Usage

- Each screenshot: ~500KB - 2MB (depends on resolution)
- 50 screenshots: ~25MB - 100MB maximum
- Browser memory limit monitoring required

### 9.2 Optimization Strategies

1. **Image Compression**: PNG format with default compression
2. **History Limiting**: FIFO with 50 item cap
3. **Lazy Rendering**: Grid auto-fill with minmax
4. **Event Debouncing**: Input validation on blur/submit
5. **Async Operations**: Non-blocking LLM analysis and file saves

### 9.3 Performance Metrics

| Operation | Target Time |
|-----------|-------------|
| Frequency Validation | < 1ms |
| Frame Capture | < 50ms |
| LLM Analysis | 1-5s (depends on service) |
| File Save | < 100ms |
| UI Update | < 100ms |
| Modal Open | < 50ms |

---

## 10. Browser Compatibility Matrix

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| getDisplayMedia | 72+ | 66+ | 13+ | 79+ |
| Canvas API | ✓ | ✓ | ✓ | ✓ |
| ES6 Syntax | 51+ | 54+ | 10+ | 79+ |
| CSS Grid | 57+ | 52+ | 10.1+ | 16+ |
| LocalStorage | ✓ | ✓ | ✓ | ✓ |
| File System Access API | 86+ | ✗ | ✗ | 86+ |
| LLM.js | Modern browsers with fetch API |

**Recommended Browser**: Chrome 86+ or Edge 86+ (for full feature set)

---

## 11. External Dependencies

### 11.1 LLM.js

**Source**: CDN (loaded in index.html)

**Purpose**: Client-side AI analysis of screenshots

**Features Used**:
- `LLM()` - Main function for AI requests
- `LLM.Attachment.fromImageURL()` - Image processing

**Configuration**:
- Supports multiple providers (Groq, OpenAI, etc.)
- Configurable models
- API key authentication
- Max tokens control

**Documentation**: [LLM.js GitHub](https://github.com/sugarlabs/llm.js)

---

## 12. Testing Requirements

### 12.1 Unit Tests

- [ ] Frequency parser with valid inputs
- [ ] Frequency parser with invalid inputs
- [ ] Configuration layered lookup
- [ ] Screenshot object creation
- [ ] History array management (FIFO)
- [ ] HTML escaping function
- [ ] Timestamp formatting

### 12.2 Integration Tests

- [ ] Full capture workflow
- [ ] Settings persistence
- [ ] LLM analysis flow
- [ ] File save workflow
- [ ] UI state transitions
- [ ] Error handling paths
- [ ] Modal interactions
- [ ] Delete operations

### 12.3 Manual Testing Checklist

- [ ] Screen capture start/stop
- [ ] Multiple frequency formats
- [ ] Settings modal save/cancel
- [ ] LLM analysis enable/disable
- [ ] Directory selection
- [ ] File saves (PNG + TXT)
- [ ] History grid rendering
- [ ] Analysis text display
- [ ] Modal view functionality
- [ ] Delete individual screenshot
- [ ] Clear all history
- [ ] Error message display
- [ ] Cross-browser compatibility
- [ ] Browser without File System Access API

---

## 13. Completed Features

The following features have been implemented in version 1.0.0:

### 13.1 Core Functionality
- ✓ Configurable screen capture frequency
- ✓ Real-time screenshot preview
- ✓ Screenshot history with thumbnails
- ✓ Modal view for full-size images
- ✓ Individual and bulk delete

### 13.2 AI Integration
- ✓ LLM.js integration for screenshot analysis
- ✓ Configurable AI prompts
- ✓ Multiple LLM provider support
- ✓ Analysis text display with screenshots
- ✓ Enable/disable AI analysis

### 13.3 Storage & Export
- ✓ File System Access API integration
- ✓ Save screenshots as PNG files
- ✓ Save analysis as TXT files
- ✓ Timestamped filenames
- ✓ Directory selection UI

### 13.4 Configuration
- ✓ Layered configuration system
- ✓ LocalStorage persistence
- ✓ Settings modal UI
- ✓ API key management
- ✓ Service/model selection

### 13.5 Security
- ✓ HTML escaping for analysis text
- ✓ Secure API key storage
- ✓ Error handling
- ✓ Input validation

---

## 14. Future Enhancements

### 14.1 Planned Features

1. **Export Functionality**
   - ZIP download of all screenshots
   - JSON export with metadata
   - CSV activity report
   - Batch export options

2. **Advanced Storage**
   - IndexedDB for larger datasets
   - Persist screenshot history across sessions
   - Cloud sync options
   - Automatic cleanup policies

3. **Analytics**
   - Capture statistics dashboard
   - Time-based activity reports
   - Activity heatmaps
   - Productivity insights

4. **Enhanced AI Features**
   - Multi-screenshot comparison
   - Activity categorization
   - Pattern detection
   - Automated summaries

5. **UI Improvements**
   - Virtual scrolling for large histories
   - Advanced filtering and search
   - Tagging system
   - Custom themes

### 14.2 Technical Debt

- [ ] Add TypeScript for type safety
- [ ] Implement service workers for offline support
- [ ] Add unit test coverage
- [ ] Optimize image compression
- [ ] Implement virtual scrolling
- [ ] Add accessibility features (ARIA labels, keyboard navigation)
- [ ] Consider WebP format for smaller file sizes

---

## 15. Deployment

### 15.1 Requirements

- Static file hosting (no server required)
- HTTPS certificate (for production)
- Modern browser support (Chrome/Edge recommended)

### 15.2 Deployment Options

1. **GitHub Pages**: Static hosting, free HTTPS
2. **Netlify**: Auto-deploy from git, CDN
3. **Vercel**: Edge network, automatic HTTPS
4. **Self-Hosted**: Nginx/Apache with SSL

### 15.3 Build Process

No build process required - vanilla JavaScript/HTML/CSS.

Optional optimizations:
- Minify CSS/JS
- Image optimization
- Asset bundling
- CDN for LLM.js library

---

## 16. Maintenance

### 16.1 Regular Updates

- Browser API compatibility checks
- Security vulnerability scanning
- LLM.js library updates
- Browser compatibility testing

### 16.2 Monitoring

- User feedback collection
- Error logging (console)
- Performance metrics tracking
- Browser compatibility reports

---

## Appendix A: Code Style Guide

- **Indentation**: 4 spaces
- **Quotes**: Single quotes for strings
- **Semicolons**: Required
- **Naming**: camelCase for functions/variables
- **Comments**: JSDoc style for functions
- **Async**: Use async/await over promises

## Appendix B: File Structure

```
ai-background-assistant/
├── index.html          # Main HTML structure
├── app.js              # Core application logic
├── styles.css          # Styling and layout
├── SPEC.md            # This specification
├── AGENTS.md          # Development guidelines
└── README.md          # Project overview
```

## Appendix C: Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-11-27 | Initial release with AI analysis, file saving, settings modal |
| 0.1.0 | 2025-11-27 | Basic screen capture functionality |
