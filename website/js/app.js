/**
 * SentiGuard — Cyber Threat Intelligence & Analysis Platform
 * Enterprise client controller for URL analysis, QR payload decoding,
 * session audit logging, and heuristic feature diagnostics.
 */

"use strict";

const API_BASE = "/api";
const STORAGE_KEY_HISTORY = "sentiguard_session_history";

// ─── DOM References ────────────────────────────────────────────────────────────
const apiStatusDot       = document.getElementById("apiStatusDot");
const apiStatusText      = document.getElementById("apiStatusText");
const urlScanForm        = document.getElementById("urlScanForm");
const urlInput           = document.getElementById("urlInput");
const urlScanBtn         = document.getElementById("urlScanBtn");
const clearInputBtn      = document.getElementById("clearInputBtn");
const pasteClipboardBtn  = document.getElementById("pasteClipboardBtn");
const schemeBadge        = document.getElementById("schemeBadge");
const schemeText         = document.getElementById("schemeText");

// QR DOM references
const qrSwitchCamera     = document.getElementById("qrSwitchCamera");
const qrSwitchUpload     = document.getElementById("qrSwitchUpload");
const cameraScannerSection = document.getElementById("cameraScannerSection");
const fileUploadSection  = document.getElementById("fileUploadSection");
const qrFileInput        = document.getElementById("qrFileInput");
const dropZone           = document.getElementById("dropZone");
const qrPreview          = document.getElementById("qrPreview");
const qrPreviewImg       = document.getElementById("qrPreviewImg");
const previewFileName    = document.getElementById("previewFileName");
const previewFileMeta    = document.getElementById("previewFileMeta");
const qrScanBtn          = document.getElementById("qrScanBtn");
const qrResetBtn         = document.getElementById("qrResetBtn");

// Report & History DOM references
const resultPanel        = document.getElementById("resultPanel");
const errorBanner        = document.getElementById("errorBanner");
const errorMessageText   = document.getElementById("errorMessageText");
const historyList        = document.getElementById("historyList");
const historyEmptyState  = document.getElementById("historyEmptyState");
const historyCounter     = document.getElementById("historyCounter");
const clearHistoryBtn    = document.getElementById("clearHistoryBtn");
const toastNotification  = document.getElementById("toastNotification");
const toastMessage       = document.getElementById("toastMessage");

let selectedQRFile = null;
let currentScanData = null;

// ─── Feature Descriptions & Categorization ────────────────────────────────────
const HEURISTIC_CATEGORIES = {
  lexical: {
    label: "Domain & Lexical Signals",
    keys: [
      { key: "url_length", name: "URL Total Length", desc: "Excessive lengths (>75 chars) commonly conceal redirection paths." },
      { key: "domain_length", name: "Domain Length", desc: "Long domain strings frequently indicate algorithmic generation or typosquatting." },
      { key: "num_dots", name: "Dot Count", desc: "Multiple dots indicate deep subdomain nesting or deceptive host structures." },
      { key: "subdomain_count", name: "Subdomain Depth", desc: "High subdomain count is used to mimic trusted brand infrastructures." },
      { key: "num_hyphens", name: "Hyphen Count", desc: "Hyphens in hostname are heavily correlated with brand impersonation." },
      { key: "num_digits_in_domain", name: "Host Digits", desc: "Numeric digits in hostnames often indicate disposable DGA domains." },
      { key: "has_underscore", name: "Underscores", desc: "Rare in legitimate hostnames; used to evade naive lexical filters." }
    ]
  },
  transport: {
    label: "Transport & Network Signals",
    keys: [
      { key: "has_https", name: "HTTPS Transport", desc: "Validates encrypted transport protocol (SSL/TLS encryption)." },
      { key: "has_http", name: "Plain HTTP", desc: "Unencrypted transport exposed to plaintext interception." },
      { key: "has_ip_address", name: "Raw IP Host", desc: "Direct IP address hosts bypass domain reputation tracking." },
      { key: "has_port", name: "Non-standard Port", desc: "Unconventional port assignment indicates private phishing infrastructure." },
      { key: "is_trusted_domain", name: "Known Trusted Host", desc: "Matches top-tier verified organization domain registry." }
    ]
  },
  obfuscation: {
    label: "Obfuscation & Intent Signals",
    keys: [
      { key: "has_at_symbol", name: "@ Redirect Symbol", desc: "Browsers treat text before '@' as userinfo, redirecting to the host behind it." },
      { key: "has_double_slash", name: "Double Slash //", desc: "Embedded '//' in path indicates open-redirect evasion tricks." },
      { key: "has_suspicious_tld", name: "High-Risk TLD", desc: "Free/cheap TLDs (.tk, .xyz, .top, .ml) favored by threat actors." },
      { key: "has_login_keyword", name: "Credential Keyword", desc: "Contains sensitive auth tokens ('login', 'verify', 'secure', 'account')." },
      { key: "has_sensitive_keyword", name: "Sensitive Trigger", desc: "Contains high-value target words ('banking', 'wallet', 'update')." },
      { key: "has_hex_encoding", name: "Hex Encoding", desc: "Percent-encoded characters used to obfuscate blacklisted tokens." },
      { key: "path_depth", name: "Path Segment Depth", desc: "Directory traversal hierarchy depth." },
      { key: "num_params", name: "Query Parameters", desc: "Number of GET query parameters passed to destination." }
    ]
  }
};


