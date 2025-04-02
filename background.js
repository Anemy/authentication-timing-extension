// Helper function to detect SSO pages
function isSSOPage(url) {
    const ssoKeywords = [
        'login',
        'signin',
        'auth',
        'oauth',
        'saml',
        'sso',
        'authentication',
        'authorize'
    ];
    
    const urlLower = url.toLowerCase();
    return ssoKeywords.some(keyword => urlLower.includes(keyword));
}

function isOutlierTime(time) {
    return time > 15_000; // 15 seconds.
}

// Initialize storage with default values
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({
        totalTime: 0,
        sessionCount: 0,
        currentSessionStart: null,
        currentInitialRequestStart: null,
        startDate: Date.now()
    });
});

// Track navigation events
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
    // Check if this is a potential SSO page
    if (isSSOPage(details.url)) {
        // When we detect an SSO page, start timing from now
        chrome.storage.local.set({ 
            currentSessionStart: Date.now(),
            currentInitialRequestStart: Date.now() // Start both timers at the same time
        });
    }
});

chrome.webNavigation.onCompleted.addListener((details) => {
    if (isSSOPage(details.url)) {
        chrome.storage.local.get(['currentSessionStart', 'currentInitialRequestStart', 'totalTime', 'sessionCount'], (data) => {
            if (data.currentSessionStart) {
                const totalAuthTime = Date.now() - data.currentSessionStart;

                if (isOutlierTime(totalAuthTime)) {
                    // Clear the timing data
                    chrome.storage.local.set({
                        currentSessionStart: null,
                        currentInitialRequestStart: null
                    });
                    return;
                }

                const newTotalTime = data.totalTime + totalAuthTime;
                const newSessionCount = data.sessionCount + 1;

                chrome.storage.local.set({
                    totalTime: newTotalTime,
                    sessionCount: newSessionCount,
                    currentSessionStart: null,
                    currentInitialRequestStart: null
                });
            }
        });
    }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getStats') {
        chrome.storage.local.get(['totalTime', 'sessionCount', 'startDate'], (data) => {
            const startDate = data.startDate || Date.now();
            const daysElapsed = Math.max(1, Math.floor((Date.now() - startDate) / (1000 * 60 * 60 * 24)));
            const perDay = Math.round(data.totalTime / daysElapsed);

            sendResponse({
                totalTime: data.totalTime || 0,
                sessionCount: data.sessionCount || 0,
                perDay: perDay,
                startDate: startDate
            });
        });
        return true; // Will respond asynchronously
    }
    
    if (request.action === 'resetStats') {
        chrome.storage.local.set({
            totalTime: 0,
            sessionCount: 0,
            currentSessionStart: null,
            currentInitialRequestStart: null,
            startDate: Date.now()
        });
        sendResponse({ success: true });
    }
}); 