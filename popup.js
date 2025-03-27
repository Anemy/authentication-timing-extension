// Format time in milliseconds to a human-readable string
function formatTime(ms) {
    if (ms < 1000) {
        return `${ms}ms`;
    }
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) {
        return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
}

// Update the UI with current stats
function updateStats() {
    chrome.runtime.sendMessage({ action: 'getStats' }, (response) => {
        document.getElementById('totalTime').textContent = formatTime(response.totalTime);
        document.getElementById('averageTime').textContent = formatTime(response.averageTime);
        document.getElementById('sessionCount').textContent = response.sessionCount;
    });
}

// Initialize the popup
document.addEventListener('DOMContentLoaded', () => {
    // Update stats when popup opens
    updateStats();

    // Add reset button handler
    document.getElementById('resetBtn').addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: 'resetStats' }, () => {
            updateStats();
        });
    });
}); 