/**
 * SentiGuard - Popup Script (Phase 3 Active Shield)
 * ────────────────────────────────────────────────
 * Controls:
 * 1. Live tab scanning & reputation display
 * 2. Allowlist domain manager (add, list, remove)
 * 3. Active navigation interceptor toggle
 */

let currentTabUrl = "";
let currentDomain = "";

// Elements
const tabThreatsBtn = document.getElementById("tabThreatsBtn");
const tabWhitelistBtn = document.getElementById("tabWhitelistBtn");
const paneThreats = document.getElementById("paneThreats");
const paneWhitelist = document.getElementById("paneWhitelist");

const urlText = document.getElementById("urlText");
const statusCard = document.getElementById("statusCard");
const cardIcon = document.getElementById("cardIcon");
const statusHeadline = document.getElementById("statusHeadline");
const statusSubtitle = document.getElementById("statusSubtitle");
const gaugeBox = document.getElementById("gaugeBox");
const gaugeFill = document.getElementById("gaugeFill");
const scoreText = document.getElementById("scoreText");
const risksContainer = document.getElementById("risksContainer");

const btnRescan = document.getElementById("btnRescan");
const btnQuickWhitelist = document.getElementById("btnQuickWhitelist");
const shieldToggle = document.getElementById("shieldToggle");

const newDomainInput = document.getElementById("newDomainInput");
const btnAddDomain = document.getElementById("btnAddDomain");
const whitelistUl = document.getElementById("whitelistUl");


// ─── Tab Switching ────────────────────────────────────────────────────────────

tabThreatsBtn.addEventListener("click", () => {
  tabThreatsBtn.classList.add("active");
  tabWhitelistBtn.classList.remove("active");
  paneThreats.classList.add("active");
  paneWhitelist.classList.remove("active");
});

tabWhitelistBtn.addEventListener("click", () => {
  tabWhitelistBtn.classList.add("active");
  tabThreatsBtn.classList.remove("active");
  paneWhitelist.classList.add("active");
  paneThreats.classList.remove("active");
  loadWhitelist();
});


// ─── Initialization ───────────────────────────────────────────────────────────

async function init() {
  // Load settings
  chrome.runtime.sendMessage({ type: "GET_SETTINGS" }, (settings) => {
    if (settings) {
      shieldToggle.checked = settings.activeShield !== false;
    }
  });

  // Query active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.url) {
    showUnavailable("No active page detected");
    return;
  }

  currentTabUrl = tab.url;

  if (
    currentTabUrl.startsWith("chrome://") ||
    currentTabUrl.startsWith("chrome-extension://") ||
    currentTabUrl.startsWith("about:") ||
    currentTabUrl.startsWith("edge://")
  ) {
    showUnavailable("System Page (Protected)");
    return;
  }

  try {
    currentDomain = new URL(currentTabUrl).hostname;
    urlText.textContent = currentDomain || currentTabUrl;
    btnQuickWhitelist.textContent = `Whitelist "${currentDomain}"`;
  } catch {
    urlText.textContent = currentTabUrl;
  }

  // Scan current URL
  performScan(currentTabUrl);
}


// ─── Perform Scan ─────────────────────────────────────────────────────────────

function performScan(url) {
  setLoadingState();

  chrome.runtime.sendMessage({ type: "SCAN_URL", url }, (res) => {
    if (chrome.runtime.lastError || !res || !res.success) {
      showErrorState(res?.error || "Threat API unreachable");
      return;
    }

    renderScanResult(res.data);
  });
}


// ─── UI Rendering ─────────────────────────────────────────────────────────────

function setLoadingState() {
  statusCard.className = "status-card scanning";
  cardIcon.innerHTML = `
    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" class="animate-spin">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
    </svg>
  `;
  statusHeadline.textContent = "Scanning Page...";
  statusSubtitle.textContent = "Checking live heuristics & reputation";
  gaugeBox.style.display = "none";
  risksContainer.style.display = "none";
}

