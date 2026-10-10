/**
 * SentiGuard - Background Service Worker (Manifest v3)
 *
 * Handles API calls from content scripts to avoid CORS issues.
 * Content scripts cannot call external APIs directly in some configurations,
 * so they send a message here and we make the fetch on their behalf.
 */

const DEFAULT_API_BASE = "https://sentiguard-hkef.onrender.com/api";

// ─── Message Listener ──────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SCAN_URL") {
    scanURL(message.url)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(err  => sendResponse({ success: false, error: err.message }));

    return true; // Keep channel open for async response
  }

  if (message.type === "GET_SETTINGS") {
    getSettings().then(sendResponse);
    return true;
  }
});


// ─── Tab Update Listener ───────────────────────────────────────────────────────
// Auto-scan when user navigates to a new page

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // Only scan when page is fully loaded
  if (changeInfo.status !== "complete") return;
  if (!tab.url || tab.url.startsWith("chrome://") || tab.url.startsWith("chrome-extension://")) return;

  const settings = await getSettings();
  if (!settings.autoScan) return;

  try {
    const result = await scanURL(tab.url);

    if (result.verdict === "PHISHING") {
      // Store result for the content script to display warning
      await chrome.storage.session.set({ [`scan_${tabId}`]: result });

      // Send message to content script
      chrome.tabs.sendMessage(tabId, {
        type: "SHOW_WARNING",
        data: result,
      }).catch(() => {}); // Tab may not have content script loaded

      // Show browser notification
      chrome.notifications.create(`phish_${tabId}`, {
        type:    "basic",
        iconUrl: "assets/icon48.png",
        title:   "⚠️ SentiGuard: Phishing Detected!",
        message: `Suspicious site detected.\nTrust Score: ${result.trust_score}%\nURL: ${tab.url.slice(0, 60)}...`,
        priority: 2,
      });
    } else {
      // Clear any existing warning for this tab
      await chrome.storage.session.remove(`scan_${tabId}`);
      chrome.tabs.sendMessage(tabId, { type: "CLEAR_WARNING" }).catch(() => {});
    }
  } catch (err) {
    console.warn("[SentiGuard] Background scan failed:", err.message);
  }
});


// ─── API Call ──────────────────────────────────────────────────────────────────

async function scanURL(url) {
  const { apiBase } = await getSettings();

  const response = await fetch(`${apiBase}/scan/url`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ url }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `API error: ${response.status}`);
  }

  return response.json();
}


// ─── Settings ─────────────────────────────────────────────────────────────────

async function getSettings() {
  const defaults = {
    autoScan: true,
    showBadge: true,
    apiBase: DEFAULT_API_BASE,
  };
  const stored = await chrome.storage.sync.get(defaults);
  return {
    ...defaults,
    ...stored,
    apiBase: (stored.apiBase || defaults.apiBase).replace(/\/$/, ""),
  };
}
