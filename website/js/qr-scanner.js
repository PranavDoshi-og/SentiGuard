/**
 * SentiGuard — Optical QR Payload Detection Engine
 * High-performance WebRTC Camera scanner with optical HUD reticle
 * and hardware video frame decoding via jsQR.
 */

"use strict";

class MobileQRScanner {
  constructor() {
    this.video = document.getElementById("qrVideo");
    this.canvas = document.getElementById("qrCanvas");
    this.startBtn = document.getElementById("startScanBtn");
    this.stopBtn = document.getElementById("stopScanBtn");
    this.flipBtn = document.getElementById("switchCameraDirectionBtn");
    this.statusText = document.getElementById("cameraStatusText");
    this.errorBanner = document.getElementById("cameraErrorBanner");

    this.isScanning = false;
    this.stream = null;
    this.animationId = null;
    this.facingMode = "environment"; // default to rear camera on mobile
    this.availableCameras = [];

    this.bindEvents();
  }

  static async isCameraAvailable() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return false;
    }
    return true;
  }

  bindEvents() {
    if (this.startBtn) {
      this.startBtn.addEventListener("click", () => this.startScanning());
    }
    if (this.stopBtn) {
      this.stopBtn.addEventListener("click", () => this.stopScanning());
    }
    if (this.flipBtn) {
      this.flipBtn.addEventListener("click", () => this.toggleFacingMode());
    }
  }

  async checkMultipleCameras() {
    try {
      if (navigator.mediaDevices.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        this.availableCameras = devices.filter(d => d.kind === "videoinput");
        if (this.availableCameras.length > 1 && this.flipBtn) {
          this.flipBtn.style.display = "inline-flex";
        }
      }
    } catch (e) {
      console.warn("[QRScanner] Device enumeration not allowed", e);
    }
  }

  async startScanning() {
    try {
      this.hideError();
      this.startBtn.disabled = true;
      this.updateStatus("Requesting optical video stream access...");

      const constraints = {
        video: {
          facingMode: { ideal: this.facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.video.srcObject = this.stream;
      this.isScanning = true;

      this.startBtn.style.display = "none";
      this.stopBtn.style.display = "inline-flex";
      this.startBtn.disabled = false;

      this.updateStatus("Targeting QR matrix · Hold frame steady");

      await this.video.play().catch(err => {
        console.warn("[QRScanner] Autoplay rejected, continuing:", err);
      });

      await this.checkMultipleCameras();
      this.scanFrame();

    } catch (err) {
      this.startBtn.disabled = false;
      this.stopScanning();

      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        this.showError("Camera permissions denied by browser. Grant camera access to enable optical scanning.");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        this.showError("No video input devices found on this system. Switch to File Upload mode.");
      } else if (err.name === "SecurityError") {
        this.showError("Camera streams require a secure HTTPS context or localhost connection.");
      } else {
        this.showError(`Optical hardware error: ${err.message}`);
      }
    }
  }

  stopScanning() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    this.isScanning = false;

    if (this.startBtn) {
      this.startBtn.style.display = "inline-flex";
      this.startBtn.disabled = false;
    }
    if (this.stopBtn) {
      this.stopBtn.style.display = "none";
    }

    this.updateStatus("Standby · Click Start to initialize camera");
  }

  async toggleFacingMode() {
    this.facingMode = this.facingMode === "environment" ? "user" : "environment";
    if (this.isScanning) {
      this.stopScanning();
      await this.startScanning();
    }
  }

  scanFrame() {
    if (!this.isScanning) return;

    if (this.video.readyState >= this.video.HAVE_CURRENT_DATA) {
      if (!window.jsQR) {
        this.showError("Client-side jsQR library failed to initialize.");
        this.stopScanning();
        return;
      }

      const canvasCtx = this.canvas.getContext("2d", { willReadFrequently: true });
      this.canvas.width = this.video.videoWidth || 640;
      this.canvas.height = this.video.videoHeight || 480;

      if (this.canvas.width > 0 && this.canvas.height > 0) {
        canvasCtx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
        const imgData = canvasCtx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const code = window.jsQR(imgData.data, imgData.width, imgData.height);

        if (code && code.data) {
          this.updateStatus("QR payload acquired! Analyzing threat vectors...");
          const payload = code.data.trim();
          this.stopScanning();
          this.handlePayload(payload);
          return;
        }
      }
    }

    this.animationId = requestAnimationFrame(() => this.scanFrame());
  }

  async handlePayload(payload) {
    if (typeof scanURL === "function") {
      scanURL(payload);
    }
  }

  updateStatus(msg) {
    if (this.statusText) {
      this.statusText.textContent = msg;
    }
  }

  showError(msg) {
    if (this.errorBanner) {
      this.errorBanner.textContent = msg;
      this.errorBanner.style.display = "flex";
    }
  }

  hideError() {
    if (this.errorBanner) {
      this.errorBanner.style.display = "none";
    }
  }
}

// Global initialization
document.addEventListener("DOMContentLoaded", async () => {
  const hasSupport = await MobileQRScanner.isCameraAvailable();
  if (hasSupport) {
    window.qrScanner = new MobileQRScanner();
  } else {
    const startBtn = document.getElementById("startScanBtn");
    if (startBtn) {
      startBtn.disabled = true;
      startBtn.title = "Camera streaming unavailable in current environment";
    }
  }
});
