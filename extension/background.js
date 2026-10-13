/**
 * SentiGuard - Background Service Worker (Manifest v3 - Phase 3 Active Shield)
 * ─────────────────────────────────────────────────────────────────────────────
 * Powers:
 * 1. Active Navigation Interception (chrome.webNavigation.onBeforeNavigate)
 * 2. In-Memory Sub-Millisecond Reputation Cache
 * 3. Domain Whitelist & Temporary Session Bypass Manager
 * 4. Interstitial Redirection (blocked.html)
 * 5. Community False-Positive Dispute Submissions
 */

const LOCAL_API_BASE = "http://localhost:8000/api";
const PROD_API_BASE = "https://sentiguard-api.onrender.com/api";

// In-memory cache for fast URL reputation lookups
const memoryCache = new Map();

// Session bypasses set (URLs allowed through temporarily after user clicks "Proceed")
const sessionBypasses = new Map(); // url -> timestamp

// Interception in flight to avoid duplicate concurrent checks
const pendingNavigations = new Set();


// ─── Initialize Settings & Whitelist ──────────────────────────────────────────

async function getSettings() {
  const defaults = {
    activeShield: true,
    autoScan: true,
    showBadge: true,
    apiBase: LOCAL_API_BASE,
  };
  const stored = await chrome.storage.sync.get(defaults);
  return { ...defaults, ...stored };
}

async function getWhitelist() {
  const data = await chrome.storage.local.get({ whitelist_domains: [] });
  return data.whitelist_domains || [];
}

async function addToWhitelist(domain) {
  domain = domain.toLowerCase().trim();
  const list = await getWhitelist();
  if (!list.includes(domain)) {
    list.push(domain);
    await chrome.storage.local.set({ whitelist_domains: list });
  }
  return list;
}

async function removeFromWhitelist(domain) {
  domain = domain.toLowerCase().trim();
  const list = await getWhitelist();
  const updated = list.filter((d) => d !== domain);
  await chrome.storage.local.set({ whitelist_domains: updated });
  return updated;
}


// ─── Active Navigation Interceptor ─────────────────────────────────────────────

chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  // Only intercept main frame navigation (frameId === 0)
  if (details.frameId !== 0) return;

  const url = details.url;
  if (!url || typeof url !== "string") return;

  // Ignore internal and extension URLs
  if (
    url.startsWith("chrome://") ||
    url.startsWith("chrome-extension://") ||
    url.startsWith("about:") ||
    url.startsWith("edge://") ||
    url.startsWith("file://")
  ) {
    return;
  }

  const settings = await getSettings();
  if (!settings.activeShield) return;

  // Check Domain Whitelist
  let domain = "";
  try {
    domain = new URL(url).hostname.toLowerCase();
  } catch {
    return;
  }

  const whitelist = await getWhitelist();
  if (whitelist.includes(domain)) {
    updateBadge(details.tabId, "SAFE");
    return;
  }

  // Check Temporary Session Bypass
  const bypassExpiry = sessionBypasses.get(url);
  if (bypassExpiry && Date.now() < bypassExpiry) {
    return;
  }

  // 1. Fast Memory Cache Check (<0.1ms)
  const cached = memoryCache.get(url);
  if (cached) {
    if (cached.verdict === "PHISHING" || cached.trust_score < 40) {
      redirectToBlocked(details.tabId, url, cached);
    } else {
      updateBadge(details.tabId, "SAFE");
    }
    return;
  }

  // 2. Avoid duplicate concurrent requests for the same URL in the same tab
  const navKey = `${details.tabId}:${url}`;
  if (pendingNavigations.has(navKey)) return;
  pendingNavigations.add(navKey);

  // 3. Scan URL via SentiGuard Threat Intelligence API
  try {
    const result = await scanURL(url);
    memoryCache.set(url, result);

    if (result.verdict === "PHISHING" || result.trust_score < 40) {
      redirectToBlocked(details.tabId, url, result);
    } else {
      updateBadge(details.tabId, "SAFE");
    }
  } catch (err) {
    console.warn("[SentiGuard] Pre-navigation scan error:", err.message);
  } finally {
    pendingNavigations.delete(navKey);
  }
});