function renderScanResult(data) {
  const isSafe = data.verdict === "SAFE";
  const trustScore = typeof data.trust_score === "number" ? data.trust_score : (isSafe ? 95 : 10);

  statusCard.className = `status-card ${isSafe ? "safe" : "phishing"}`;

  if (isSafe) {
    cardIcon.innerHTML = `
      <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
      </svg>
    `;
    statusHeadline.textContent = "Verified Safe";
    statusSubtitle.textContent = `Trust Rating: ${trustScore}% • Authentic Destination`;
  } else {
    cardIcon.innerHTML = `
      <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
      </svg>
    `;
    statusHeadline.textContent = "Malicious Phishing Detected";
    statusSubtitle.textContent = `Critical Risk • Trust Rating: ${trustScore}%`;
  }

  // Gauge
  gaugeBox.style.display = "block";
  gaugeFill.className = `gauge-fill ${isSafe ? "safe" : "phishing"}`;
  gaugeFill.style.width = `${Math.min(100, Math.max(0, trustScore))}%`;
  scoreText.textContent = `${trustScore}%`;

  // Risk Factors
  if (!isSafe && data.risk_factors && data.risk_factors.length > 0) {
    risksContainer.style.display = "block";
    risksContainer.innerHTML = data.risk_factors
      .slice(0, 4)
      .map((r) => `<div class="chip"><span>⚠️</span> <span>${escapeHtml(r)}</span></div>`)
      .join("");
  } else {
    risksContainer.style.display = "none";
  }
}

function showUnavailable(reason) {
  statusCard.className = "status-card scanning";
  cardIcon.innerHTML = `<span>ℹ️</span>`;
  statusHeadline.textContent = reason;
  statusSubtitle.textContent = "SentiGuard protects standard web URLs";
  gaugeBox.style.display = "none";
  risksContainer.style.display = "none";
  btnRescan.disabled = true;
  btnQuickWhitelist.disabled = true;
}

function showErrorState(msg) {
  statusCard.className = "status-card scanning";
  cardIcon.innerHTML = `<span>⚠️</span>`;
  statusHeadline.textContent = "API Unreachable";
  statusSubtitle.textContent = msg || "Check backend on port 8000";
  gaugeBox.style.display = "none";
  risksContainer.style.display = "none";
}

function escapeHtml(str) {
  const d = document.createElement("div");
  d.textContent = str;
  return d.innerHTML;
}


// ─── Whitelist Manager ────────────────────────────────────────────────────────

function loadWhitelist() {
  chrome.runtime.sendMessage({ type: "GET_WHITELIST" }, (res) => {
    const list = res?.whitelist || [];
    renderWhitelistItems(list);
  });
}

function renderWhitelistItems(list) {
  if (list.length === 0) {
    whitelistUl.innerHTML = `<li class="empty-whitelist">No trusted domains yet. Whitelisted domains bypass security checks.</li>`;
    return;
  }

  whitelistUl.innerHTML = list
    .map(
      (domain) => `
      <li class="whitelist-item">
        <span>${escapeHtml(domain)}</span>
        <button class="btn-del" data-domain="${escapeHtml(domain)}" title="Remove domain">✕</button>
      </li>
    `
    )
    .join("");

  // Attach delete handlers
  document.querySelectorAll(".btn-del").forEach((btn) => {
    btn.addEventListener("click", () => {
      const dom = btn.getAttribute("data-domain");
      chrome.runtime.sendMessage({ type: "REMOVE_WHITELIST", domain: dom }, (res) => {
        renderWhitelistItems(res?.whitelist || []);
      });
    });
  });
}

btnAddDomain.addEventListener("click", () => {
  const domain = newDomainInput.value.trim().toLowerCase();
  if (!domain) return;

  chrome.runtime.sendMessage({ type: "ADD_WHITELIST", domain }, (res) => {
    newDomainInput.value = "";
    renderWhitelistItems(res?.whitelist || []);
  });
});

btnQuickWhitelist.addEventListener("click", () => {
  if (!currentDomain) return;

  btnQuickWhitelist.disabled = true;
  btnQuickWhitelist.textContent = "Whitelisted ✓";

  chrome.runtime.sendMessage({ type: "ADD_WHITELIST", domain: currentDomain }, () => {
    setTimeout(() => {
      btnQuickWhitelist.disabled = false;
      btnQuickWhitelist.textContent = `Whitelist "${currentDomain}"`;
    }, 2000);
  });
});


// ─── Event Handlers ───────────────────────────────────────────────────────────

btnRescan.addEventListener("click", () => {
  if (currentTabUrl) {
    performScan(currentTabUrl);
  }
});

shieldToggle.addEventListener("change", () => {
  chrome.storage.sync.set({ activeShield: shieldToggle.checked });
});


// Run
init();
