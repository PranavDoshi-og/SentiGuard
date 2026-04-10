/**
 * SentiGuard - Content Script
 * Injected into every webpage. Listens for scan results from background worker
 * and displays a warning banner when phishing is detected.
 */

(function () {
  "use strict";

  // Prevent duplicate injection
  if (window.__sentiguardInjected) return;
  window.__sentiguardInjected = true;

  let warningBanner = null;

  // ─── Message Listener ──────────────────────────────────────────────────────

  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "SHOW_WARNING") {
      showWarningBanner(message.data);
    }
    if (message.type === "CLEAR_WARNING") {
      removeWarningBanner();
    }
  });


  // ─── Warning Banner ────────────────────────────────────────────────────────

  function showWarningBanner(result) {
    if (warningBanner) return; // Already showing

    const riskList = result.risk_factors?.slice(0, 3).map(r => `• ${r}`).join("\n") || "";

    warningBanner = document.createElement("div");
    warningBanner.id = "sentiguard-warning";
    warningBanner.innerHTML = `
      <div style="
        position: fixed;
        top: 0; left: 0; right: 0;
        z-index: 2147483647;
        background: linear-gradient(135deg, #1a0a0a, #2d1010);
        color: #fff;
        padding: 12px 20px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        font-size: 14px;
        border-bottom: 3px solid #ff3333;
        display: flex;
        align-items: center;
        gap: 16px;
        box-shadow: 0 4px 20px rgba(255,0,0,0.3);
      ">
        <span style="font-size: 22px; flex-shrink: 0;">🛡️</span>
        <div style="flex: 1;">
          <strong style="color: #ff6666; font-size: 15px;">
            ⚠️ SentiGuard: Phishing Site Detected
          </strong>
          <div style="margin-top: 4px; color: #ffcccc; font-size: 12px;">
            Trust Score: <strong>${result.trust_score}%</strong> &nbsp;|&nbsp;
            Risk: <strong style="color: #ff4444;">HIGH</strong>
            ${riskList ? `<br><span style="opacity: 0.8;">${riskList.replace(/\n/g, " &nbsp; ")}</span>` : ""}
          </div>
        </div>
        <div style="display: flex; gap: 8px; flex-shrink: 0;">
          <button id="sentiguard-leave" style="
            background: #ff3333;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 600;
          ">Leave Site</button>
          <button id="sentiguard-dismiss" style="
            background: transparent;
            color: #aaa;
            border: 1px solid #555;
            padding: 8px 12px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 13px;
          ">Dismiss</button>
        </div>
      </div>
    `;

    document.body.prepend(warningBanner);

    document.getElementById("sentiguard-leave")?.addEventListener("click", () => {
      window.history.back();
    });

    document.getElementById("sentiguard-dismiss")?.addEventListener("click", () => {
      removeWarningBanner();
    });
  }


  function removeWarningBanner() {
    if (warningBanner) {
      warningBanner.remove();
      warningBanner = null;
    }
  }

})();