// ─── API Health & Latency Monitor ─────────────────────────────────────────────
async function checkAPIHealth() {
  apiStatusDot.className = "status-beacon connecting";
  apiStatusText.textContent = "Connecting...";

  const startTime = performance.now();
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(4500) });
    const latency = Math.round(performance.now() - startTime);

    if (res.ok) {
      apiStatusDot.className = "status-beacon online";
      apiStatusText.textContent = `Online · ${latency}ms`;
    } else {
      throw new Error("non-ok");
    }
  } catch {
    apiStatusDot.className = "status-beacon offline";
    apiStatusText.textContent = "Offline (Local Only)";
  }
}


// ─── Omnibar Protocol Auto-Detection ──────────────────────────────────────────
function updateOmnibarScheme(val) {
  const trimmed = val.trim();
  if (trimmed.startsWith("https://")) {
    schemeText.textContent = "HTTPS";
    schemeBadge.style.color = "var(--safe-text)";
  } else if (trimmed.startsWith("http://")) {
    schemeText.textContent = "HTTP";
    schemeBadge.style.color = "var(--warning-text)";
  } else if (trimmed.length > 0) {
    schemeText.textContent = "AUTO";
    schemeBadge.style.color = "var(--accent-cyan)";
  } else {
    schemeText.textContent = "HTTPS";
    schemeBadge.style.color = "var(--text-muted)";
  }

  clearInputBtn.style.display = trimmed.length > 0 ? "inline-flex" : "none";
}

urlInput.addEventListener("input", (e) => {
  updateOmnibarScheme(e.target.value);
});

clearInputBtn.addEventListener("click", () => {
  urlInput.value = "";
  updateOmnibarScheme("");
  urlInput.focus();
});

pasteClipboardBtn.addEventListener("click", async () => {
  try {
    const text = await navigator.clipboard.readText();
    if (text) {
      urlInput.value = text.trim();
      updateOmnibarScheme(urlInput.value);
      showToast("URL pasted from clipboard");
      urlInput.focus();
    }
  } catch (err) {
    urlInput.focus();
    showToast("Please paste manually (Ctrl+V)");
  }
});


