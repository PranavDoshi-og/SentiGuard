/**
 * SentiGuard - Frontend App
 * Handles URL scanning, QR scanning, API calls, and result rendering.
 */

"use strict";

const API_BASE = "http://localhost:8000/api";

// ─── DOM References ────────────────────────────────────────────────────────────

const apiStatusDot   = document.getElementById("apiStatusDot");
const apiStatusText  = document.getElementById("apiStatusText");
const urlInput       = document.getElementById("urlInput");
const urlScanBtn     = document.getElementById("urlScanBtn");
const qrFileInput    = document.getElementById("qrFileInput");
const dropZone       = document.getElementById("dropZone");
const qrPreview      = document.getElementById("qrPreview");
const qrPreviewImg   = document.getElementById("qrPreviewImg");
const qrScanBtn      = document.getElementById("qrScanBtn");
const resultPanel    = document.getElementById("resultPanel");
const errorBanner    = document.getElementById("errorBanner");

let selectedQRFile = null;


// ─── API Health Check ──────────────────────────────────────────────────────────

async function checkAPIHealth() {
  apiStatusDot.className  = "status-dot connecting";
  apiStatusText.textContent = "Connecting...";

  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      apiStatusDot.className  = "status-dot online";
      apiStatusText.textContent = "API Online";
    } else {
      throw new Error("non-ok");
    }
  } catch {
    apiStatusDot.className  = "status-dot offline";
    apiStatusText.textContent = "API Offline";
  }
}


// ─── URL Scanning ──────────────────────────────────────────────────────────────

async function scanURL() {
  const url = urlInput.value.trim();
  if (!url) return showError("Please enter a URL.");
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return showError("URL must start with http:// or https://");
  }

  setLoading(urlScanBtn, true);
  hideError();
  hideResult();

  try {
    const res = await fetch(`${API_BASE}/scan/url`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ url }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `Server error: ${res.status}`);
    }

    const data = await res.json();
    showResult(data);

  } catch (err) {
    if (err.message.includes("fetch") || err.message.includes("Failed")) {
      showError("Cannot reach the API. Make sure the backend is running on port 8000.");
    } else {
      showError(`Scan failed: ${err.message}`);
    }
  } finally {
    setLoading(urlScanBtn, false);
  }
}


// ─── QR Scanning ──────────────────────────────────────────────────────────────

function handleFileSelect(file) {
  if (!file || !file.type.startsWith("image/")) {
    return showError("Please upload an image file (PNG, JPG, WebP).");
  }

  selectedQRFile = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    qrPreviewImg.src = e.target.result;
    qrPreview.style.display = "flex";
    dropZone.style.display = "none";
  };
  reader.readAsDataURL(file);
}

function handleDrop(e) {
  e.preventDefault();
  dropZone.classList.remove("dragover");
  const file = e.dataTransfer.files[0];
  handleFileSelect(file);
}

async function scanQR() {
  if (!selectedQRFile) return showError("Please select a QR code image first.");

  setLoading(qrScanBtn, true);
  hideError();
  hideResult();

  const formData = new FormData();
  formData.append("file", selectedQRFile);

  try {
    const res = await fetch(`${API_BASE}/scan/qr`, {
      method: "POST",
      body:   formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `Server error: ${res.status}`);
    }

    const data = await res.json();
    showResult(data);

  } catch (err) {
    showError(`QR scan failed: ${err.message}`);
  } finally {
    setLoading(qrScanBtn, false);
  }
}


// ─── Result Rendering ──────────────────────────────────────────────────────────