// ─── Redirect to Interstitial Warning ─────────────────────────────────────────

function redirectToBlocked(tabId, url, result) {
  const risksParam = encodeURIComponent(JSON.stringify(result.risk_factors || []));
  const blockedUrl = chrome.runtime.getURL(
    `blocked.html?url=${encodeURIComponent(url)}&score=${result.trust_score || 0}&verdict=${result.verdict}&risks=${risksParam}`
  );

  chrome.tabs.update(tabId, { url: blockedUrl }).catch(() => {});
  updateBadge(tabId, "DANGER");

  // Show desktop notification
  chrome.notifications.create(`threat_${tabId}`, {
    type: "basic",
    iconUrl: "assets/icon48.png",
    title: "🚨 SentiGuard: Threat Intercepted!",
    message: `Prevented navigation to dangerous phishing site.\nTrust Score: ${result.trust_score}%\nDomain: ${new URL(url).hostname}`,
    priority: 2,
  });
}


// ─── Badge Status Helper ───────────────────────────────────────────────────────

function updateBadge(tabId, status) {
  if (status === "DANGER") {
    chrome.action.setBadgeText({ tabId, text: "!" });
    chrome.action.setBadgeBackgroundColor({ tabId, color: "#e11d48" });
  } else if (status === "SAFE") {
    chrome.action.setBadgeText({ tabId, text: "✓" });
    chrome.action.setBadgeBackgroundColor({ tabId, color: "#10b981" });
  } else {
    chrome.action.setBadgeText({ tabId, text: "" });
  }
}


// ─── Threat Intelligence API Client ───────────────────────────────────────────

async function scanURL(url) {
  const settings = await getSettings();

  // Try configured API base, with automatic fallback
  const candidateBases = [settings.apiBase, LOCAL_API_BASE, PROD_API_BASE].filter(
    (b, i, arr) => arr.indexOf(b) === i
  );

  let lastError = null;
  for (const base of candidateBases) {
    try {
      const response = await fetch(`${base}/scan/url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error("Failed to reach SentiGuard Threat Intelligence API");
}


// ─── Message Listener (Popup & Interstitial Communication) ────────────────────

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SCAN_URL") {
    scanURL(message.url)
      .then((data) => {
        memoryCache.set(message.url, data);
        sendResponse({ success: true, data });
      })
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true;
  }

  if (message.type === "GET_SETTINGS") {
    getSettings().then(sendResponse);
    return true;
  }

  if (message.type === "GET_WHITELIST") {
    getWhitelist().then((list) => sendResponse({ whitelist: list }));
    return true;
  }

  if (message.type === "ADD_WHITELIST") {
    addToWhitelist(message.domain).then((list) => sendResponse({ success: true, whitelist: list }));
    return true;
  }

  if (message.type === "REMOVE_WHITELIST") {
    removeFromWhitelist(message.domain).then((list) => sendResponse({ success: true, whitelist: list }));
    return true;
  }

  if (message.type === "BYPASS_ONCE") {
    // Allow 5 minutes temporary session bypass for this URL
    sessionBypasses.set(message.url, Date.now() + 5 * 60 * 1000);
    sendResponse({ success: true });
    return true;
  }

  if (message.type === "SUBMIT_DISPUTE") {
    getSettings().then(async (settings) => {
      try {
        const res = await fetch(`${settings.apiBase}/scan/report`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: message.url,
            report_type: message.reportType || "FALSE_POSITIVE",
            original_trust_score: message.score,
            comment: "Submitted via SentiGuard Chrome Extension Interstitial",
          }),
        });
        const json = await res.json().catch(() => ({}));
        sendResponse({ success: res.ok, data: json });
      } catch (err) {
        sendResponse({ success: false, error: err.message });
      }
    });
    return true;
  }
});
