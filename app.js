let stream = null;
let captureInterval = null;
let video = null;
let canvas = null;
let ctx = null;
let screenshotHistory = [];

const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const status = document.getElementById('status');
const preview = document.getElementById('preview');
const previewImg = document.getElementById('previewImg');
const historyGrid = document.getElementById('historyGrid');
const historyCount = document.getElementById('historyCount');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const modal = document.getElementById('modal');
const modalImg = document.getElementById('modalImg');
const modalClose = document.getElementById('modalClose');
const frequencyInput = document.getElementById('frequencyInput');
const frequencyError = document.getElementById('frequencyError');

function updateStatus(message, isError = false) {
    status.textContent = message;
    status.className = 'status ' + (isError ? 'error' : 'active');
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
        frequencyInput.disabled = true;
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

function captureFrame() {
    if (!video || !canvas || !ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    // Convert to image
    const imageData = canvas.toDataURL('image/png');

    // Update preview
    previewImg.src = imageData;
    preview.className = 'preview visible';

    // Add to history
    const timestamp = new Date();
    screenshotHistory.unshift({
        id: Date.now(),
        image: imageData,
        timestamp: timestamp
    });

    // Limit history to 50 items to prevent memory issues
    if (screenshotHistory.length > 50) {
        screenshotHistory = screenshotHistory.slice(0, 50);
    }

    updateHistory();

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
            <img src="${item.image}" alt="Screenshot">
            <div class="timestamp">${formatTimestamp(item.timestamp)}</div>
            <button class="delete-btn" onclick="deleteScreenshot(${item.id})" title="Delete">×</button>
        </div>
    `).join('');

    // Add click handlers for viewing full size
    document.querySelectorAll('.history-item img').forEach(img => {
        img.addEventListener('click', (e) => {
            modalImg.src = e.target.src;
            modal.className = 'modal visible';
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
    frequencyInput.disabled = false;
    updateStatus('Capture stopped.');

    setTimeout(() => {
        status.className = 'status';
    }, 3000);
}

startBtn.addEventListener('click', startCapture);
stopBtn.addEventListener('click', stopCapture);
clearHistoryBtn.addEventListener('click', clearAllHistory);
modalClose.addEventListener('click', () => {
    modal.className = 'modal';
});
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.className = 'modal';
    }
});

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