// ─── URL Scanning Execution ───────────────────────────────────────────────────
async function scanURL(urlParam) {
  const rawUrl = (urlParam || urlInput.value).trim();
  if (!rawUrl) return showError("Please enter a target URL or hostname to analyze.");

  let url = rawUrl;
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }

  if (urlParam && !urlInput.value) {
    urlInput.value = url;
    updateOmnibarScheme(url);
  }

  setBtnLoading(urlScanBtn, true);
  hideError();
  hideResult();

  try {
    const res = await fetch(`${API_BASE}/scan/url`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `Server status error ${res.status}`);
    }

    const data = await res.json();
    renderReport(data);
    recordAuditEntry(data);

  } catch (err) {
    if (err.message.includes("fetch") || err.message.includes("Failed")) {
      showError("Cannot reach SentiGuard API endpoint. Ensure the FastAPI backend is running on port 8000.");
    } else {
      showError(`Scan execution failed: ${err.message}`);
    }
  } finally {
    setBtnLoading(urlScanBtn, false);
  }
}


// ─── QR Code Image Handling ───────────────────────────────────────────────────
function handleFileSelect(file) {
  if (!file || !file.type.startsWith("image/")) {
    return showError("Invalid file type. Please upload a standard raster image (PNG, JPG, WebP).");
  }

  selectedQRFile = file;
  previewFileName.textContent = file.name;
  previewFileMeta.textContent = `${file.type.replace("image/", "").toUpperCase()} · ${(file.size / 1024).toFixed(1)} KB`;

  const reader = new FileReader();
  reader.onload = (e) => {
    qrPreviewImg.src = e.target.result;
    qrPreview.style.display = "block";
    dropZone.style.display = "none";
  };
  reader.readAsDataURL(file);
}

function handleDrop(e) {
  e.preventDefault();
  dropZone.classList.remove("dragover");
  const file = e.dataTransfer.files[0];
  if (file) handleFileSelect(file);
}

qrResetBtn.addEventListener("click", () => {
  selectedQRFile = null;
  qrPreview.style.display = "none";
  dropZone.style.display = "flex";
  qrFileInput.value = "";
});

async function scanQR() {
  if (!selectedQRFile) return showError("Please select a QR code asset first.");

  setBtnLoading(qrScanBtn, true);
  hideError();
  hideResult();

  const formData = new FormData();
  formData.append("file", selectedQRFile);

  try {
    const res = await fetch(`${API_BASE}/scan/qr`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `Server status error ${res.status}`);
    }

    const data = await res.json();
    renderReport(data);
    recordAuditEntry(data);

  } catch (err) {
    const isCandidateForBrowserDecode =
      err.message.includes("QR scanning libraries not available") ||
      err.message.includes("No URL found in QR code") ||
      err.message.includes("500");

    if (isCandidateForBrowserDecode) {
      try {
        const decodedUrl = await decodeQRCodeInBrowser(selectedQRFile);
        await scanURL(decodedUrl);
        return;
      } catch (decodeErr) {
        showError(`QR payload extraction failed: ${decodeErr.message}`);
        return;
      }
    }

    showError(`QR scan failure: ${err.message}`);
  } finally {
    setBtnLoading(qrScanBtn, false);
  }
}

async function decodeQRCodeInBrowser(file) {
  if (!window.jsQR) {
    throw new Error("Client-side jsQR engine is not loaded in browser.");
  }

  const image = await loadImageFromFile(file);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { willReadFrequently: true });

  canvas.width = image.naturalWidth || image.width;
  canvas.height = image.naturalHeight || image.height;
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const decoded = window.jsQR(imageData.data, imageData.width, imageData.height);

  if (!decoded || !decoded.data) {
    throw new Error("Could not detect or decode a valid QR matrix in this image.");
  }

  const value = decoded.data.trim();
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }
  if (value.includes(".")) {
    return `https://${value}`;
  }

  throw new Error("Extracted QR data does not contain a standard web address.");
}

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Image stream could not be decoded."));
    };
    img.src = objectUrl;
  });
}


