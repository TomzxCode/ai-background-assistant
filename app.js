import LLM from 'llm.js';

let stream = null;
let captureInterval = null;
let video = null;
let canvas = null;
let ctx = null;
let screenshotHistory = [];

const llmOptions = {
    service: "groq",
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    extended: true,
    apiKey: localStorage.getItem("LLM_API_KEY") || "LLM_API_KEY_NOT_SET",
    max_tokens: 8192,
};

const analysisPrompt = "Analyze this screenshot and describe what you see. Focus on the main activities and any notable elements.";

const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const status = document.getElementById('status');
const preview = document.getElementById('preview');
const previewImg = document.getElementById('previewImg');
const historyGrid = document.getElementById('historyGrid');
const historyCount = document.getElementById('historyCount');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const imageModal = document.getElementById('imageModal');
const modalImg = document.getElementById('modalImg');
const imageModalClose = document.getElementById('imageModalClose');
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const settingsModalClose = document.getElementById('settingsModalClose');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');
const frequencyInput = document.getElementById('frequencyInput');
const frequencyError = document.getElementById('frequencyError');
const directoryBtn = document.getElementById('directoryBtn');
const directoryPath = document.getElementById('directoryPath');
const enableLLMCheckbox = document.getElementById('enableLLM');

let directoryHandle = null;

