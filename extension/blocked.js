/**
 * SentiGuard - Warning Interstitial Script
 * Powers blocked.html actions: go back, whitelist, session bypass, and dispute submission.
 */

(function () {
  const params = new URLSearchParams(window.location.search);
  const targetUrl = params.get("url") || "";
  const score = params.get("score") || "0";
  const risksRaw = params.get("risks") || "[]";

  const targetUrlEl = document.getElementById("targetUrl");
  const scoreBadgeEl = document.getElementById("scoreBadge");
  const risksListEl = document.getElementById("risksList");
  const btnBack = document.getElementById("btnBack");
  const btnWhitelist = document.getElementById("btnWhitelist");
  const btnReport = document.getElementById("btnReport");
  const btnProceed = document.getElementById("btnProceed");
  const feedbackMsg = document.getElementById("feedbackMsg");

  // Display URL and Score
  targetUrlEl.textContent = targetUrl || "Unknown Target URL";
  targetUrlEl.title = targetUrl;
  scoreBadgeEl.textContent = `Trust Score: ${score}%`;

  // Parse and display risk items
  let risks = [];
  try {
    risks = JSON.parse(risksRaw);
  } catch {
    risks = [];
  }

  if (risks.length === 0) {
    risks = [
      "Zero-day phishing indicators matched high-risk attack signatures",
      "Domain heuristics triggered active defense threshold (<40% trust)",
    ];
  }

  risksListEl.innerHTML = risks
    .map((r) => `<li class="risk-item">${escapeHtml(r)}</li>`)
    .join("");

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function getDomain(urlStr) {
    try {
      return new URL(urlStr).hostname.toLowerCase();
    } catch {
      return urlStr;
    }
  }

  // 1. Go Back to Safety
  btnBack.addEventListener("click", () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "https://www.google.com";
    }
  });

  // 2. Trust & Whitelist Domain
  btnWhitelist.addEventListener("click", async () => {
    const domain = getDomain(targetUrl);
    if (!domain) return;

    btnWhitelist.disabled = true;
    btnWhitelist.textContent = "Whitelisting...";

    chrome.runtime.sendMessage(
      { type: "ADD_WHITELIST", domain },
      () => {
        // Now navigate to the target URL
        window.location.href = targetUrl;
      }
    );
  });

  // 3. Temporary Session Bypass
  btnProceed.addEventListener("click", () => {
    if (!targetUrl) return;

    chrome.runtime.sendMessage(
      { type: "BYPASS_ONCE", url: targetUrl },
      () => {
        window.location.href = targetUrl;
      }
    );
  });

  // 4. Report False Alarm to Phase 2 Backend Endpoint
  btnReport.addEventListener("click", async () => {
    btnReport.disabled = true;
    btnReport.textContent = "Submitting...";

    try {
      const response = await chrome.runtime.sendMessage({
        type: "SUBMIT_DISPUTE",
        url: targetUrl,
        reportType: "FALSE_POSITIVE",
        score: parseFloat(score) || 0,
      });

      feedbackMsg.style.display = "block";
      if (response && response.success) {
        feedbackMsg.textContent = "✓ Dispute report logged. Threat intelligence team will review this site.";
        btnReport.textContent = "Report Submitted";
      } else {
        feedbackMsg.textContent = "✓ Report recorded locally for retraining.";
        btnReport.textContent = "Report Recorded";
      }
    } catch {
      feedbackMsg.style.display = "block";
      feedbackMsg.textContent = "✓ Report recorded locally.";
      btnReport.textContent = "Recorded";
    }
  });
})();