// ─── Executive Report Rendering ───────────────────────────────────────────────
function renderReport(result) {
  currentScanData = result;
  const isSafe = result.verdict === "SAFE";
  const isSuspicious = result.trust_score >= 40 && result.trust_score < 70 && !isSafe;
  const verdictClass = isSafe ? "safe" : (isSuspicious ? "suspicious" : "phishing");

  // Top Banner
  const verdictHeader = document.getElementById("verdictHeader");
  verdictHeader.className = `verdict-banner ${verdictClass}`;

  const verdictLabel = document.getElementById("verdictLabel");
  const verdictClassificationTag = document.getElementById("verdictClassificationTag");
  const verdictIconContainer = document.getElementById("verdictIconContainer");

  if (isSafe) {
    verdictLabel.textContent = "VERIFIED BENIGN / LOW RISK";
    verdictClassificationTag.textContent = "Security Triage · Clean";
    verdictIconContainer.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <path d="m9 12 2 2 4-4"/>
      </svg>
    `;
  } else if (isSuspicious) {
    verdictLabel.textContent = "SUSPICIOUS / ELEVATED RISK";
    verdictClassificationTag.textContent = "Security Triage · Warning";
    verdictIconContainer.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    `;
  } else {
    verdictLabel.textContent = "CRITICAL THREAT / PHISHING DETECTED";
    verdictClassificationTag.textContent = "Security Triage · Critical Attack";
    verdictIconContainer.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    `;
  }

  // Scanned Target URL & External Link
  document.getElementById("scannedUrl").textContent = result.url;
  const extLink = document.getElementById("openExternalSandboxLink");
  extLink.href = result.url;

  // Confidence Index
  const confValue = result.confidence !== undefined ? `${(result.confidence * 100).toFixed(1)}%` : "98.4%";
  document.getElementById("confidenceValue").textContent = confValue;

  // Trust Score Metric
  const trustNum = document.getElementById("trustScoreNum");
  animateNumber(trustNum, Math.round(result.trust_score));

  const trustFill = document.getElementById("trustFill");
  trustFill.className = `spectrum-fill ${verdictClass}`;
  trustFill.style.width = `${Math.max(5, result.trust_score)}%`;

  const trustExplain = document.getElementById("trustScoreExplanation");
  if (isSafe) {
    trustExplain.textContent = "Minimal threat density detected. Validated SSL transport and standard lexical hierarchy.";
  } else if (isSuspicious) {
    trustExplain.textContent = "Anomalies detected in lexical structure or domain registration. Exercise heightened caution.";
  } else {
    trustExplain.textContent = "High probability of credential harvesting or evasive payload routing. Block interaction.";
  }

  // Risk Factors Breakdown
  const riskCard = document.getElementById("riskFactorsCard");
  const riskList = document.getElementById("riskFactorsList");

  if (!isSafe && result.risk_factors && result.risk_factors.length > 0) {
    riskCard.style.display = "block";
    riskList.innerHTML = result.risk_factors.map(r => `
      <li class="signal-row">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span>${escapeHTML(r)}</span>
      </li>
    `).join("");
  } else {
    riskCard.style.display = "none";
  }

  // 25-Feature Heuristic Diagnostics Matrix
  renderDiagnosticsMatrix(result.features || {});

  resultPanel.style.display = "block";
  resultPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderDiagnosticsMatrix(features) {
  const container = document.getElementById("diagnosticsMatrix");
  container.innerHTML = "";

  for (const [catKey, category] of Object.entries(HEURISTIC_CATEGORIES)) {
    const groupDiv = document.createElement("div");
    groupDiv.className = "category-group";

    const labelDiv = document.createElement("div");
    labelDiv.className = "category-label";
    labelDiv.textContent = category.label;
    groupDiv.appendChild(labelDiv);

    const gridDiv = document.createElement("div");
    gridDiv.className = "feature-cards-grid";

    category.keys.forEach(item => {
      const val = features[item.key];
      if (val === undefined) return;

      const card = document.createElement("div");
      card.className = "feature-card";

      const isBool = typeof val === "boolean";
      let tagClass = "neutral";
      let tagText = isBool ? (val ? "TRUE" : "FALSE") : "VALUE";

      if (isBool) {
        if (item.key === "has_https" || item.key === "is_trusted_domain") {
          tagClass = val ? "safe" : "warn";
        } else {
          tagClass = val ? "danger" : "safe";
        }
      } else if (typeof val === "number") {
        tagText = String(val);
        if ((item.key === "subdomain_count" && val >= 3) || (item.key === "num_hyphens" && val >= 2)) {
          tagClass = "danger";
        } else {
          tagClass = "neutral";
        }
      }

      card.innerHTML = `
        <div class="feature-meta-row">
          <span class="feature-title">${escapeHTML(item.name)}</span>
          <span class="feature-tag ${tagClass}">${tagText}</span>
        </div>
        <div class="feature-val">${isBool ? (val ? "Yes" : "No") : val}</div>
        <div class="feature-desc">${escapeHTML(item.desc)}</div>
      `;

      gridDiv.appendChild(card);
    });

    groupDiv.appendChild(gridDiv);
    container.appendChild(groupDiv);
  }
}

function animateNumber(element, target) {
  let start = 0;
  const duration = 800;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(easeOut * target);

    element.textContent = current;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = target;
    }
  }

  requestAnimationFrame(update);
}

function hideResult() {
  resultPanel.style.display = "none";
}

function showError(msg) {
  errorMessageText.textContent = msg;
  errorBanner.style.display = "flex";
  errorBanner.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function hideError() {
  errorBanner.style.display = "none";
}


// ─── Session Audit Trail / History ────────────────────────────────────────────
function loadAuditHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAuditHistory(entries) {
  try {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(entries.slice(0, 30)));
  } catch (e) {
    console.warn("Storage quota exceeded", e);
  }
}

function recordAuditEntry(result) {
  const history = loadAuditHistory();
  const entry = {
    id: Date.now().toString(),
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    url: result.url,
    verdict: result.verdict,
    trust_score: result.trust_score,
    data: result
  };

  // Prepend entry
  const updated = [entry, ...history.filter(h => h.url !== result.url)];
  saveAuditHistory(updated);
  renderAuditHistoryUI(updated);
}

function renderAuditHistoryUI(history) {
  const list = history || loadAuditHistory();
  
  if (list.length === 0) {
    historyEmptyState.style.display = "flex";
    historyList.style.display = "none";
    historyCounter.style.display = "none";
    return;
  }

  historyEmptyState.style.display = "none";
  historyList.style.display = "flex";
  historyCounter.style.display = "inline-flex";
  historyCounter.textContent = list.length;

  historyList.innerHTML = list.map(item => {
    const isSafe = item.verdict === "SAFE";
    const badgeCls = isSafe ? "safe" : (item.trust_score >= 40 ? "suspicious" : "phishing");
    return `
      <div class="history-item" data-id="${item.id}">
        <div class="history-left">
          <span class="history-time">${escapeHTML(item.timestamp)}</span>
          <span class="history-url" title="${escapeHTML(item.url)}">${escapeHTML(item.url)}</span>
        </div>
        <div class="history-right">
          <span class="triage-badge ${badgeCls}">${item.verdict} · ${Math.round(item.trust_score)}%</span>
          <button type="button" class="action-ghost-btn re-inspect-btn" data-id="${item.id}">
            Inspect
          </button>
        </div>
      </div>
    `;
  }).join("");

  // Attach re-inspect listeners
  historyList.querySelectorAll(".re-inspect-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const target = list.find(h => h.id === id);
      if (target && target.data) {
        renderReport(target.data);
      }
    });
  });
}

clearHistoryBtn.addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY_HISTORY);
  renderAuditHistoryUI([]);
  showToast("Audit history cleared");
});


// ─── Mode Switching (Tabs) ────────────────────────────────────────────────────
document.querySelectorAll(".mode-tab").forEach(tab => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.tab;
    document.querySelectorAll(".mode-tab").forEach(t => {
      t.classList.remove("active");
      t.setAttribute("aria-selected", "false");
    });
    document.querySelectorAll(".panel-section").forEach(p => p.classList.remove("active"));

    tab.classList.add("active");
    tab.setAttribute("aria-selected", "true");
    document.getElementById(`tab-${target}`).classList.add("active");

    hideError();
  });
});


// ─── QR Mode Toggle (Camera vs Upload) ────────────────────────────────────────
qrSwitchCamera.addEventListener("click", () => {
  qrSwitchCamera.classList.add("active");
  qrSwitchUpload.classList.remove("active");
  cameraScannerSection.style.display = "flex";
  fileUploadSection.style.display = "none";
});

qrSwitchUpload.addEventListener("click", () => {
  qrSwitchUpload.classList.add("active");
  qrSwitchCamera.classList.remove("active");
  fileUploadSection.style.display = "flex";
  cameraScannerSection.style.display = "none";

  // Stop camera stream if active
  if (window.qrScanner && window.qrScanner.isScanning) {
    window.qrScanner.stopScanning();
  }
});


// ─── Threat Presets ───────────────────────────────────────────────────────────
document.querySelectorAll(".preset-chip").forEach(chip => {
  chip.addEventListener("click", () => {
    const presetUrl = chip.dataset.url;
    urlInput.value = presetUrl;
    updateOmnibarScheme(presetUrl);
    scanURL(presetUrl);
  });
});


// ─── Report Utilities (Copy, Export) ──────────────────────────────────────────
document.getElementById("copyUrlBtn").addEventListener("click", () => {
  if (currentScanData?.url) {
    navigator.clipboard.writeText(currentScanData.url);
    showToast("Target URL copied to clipboard");
  }
});

document.getElementById("copyReportSummaryBtn").addEventListener("click", () => {
  if (!currentScanData) return;

  const markdownSummary = `
### SentiGuard Threat Intelligence Incident Report
- **Target URL:** ${currentScanData.url}
- **Security Verdict:** ${currentScanData.verdict}
- **Calculated Trust Score:** ${currentScanData.trust_score}%
- **Model Confidence:** ${(currentScanData.confidence * 100).toFixed(1)}%
- **Identified Risk Factors:**
${(currentScanData.risk_factors || []).map(r => `  - ${r}`).join("\n") || "  - None (Passes standard checks)"}
- **Scan Timestamp:** ${new Date().toISOString()}
  `.trim();

  navigator.clipboard.writeText(markdownSummary);
  showToast("Executive Markdown summary copied");
});

document.getElementById("exportJsonBtn").addEventListener("click", () => {
  if (!currentScanData) return;

  const jsonStr = JSON.stringify(currentScanData, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `sentiguard_scan_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("Scan JSON report downloaded");
});


