/**
 * SentiGuard - Popup Script
 * Handles popup UI logic: scan current tab, display results, toggle auto-scan.
 */

const API_BASE = "http://localhost:8000/api";

const statusCard      = document.getElementById("statusCard");
const statusIcon      = document.getElementById("statusIcon");
const statusTitle     = document.getElementById("statusTitle");
const statusSub       = document.getElementById("statusSub");
const trustBarContainer = document.getElementById("trustBarContainer");
const trustBarFill    = document.getElementById("trustBarFill");
const trustScoreLabel = document.getElementById("trustScoreLabel");
const riskList        = document.getElementById("riskList");
const riskItems       = document.getElementById("riskItems");
const scanBtn         = document.getElementById("scanBtn");
const autoScanToggle  = document.getElementById("autoScanToggle");


// ─── Init ──────────────────────────────────────────────────────────────────────

async function init() {
  // Load saved settings
  const settings = await chrome.storage.sync.get({ autoScan: true });
  autoScanToggle.checked = settings.autoScan;

  // Get current tab URL and scan it
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.url && !tab.url.startsWith("chrome://")) {
    await scanURL(tab.url);
  } else {
    setStatus("unavailable");
  }
}


// ─── Scan ──────────────────────────────────────────────────────────────────────

async function scanURL(url) {
  setStatus("scanning");

  try {
    const response = await fetch(`${API_BASE}/scan/url`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ url }),
    });

    if (!response.ok) throw new Error(`API error ${response.status}`);

    const result = await response.json();
    displayResult(result);

  } catch (err) {
    setStatus("error", err.message);
  }
}


// ─── Display Result ────────────────────────────────────────────────────────────

function displayResult(result) {
  const isSafe = result.verdict === "SAFE";

  // Status card
  statusCard.className = `status-card ${isSafe ? "safe" : "phishing"}`;
  statusIcon.textContent = isSafe ? "✅" : "🚨";
  statusTitle.textContent = isSafe ? "Safe Website" : "Phishing Detected!";
  statusSub.textContent = `Trust Score: ${result.trust_score}%`;

  // Trust bar
  trustBarContainer.style.display = "block";
  trustBarFill.style.width = `${result.trust_score}%`;
  trustBarFill.className = `trust-bar-fill ${isSafe ? "safe" : "phishing"}`;
  trustScoreLabel.textContent = `${result.trust_score}%`;

  // Risk factors
  if (!isSafe && result.risk_factors?.length > 0) {
    riskList.style.display = "block";
    riskItems.innerHTML = result.risk_factors
      .slice(0, 5)
      .map(r => `<div class="risk-item">${r}</div>`)
      .join("");
  } else {
    riskList.style.display = "none";
  }
}


// ─── Status States ─────────────────────────────────────────────────────────────

function setStatus(state, detail = "") {
  trustBarContainer.style.display = "none";
  riskList.style.display = "none";

  const states = {
    scanning:    { cls: "scanning", icon: "🔍", title: "Scanning...",       sub: "Analyzing current URL"    },
    unavailable: { cls: "scanning", icon: "ℹ️",  title: "Not available",     sub: "Can't scan this page"     },
    error:       { cls: "error",    icon: "⚠️",  title: "API Unreachable",    sub: detail || "Is the backend running?" },
  };

  const s = states[state] || states.scanning;
  statusCard.className = `status-card ${s.cls}`;
  statusIcon.textContent = s.icon;
  statusTitle.textContent = s.title;
  statusSub.textContent = s.sub;
}


// ─── Event Listeners ───────────────────────────────────────────────────────────

scanBtn.addEventListener("click", async () => {
  scanBtn.disabled = true;
  scanBtn.textContent = "Scanning...";

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.url) await scanURL(tab.url);

  scanBtn.disabled = false;
  scanBtn.textContent = "Scan Current Page";
});

autoScanToggle.addEventListener("change", () => {
  chrome.storage.sync.set({ autoScan: autoScanToggle.checked });
});


// ─── Run ───────────────────────────────────────────────────────────────────────
init();