function showResult(result) {
  const isSafe = result.verdict === "SAFE";

  // Verdict Header
  const verdictHeader = document.getElementById("verdictHeader");
  verdictHeader.className = `verdict-header ${isSafe ? "safe" : "phishing"}`;
  document.getElementById("verdictIcon").textContent   = isSafe ? "✅" : "🚨";
  document.getElementById("verdictLabel").textContent  = isSafe ? "SAFE" : "PHISHING DETECTED";
  document.getElementById("scannedUrl").textContent    = result.url;

  // Trust Score
  const trustNum  = document.getElementById("trustScoreNum");
  const trustFill = document.getElementById("trustFill");
  trustNum.textContent = `${result.trust_score}%`;
  trustNum.style.color = isSafe ? "var(--safe-text)" : "var(--phish-text)";
  trustFill.style.width = `${result.trust_score}%`;
  trustFill.className = `trust-fill ${isSafe ? "safe" : "phishing"}`;

  // Risk Factors
  const riskCard = document.getElementById("riskFactorsCard");
  const riskList = document.getElementById("riskFactorsList");
  if (!isSafe && result.risk_factors?.length > 0) {
    riskCard.style.display = "block";
    riskList.innerHTML = result.risk_factors
      .map(r => `<li class="risk-item">${escapeHTML(r)}</li>`)
      .join("");
  } else {
    riskCard.style.display = "none";
  }

  // Features Grid
  const featuresGrid = document.getElementById("featuresGrid");
  const SHOW_FEATURES = [
    "has_https", "has_ip_address", "url_length", "num_dots",
    "has_at_symbol", "has_suspicious_tld", "num_hyphens", "has_login_keyword",
    "has_hex_encoding", "subdomain_count", "num_params", "path_depth",
  ];
  featuresGrid.innerHTML = SHOW_FEATURES
    .filter(k => k in result.features)
    .map(k => {
      const val = result.features[k];
      const isBoolean = typeof val === "boolean";
      const displayVal = isBoolean ? (val ? "Yes" : "No") : val;
      const cls = isBoolean ? (val ? "true" : "false") : "num";
      return `
        <div class="feature-chip">
          <span class="feature-name">${formatFeatureName(k)}</span>
          <span class="feature-value ${cls}">${displayVal}</span>
        </div>
      `;
    }).join("");

  resultPanel.style.display = "block";
  resultPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function hideResult() {
  resultPanel.style.display = "none";
}


// ─── Tabs ──────────────────────────────────────────────────────────────────────

document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.tab;
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(`tab-${target}`).classList.add("active");
    hideResult();
    hideError();
  });
});


// ─── Quick Test Buttons ────────────────────────────────────────────────────────

document.querySelectorAll(".quick-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    urlInput.value = btn.dataset.url;
    scanURL();
  });
});


// ─── Event Listeners ───────────────────────────────────────────────────────────

urlScanBtn.addEventListener("click", scanURL);

urlInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") scanURL();
});

qrFileInput.addEventListener("change", (e) => {
  handleFileSelect(e.target.files[0]);
});

dropZone.addEventListener("dragover",  () => dropZone.classList.add("dragover"));
dropZone.addEventListener("dragleave", () => dropZone.classList.remove("dragover"));
dropZone.addEventListener("click", () => qrFileInput.click());

qrScanBtn.addEventListener("click", scanQR);


// ─── Utilities ─────────────────────────────────────────────────────────────────

function setLoading(btn, loading) {
  btn.disabled = loading;
  const text    = btn.querySelector(".btn-text");
  const spinner = btn.querySelector(".btn-spinner");
  if (text)    text.textContent  = loading ? "Analyzing..." : (btn.id === "urlScanBtn" ? "Analyze" : "Scan QR Code");
  if (spinner) spinner.style.display = loading ? "inline" : "none";
}

function showError(msg) {
  errorBanner.textContent = `⚠️  ${msg}`;
  errorBanner.style.display = "block";
}

function hideError() {
  errorBanner.style.display = "none";
}

function escapeHTML(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function formatFeatureName(key) {
  return key.replace(/^has_/, "").replace(/_/g, " ");
}


// ─── Init ──────────────────────────────────────────────────────────────────────

checkAPIHealth();
setInterval(checkAPIHealth, 30_000); // Re-check every 30s
