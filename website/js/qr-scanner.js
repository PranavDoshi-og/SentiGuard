/**
 * SentiGuard - Mobile QR Scanner Module
 * Uses Camera API for real-time QR code detection
 * Falls back to file upload on unsupported devices
 */

class MobileQRScanner {
  constructor() {
    this.video = null;
    this.canvas = null;
    this.isScanning = false;
    this.stream = null;
    this.scannerActive = false;
  }

  /**
   * Check if camera is available or likely supported
   */
  static async isCameraAvailable() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return false;
    }

    if (!navigator.mediaDevices.enumerateDevices) {
      return true;
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.some((device) => device.kind === "videoinput");
    } catch (err) {
      console.warn("[QRScanner] Camera check failed:", err);
      // Some mobile browsers block enumerateDevices on insecure pages.
      // If getUserMedia exists, allow camera mode and show any errors later.
      return true;
    }
  }

  /**
   * Initialize camera scanning UI
   */
  async initCameraMode() {
    const qrPanel = document.getElementById("tab-qr");
    const dropZone = document.getElementById("dropZone");
    const cameraLabel = qrPanel.querySelector(".input-label");

    // Create camera scanner HTML
    const cameraUI = document.createElement("div");
    cameraUI.className = "camera-scanner-container";
    cameraUI.id = "cameraScannerUI";
    cameraUI.innerHTML = `
      <div class="camera-header">
        <div class="camera-title">
          <span class="camera-icon">📷</span>
          <div>
            <div class="camera-title-text">Camera Scanner</div>
            <div class="camera-subtitle">Scan a QR code directly with your phone camera</div>
          </div>
        </div>
        <button id="toggleCameraMode" class="toggle-mode-btn">
          📁 Upload instead
        </button>
      </div>

      <div class="camera-wrapper">
        <video id="qrVideo" class="qr-video" playsinline autoplay muted></video>
        <canvas id="qrCanvas" style="display: none;"></canvas>
        <div class="camera-overlay">
          <div class="scan-frame"></div>
          <p class="scan-status">Point camera at QR code</p>
        </div>
      </div>

      <div id="scannerControls" class="scanner-controls">
        <button id="startScanBtn" class="scan-btn">
          <span class="btn-text">Start Scanner</span>
        </button>
        <button id="stopScanBtn" class="scan-btn secondary" style="display: none;">
          <span class="btn-text">Stop Scanner</span>
        </button>
      </div>

      <div id="cameraError" class="error-banner" style="display: none;"></div>

      <div class="scanner-info">
        <p>💡 <strong>Tip:</strong> Ensure good lighting and hold the phone steady</p>
      </div>
    `;

    // Insert before drop zone
    dropZone.parentNode.insertBefore(cameraUI, dropZone);
    dropZone.style.display = "none";

    if (cameraLabel) {
      cameraLabel.textContent = "Scan QR Code with Camera";
    }

    // Setup event listeners
    document.getElementById("startScanBtn").addEventListener("click", () =>
      this.startScanning()
    );
    document.getElementById("stopScanBtn").addEventListener("click", () =>
      this.stopScanning()
    );
    document.getElementById("toggleCameraMode").addEventListener("click", () =>
      this.toggleUploadMode()
    );

    // Store references
    this.video = document.getElementById("qrVideo");
    this.canvas = document.getElementById("qrCanvas");
  }

  /**
   * Start camera and begin scanning
   */
  async startScanning() {
    try {
      const startBtn = document.getElementById("startScanBtn");
      const stopBtn = document.getElementById("stopScanBtn");
      const errorDiv = document.getElementById("cameraError");

      startBtn.disabled = true;

      // Request camera access
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      this.video.srcObject = this.stream;
      this.scannerActive = true;
      this.isScanning = true;

      startBtn.style.display = "none";
      stopBtn.style.display = "inline-block";
      errorDiv.style.display = "none";

      const status = document.querySelector(".scan-status");
      if (status) status.textContent = "Scanning for a QR code…";

      console.log("[QRScanner] Camera started");

      try {
        await this.video.play();
      } catch (playError) {
        console.warn("[QRScanner] video.play() failed:", playError);
      }

      // Begin scanning loop
      this.scanFrame();
    } catch (err) {
      const errorDiv = document.getElementById("cameraError");
      const startBtn = document.getElementById("startScanBtn");

      if (err.name === "NotAllowedError") {
        errorDiv.textContent = "📷 Camera permission denied. Please enable it.";
      } else if (err.name === "NotFoundError") {
        errorDiv.textContent = "❌ No camera found on this device.";
      } else if (err.name === "SecurityError" || err.name === "NotAllowedError") {
        errorDiv.textContent = "🔒 Camera blocked by browser security. Use HTTPS or a secure tunnel to enable camera scanning.";
      } else {
        errorDiv.textContent = `❌ Camera error: ${err.message}`;
      }

      errorDiv.style.display = "block";
      startBtn.disabled = false;
      console.error("[QRScanner] Error:", err);
    }
  }

  /**
   * Stop camera and scanning
   */
  stopScanning() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    this.isScanning = false;
    this.scannerActive = false;

    document.getElementById("startScanBtn").style.display = "inline-block";
    document.getElementById("stopScanBtn").style.display = "none";
    document.getElementById("startScanBtn").disabled = false;

    const status = document.querySelector(".scan-status");
    if (status) status.textContent = "Point camera at QR code";

    console.log("[QRScanner] Camera stopped");
  }

  /**
   * Main scanning loop - capture frames and decode QR
   */
  scanFrame() {
    const status = document.querySelector(".scan-status");

    if (!this.isScanning || this.video.readyState < this.video.HAVE_FUTURE_DATA) {
      if (status) status.textContent = "Waiting for camera feed…";
      requestAnimationFrame(() => this.scanFrame());
      return;
    }

    if (!window.jsQR) {
      const errorDiv = document.getElementById("cameraError");
      if (errorDiv) {
        errorDiv.textContent = "❌ QR decoder library not loaded. Refresh the page and try again.";
        errorDiv.style.display = "block";
      }
      console.error("[QRScanner] jsQR is not available");
      return;
    }

    try {
      // Draw video frame to canvas
      const context = this.canvas.getContext("2d");
      this.canvas.width = this.video.videoWidth || 640;
      this.canvas.height = this.video.videoHeight || 480;
      context.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);

      if (this.canvas.width === 0 || this.canvas.height === 0) {
        if (status) status.textContent = "Waiting for camera frame...";
        requestAnimationFrame(() => this.scanFrame());
        return;
      }

      // Extract image data
      const imageData = context.getImageData(
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );

      if (status) status.textContent = "Scanning the frame...";

      // Attempt QR decode using jsQR library (loaded externally)
      const code = window.jsQR(imageData.data, imageData.width, imageData.height);
      if (code) {
        if (status) status.textContent = "QR code found! Processing...";
        console.log("[QRScanner] QR Code detected:", code.data);
        this.handleQRDetected(code.data);
        this.stopScanning();
        return;
      }

      if (status) status.textContent = "Still scanning... hold steady";
    } catch (err) {
      console.error("[QRScanner] Frame processing error:", err);
      if (status) status.textContent = "Frame processing error. Try again.";
    }

    // Continue scanning
    requestAnimationFrame(() => this.scanFrame());
  }

  /**
   * Handle detected QR code
   */
  async handleQRDetected(qrData) {
    console.log("[QRScanner] Processing QR data:", qrData);

    try {
      // If it's a URL, scan it
      if (qrData.startsWith("http://") || qrData.startsWith("https://")) {
        await scanURL(qrData);
      } else {
        // Treat as raw QR data - could be custom format
        showResult({
          url: qrData,
          verdict: "UNKNOWN",
          trust_score: 50,
          risk_factors: ["QR code content is not a standard URL"],
          features: {},
        });
      }
    } catch (err) {
      showError(`Failed to process QR content: ${err.message}`);
    }
  }

  /**
   * Toggle between camera and upload mode
   */
  toggleUploadMode() {
    const cameraScannerUI = document.getElementById("cameraScannerUI");
    const dropZone = document.getElementById("dropZone");
    const cameraLabel = document.getElementById("tab-qr").querySelector(".input-label");

    if (dropZone.style.display === "none") {
      this.stopScanning();
      cameraScannerUI.style.display = "none";
      dropZone.style.display = "block";
      if (cameraLabel) {
        cameraLabel.textContent = "Upload QR Code Image";
      }
    } else {
      cameraScannerUI.style.display = "block";
      dropZone.style.display = "none";
      if (cameraLabel) {
        cameraLabel.textContent = "Scan QR Code with Camera";
      }
    }
  }
}

// Initialize after DOM is ready
document.addEventListener("DOMContentLoaded", async () => {
  const hasCameraSupport = await MobileQRScanner.isCameraAvailable();

  if (hasCameraSupport) {
    console.log("[QRScanner] Camera support detected");
    const scanner = new MobileQRScanner();
    scanner.initCameraMode();
    window.qrScanner = scanner; // Global reference
  } else {
    console.log("[QRScanner] No camera support, using file upload only");
  }
});