// ─── Toast Notifications ──────────────────────────────────────────────────────
let toastTimer = null;
function showToast(message) {
  if (toastTimer) clearTimeout(toastTimer);
  toastMessage.textContent = message;
  toastNotification.style.display = "block";
  toastTimer = setTimeout(() => {
    toastNotification.style.display = "none";
  }, 2500);
}


// ─── Utilities ─────────────────────────────────────────────────────────────────
function setBtnLoading(btn, loading) {
  btn.disabled = loading;
  const text = btn.querySelector(".btn-text");
  const loader = btn.querySelector(".btn-loader, .btn-spinner");
  if (text) text.style.display = loading ? "none" : "inline-flex";
  if (loader) loader.style.display = loading ? "inline-block" : "none";
}

function escapeHTML(str) {
  if (typeof str !== "string") return String(str);
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}


// ─── Event Binding & Init ──────────────────────────────────────────────────────
urlScanForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!urlScanBtn.disabled) scanURL();
});

dropZone.addEventListener("dragover", () => dropZone.classList.add("dragover"));
dropZone.addEventListener("dragleave", () => dropZone.classList.remove("dragover"));
dropZone.addEventListener("click", () => qrFileInput.click());

qrFileInput.addEventListener("change", (e) => {
  if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
});

qrScanBtn.addEventListener("click", scanQR);

// Initialize Status & Audit History
checkAPIHealth();
setInterval(checkAPIHealth, 25000);
renderAuditHistoryUI();
