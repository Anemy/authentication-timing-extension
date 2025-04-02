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

// Format date to a readable string
function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Update the UI with current stats
function updateStats() {
    chrome.runtime.sendMessage({ action: 'getStats' }, (response) => {
        if (chrome.runtime.lastError) {
            console.error('Error getting stats:', chrome.runtime.lastError);
            return;
        }
        
        if (!response) {
            console.error('No response received from background script');
            return;
        }

        try {
            document.getElementById('totalTime').textContent = formatTime(response.totalTime || 0);
            document.getElementById('perDay').textContent = formatTime(response.perDay || 0);
            document.getElementById('sessionCount').textContent = response.sessionCount || 0;
            document.getElementById('startDate').textContent = formatDate(response.startDate || Date.now());
        } catch (error) {
            console.error('Error updating UI:', error);
        }
    });
}

// Initialize the popup
document.addEventListener('DOMContentLoaded', () => {
    // Update stats when popup opens
    updateStats();

    // Add reset button handler
    document.getElementById('resetBtn').addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: 'resetStats' }, (response) => {
            if (chrome.runtime.lastError) {
                console.error('Error resetting stats:', chrome.runtime.lastError);
                return;
            }
            
            if (response && response.success) {
                updateStats();
            } else {
                console.error('Failed to reset stats');
            }
        });
    });
}); 