function updateStatus(message, isError = false) {
    status.textContent = message;
    status.className = 'status ' + (isError ? 'error' : 'active');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

async function selectDirectory() {
    try {
        // Check if File System Access API is supported
        if (!('showDirectoryPicker' in window)) {
            alert('Your browser does not support the File System Access API. Please use Chrome, Edge, or another Chromium-based browser.');
            return;
        }

        directoryHandle = await window.showDirectoryPicker({
            mode: 'readwrite'
        });

        // Update UI to show selected directory
        directoryPath.textContent = directoryHandle.name;
        directoryPath.className = 'directory-path selected';

        updateStatus('Directory selected: ' + directoryHandle.name);
        setTimeout(() => {
            status.className = 'status';
        }, 3000);

    } catch (error) {
        if (error.name !== 'AbortError') {
            console.error('Error selecting directory:', error);
            updateStatus('Error selecting directory: ' + error.message, true);
        }
    }
}

async function saveScreenshotToDisk(imageData, timestamp, analysis) {
    if (!directoryHandle) {
        console.log('No directory selected, skipping disk save');
        return;
    }

    try {
        // Create filename with timestamp
        const filename = `screenshot_${timestamp.getFullYear()}${String(timestamp.getMonth() + 1).padStart(2, '0')}${String(timestamp.getDate()).padStart(2, '0')}_${String(timestamp.getHours()).padStart(2, '0')}${String(timestamp.getMinutes()).padStart(2, '0')}${String(timestamp.getSeconds()).padStart(2, '0')}.png`;

        // Convert base64 to blob
        const base64Data = imageData.split(',')[1];
        const binaryData = atob(base64Data);
        const bytes = new Uint8Array(binaryData.length);
        for (let i = 0; i < binaryData.length; i++) {
            bytes[i] = binaryData.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'image/png' });

        // Create file handle and write
        const fileHandle = await directoryHandle.getFileHandle(filename, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();

        // Save analysis to text file
        const analysisFilename = `screenshot_${timestamp.getFullYear()}${String(timestamp.getMonth() + 1).padStart(2, '0')}${String(timestamp.getDate()).padStart(2, '0')}_${String(timestamp.getHours()).padStart(2, '0')}${String(timestamp.getMinutes()).padStart(2, '0')}${String(timestamp.getSeconds()).padStart(2, '0')}_analysis.txt`;
        const analysisFileHandle = await directoryHandle.getFileHandle(analysisFilename, { create: true });
        const analysisWritable = await analysisFileHandle.createWritable();
        await analysisWritable.write(analysis);
        await analysisWritable.close();

        console.log('Screenshot and analysis saved to disk:', filename);
    } catch (error) {
        console.error('Error saving screenshot to disk:', error);
    }
}

function parseFrequency(input) {
    // Parse format like "1d2h30m45s" or "1m", "30s", etc.
    const pattern = /^(?:(\d+)d)?(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i;
    const match = input.trim().match(pattern);

    if (!match) {
        return { valid: false, error: 'Invalid format. Use combinations of d(days), h(hours), m(minutes), s(seconds)' };
    }

    const days = parseInt(match[1]) || 0;
    const hours = parseInt(match[2]) || 0;
    const minutes = parseInt(match[3]) || 0;
    const seconds = parseInt(match[4]) || 0;

    // Check if at least one value was provided
    if (days === 0 && hours === 0 && minutes === 0 && seconds === 0) {
        return { valid: false, error: 'Please specify at least one time unit' };
    }

    // Calculate total milliseconds
    const totalMs = (days * 24 * 60 * 60 * 1000) +
                   (hours * 60 * 60 * 1000) +
                   (minutes * 60 * 1000) +
                   (seconds * 1000);

    // Minimum 1 second
    if (totalMs < 1000) {
        return { valid: false, error: 'Frequency must be at least 1 second' };
    }

    // Maximum 7 days
    if (totalMs > 7 * 24 * 60 * 60 * 1000) {
        return { valid: false, error: 'Frequency must be less than 7 days' };
    }

    return {
        valid: true,
        milliseconds: totalMs,
        days,
        hours,
        minutes,
        seconds
    };
}

function formatFrequencyText(parsed) {
    const parts = [];
    if (parsed.days > 0) parts.push(`${parsed.days} day${parsed.days > 1 ? 's' : ''}`);
    if (parsed.hours > 0) parts.push(`${parsed.hours} hour${parsed.hours > 1 ? 's' : ''}`);
    if (parsed.minutes > 0) parts.push(`${parsed.minutes} minute${parsed.minutes > 1 ? 's' : ''}`);
    if (parsed.seconds > 0) parts.push(`${parsed.seconds} second${parsed.seconds > 1 ? 's' : ''}`);
    return parts.join(', ');
}

function clearFrequencyError() {
    frequencyInput.classList.remove('error');
    frequencyError.className = 'frequency-error';
    frequencyError.textContent = '';
}

function showFrequencyError(message) {
    frequencyInput.classList.add('error');
    frequencyError.className = 'frequency-error visible';
    frequencyError.textContent = message;
}

async function startCapture() {
    try {
        // Validate frequency input
        const parsed = parseFrequency(frequencyInput.value);
        if (!parsed.valid) {
            showFrequencyError(parsed.error);
            return;
        }
        clearFrequencyError();

        // Request screen capture
        stream = await navigator.mediaDevices.getDisplayMedia({
            video: { mediaSource: "screen" }
        });

        // Setup video element
        video = document.createElement('video');
        video.srcObject = stream;
        video.play();

        // Setup canvas
        canvas = document.createElement('canvas');
        ctx = canvas.getContext('2d');

        // Get frequency text
        const frequencyText = formatFrequencyText(parsed);

        // Update UI
        startBtn.style.display = 'none';
        stopBtn.style.display = 'block';
        settingsBtn.disabled = true;
        frequencyInput.disabled = true;
        enableLLMCheckbox.disabled = true;
        updateStatus(`Screen capture active. Capturing every ${frequencyText}...`);

        // Capture first frame after video is ready
        video.onloadedmetadata = () => {
            setTimeout(captureFrame, 1000);
        };

        // Capture frames periodically
        captureInterval = setInterval(captureFrame, parsed.milliseconds);

        // Handle stream end
        stream.getVideoTracks()[0].onended = stopCapture;

    } catch (error) {
        console.error('Error starting capture:', error);
        updateStatus('Error: ' + error.message, true);
        stopCapture();
    }
}

async function captureFrame() {
    if (!video || !canvas || !ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    // Convert to image
    const imageData = canvas.toDataURL('image/png');

    // Analyze with LLM if enabled
    let llmResponse = null;
    if (enableLLMCheckbox.checked) {
        llmResponse = 'Analyzing...';
        try {
            const image = LLM.Attachment.fromImageURL(imageData);
            const response = await LLM(analysisPrompt, {
                ...llmOptions,
                attachments: [image],
            });
            llmResponse = response.content;
            console.log('LLM Analysis:', response);
        } catch (error) {
            console.error('Error analyzing screenshot with LLM:', error);
            llmResponse = `Error: ${error.message}`;
        }
    } else {
        llmResponse = 'AI analysis disabled';
    }

    // Update preview
    previewImg.src = imageData;
    preview.className = 'preview visible';

    // Add to history
    const timestamp = new Date();
    screenshotHistory.unshift({
        id: Date.now(),
        image: imageData,
        timestamp: timestamp,
        analysis: llmResponse
    });

    // Limit history to 50 items to prevent memory issues
    if (screenshotHistory.length > 50) {
        screenshotHistory = screenshotHistory.slice(0, 50);
    }

    updateHistory();

    // Save to disk if directory is configured
    await saveScreenshotToDisk(imageData, timestamp, llmResponse);

    // Send to server or process locally
    console.log('Frame captured at:', timestamp.toISOString());

    // TODO: Send imageData to your server/API for AI processing
    // Example:
    // fetch('/api/analyze', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ image: imageData })
    // });
}

function updateHistory() {
    historyCount.textContent = screenshotHistory.length;

    if (screenshotHistory.length === 0) {
        historyGrid.innerHTML = '<div class="empty-history">No screenshots captured yet</div>';
        clearHistoryBtn.style.display = 'none';
        return;
    }

    clearHistoryBtn.style.display = 'block';

    historyGrid.innerHTML = screenshotHistory.map(item => `
        <div class="history-item" data-id="${item.id}">
            <div class="screenshot-container">
                <img src="${item.image}" alt="Screenshot">
                <div class="timestamp">${formatTimestamp(item.timestamp)}</div>
            </div>
            <div class="analysis-container">
                <div class="analysis-text">${escapeHtml(item.analysis || 'No analysis available')}</div>
            </div>
            <button class="delete-btn" onclick="deleteScreenshot(${item.id})" title="Delete">×</button>
        </div>
    `).join('');

    // Add click handlers for viewing full size
    document.querySelectorAll('.history-item img').forEach(img => {
        img.addEventListener('click', (e) => {
            modalImg.src = e.target.src;
            imageModal.className = 'modal visible';
        });
    });
}

function formatTimestamp(date) {
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

function deleteScreenshot(id) {
    screenshotHistory = screenshotHistory.filter(item => item.id !== id);
    updateHistory();
}

function clearAllHistory() {
    if (confirm('Are you sure you want to delete all screenshots?')) {
        screenshotHistory = [];
        updateHistory();
    }
}

function stopCapture() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }

    if (captureInterval) {
        clearInterval(captureInterval);
        captureInterval = null;
    }

    video = null;
    canvas = null;
    ctx = null;

    startBtn.style.display = 'block';
    stopBtn.style.display = 'none';
    settingsBtn.disabled = false;
    frequencyInput.disabled = false;
    enableLLMCheckbox.disabled = false;
    updateStatus('Capture stopped.');

    setTimeout(() => {
        status.className = 'status';
    }, 3000);
}

// Settings modal handlers
settingsBtn.addEventListener('click', () => {
    settingsModal.className = 'modal settings-modal visible';
});

settingsModalClose.addEventListener('click', () => {
    settingsModal.className = 'modal settings-modal';
    clearFrequencyError();
});

saveSettingsBtn.addEventListener('click', () => {
    // Validate frequency before closing
    const parsed = parseFrequency(frequencyInput.value);
    if (!parsed.valid) {
        showFrequencyError(parsed.error);
        return;
    }
    clearFrequencyError();
    settingsModal.className = 'modal settings-modal';
    updateStatus('Settings saved successfully.');
    setTimeout(() => {
        status.className = 'status';
    }, 3000);
});

settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
        settingsModal.className = 'modal settings-modal';
        clearFrequencyError();
    }
});

// Image modal handlers
imageModalClose.addEventListener('click', () => {
    imageModal.className = 'modal';
});

imageModal.addEventListener('click', (e) => {
    if (e.target === imageModal) {
        imageModal.className = 'modal';
    }
});

// Control handlers
startBtn.addEventListener('click', startCapture);
stopBtn.addEventListener('click', stopCapture);
clearHistoryBtn.addEventListener('click', clearAllHistory);
directoryBtn.addEventListener('click', selectDirectory);

// Clear error when user types
frequencyInput.addEventListener('input', () => {
    if (frequencyInput.classList.contains('error')) {
        clearFrequencyError();
    }
});

// Allow Enter key to start capture
frequencyInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !frequencyInput.disabled) {
        startCapture();
    }
});

// Load history on page load (if you want to persist using localStorage)
// window.addEventListener('load', () => {
//     const saved = localStorage.getItem('screenshotHistory');
//     if (saved) {
//         screenshotHistory = JSON.parse(saved);
//         updateHistory();
//     }
// });
