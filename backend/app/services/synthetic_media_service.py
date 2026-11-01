"""
SentiGuard - AI Deepfake & Synthetic Media Inspection Service (Phase 2)
───────────────────────────────────────────────────────────────────────
Analyzes visual media (profile photos, executive portraits, KYC documents,
generated artwork) for generative AI indicators:
1. 2D FFT Spatial Frequency & Power Spectrum Analysis (radial roll-off & checkerboard peaks)
2. Metadata & Provenance Engine (EXIF camera hardware vs AI generator prompt chunks)
3. C2PA / Content Credentials & Synthetic digitalSourceType detection
4. Spatial texture & noise distribution uniformity analysis
5. Base64 FFT log-magnitude spectrogram visualization for frontend UI
"""

import os
import io
import re
import base64
from typing import Any
import numpy as np
from PIL import Image, ExifTags
import scipy.ndimage

from app.utils.logger import setup_logger

logger = setup_logger("sentiguard.services.synthetic_media")

# Known AI generator strings in image metadata / PNG chunks
AI_GENERATOR_KEYWORDS = [
    "stable diffusion", "midjourney", "dall-e", "dalle", "novelai",
    "comfyui", "automatic1111", "fooocus", "invokeai", "dreamstudio",
    "flux.1", "flux-schnell", "flux-dev", "runway", "pika", "sora",
    "sdxl", "sd-v1", "sd-v2", "civitai", "leonardo.ai"
]

# C2PA & Synthetic Media byte signatures
C2PA_SIGNATURES = [
    (b"c2pa.assertions.synthetic_media", "C2PA Synthetic Media Assertion"),
    (b"trainedAlgorithmicMedia", "IPTC/C2PA Trained Algorithmic Media"),
    (b"compositeSynthetic", "C2PA Composite Synthetic Media"),
    (b"digitalSourceType", "Digital Source Provenance Tag"),
    (b"urn:c2pa", "C2PA Specification Namespace"),
]


class SyntheticMediaInspectionService:
    def inspect_image(self, image_path: str) -> dict[str, Any]:
        """
        Executes full Phase 2 deepfake & synthetic media forensic analysis.
        """
        try:
            with Image.open(image_path) as raw_img:
                img_format = raw_img.format or "UNKNOWN"
                orig_width, orig_height = raw_img.size
                img_mode = raw_img.mode

                # Extract metadata chunks before converting
                raw_info = dict(raw_img.info)
                exif_data = self._extract_exif(raw_img)

                # Convert to RGB for spatial analysis
                rgb_img = raw_img.convert("RGB")
        except Exception as e:
            logger.error(f"Failed to read image for synthetic media analysis: {e}")
            raise ValueError(f"Invalid or corrupted image: {e}")

        # Read raw bytes for binary signature detection (C2PA / JUMBF)
        try:
            with open(image_path, "rb") as f:
                file_bytes = f.read(512 * 1024)  # First 512KB is enough for headers/metadata
        except Exception:
            file_bytes = b""

        # 1. Metadata & Provenance Analysis
        provenance = self._analyze_provenance(raw_info, exif_data, file_bytes, orig_width, orig_height)

        # 2. 2D FFT Spatial Frequency Analysis
        frequency_results = self._analyze_fft_frequency(rgb_img)

        # 3. Spatial Texture & Noise Uniformity Analysis
        texture_results = self._analyze_texture_and_noise(rgb_img)

        # 4. Synthesize Composite Synthetic Probability
        scoring = self._calculate_synthetic_probability(provenance, frequency_results, texture_results)

        return {
            "verdict": scoring["verdict"],
            "synthetic_probability": scoring["synthetic_probability"],
            "authenticity_score": scoring["authenticity_score"],
            "confidence": scoring["confidence"],
            "risk_factors": scoring["risk_factors"],
            "image_properties": {
                "format": img_format,
                "width": orig_width,
                "height": orig_height,
                "aspect_ratio": round(orig_width / max(1, orig_height), 2),
                "color_mode": img_mode
            },
            "provenance": provenance,
            "frequency_analysis": frequency_results,
            "visual_forensics": texture_results
        }

    def _extract_exif(self, img: Image.Image) -> dict[str, Any]:
        """Extracts standard human-readable EXIF tags from PIL image."""
        exif_dict = {}
        try:
            raw_exif = img.getexif()
            if raw_exif:
                for tag_id, value in raw_exif.items():
                    tag_name = ExifTags.TAGS.get(tag_id, str(tag_id))
                    # Convert bytes or un-serializable objects to string
                    if isinstance(value, bytes):
                        try:
                            value = value.decode("utf-8", errors="ignore").strip()
                        except Exception:
                            value = str(value)
                    exif_dict[tag_name] = value
        except Exception as e:
            logger.debug(f"EXIF extraction notice: {e}")
        return exif_dict

    def _analyze_provenance(
        self,
        info: dict[str, Any],
        exif: dict[str, Any],
        file_bytes: bytes,
        width: int,
        height: int
    ) -> dict[str, Any]:
        """Inspects camera hardware provenance, prompt metadata, and C2PA manifests."""
        detected_signatures = []
        is_definitive_ai = False
        prompt_extracted = None

        # A. Check PNG metadata chunks (Automatic1111 / ComfyUI / NovelAI)
        for key, val in info.items():
            str_val = str(val).lower()
            str_key = str(key).lower()

            if str_key in ["parameters", "prompt", "workflow"]:
                is_definitive_ai = True
                prompt_snippet = str(val)[:400]
                detected_signatures.append(f"AI Generation prompt parameter found in {key} metadata")
                prompt_extracted = prompt_snippet

            for kw in AI_GENERATOR_KEYWORDS:
                if kw in str_val or kw in str_key:
                    is_definitive_ai = True
                    detected_signatures.append(f"AI Generator signature identified: '{kw}' in {key}")

        # B. Check EXIF tags (UserComment, ImageDescription, Software)
        exif_str_repr = " ".join([f"{k}:{v}" for k, v in exif.items()]).lower()
        for kw in AI_GENERATOR_KEYWORDS:
            if kw in exif_str_repr:
                is_definitive_ai = True
                detected_signatures.append(f"AI Generator tag in EXIF metadata: '{kw}'")

        # C. Check C2PA / CAI digitalSourceType byte manifests
        c2pa_manifest_found = False
        for sig, desc in C2PA_SIGNATURES:
            if sig in file_bytes:
                detected_signatures.append(f"Provenance Manifest: {desc}")
                c2pa_manifest_found = True
                if b"synthetic" in sig.lower() or b"algorithmic" in sig.lower():
                    is_definitive_ai = True

        # D. Camera Hardware Profile Check
        has_camera_hardware = False
        camera_make = exif.get("Make")
        camera_model = exif.get("Model")
        focal_length = exif.get("FocalLength")
        iso_speed = exif.get("ISOSpeedRatings")

        if camera_make and camera_model:
            has_camera_hardware = True

        # E. Typical AI Resolution Multiples (e.g. 512x512, 768x768, 1024x1024)
        is_standard_diffusion_dim = (width, height) in [
            (512, 512), (768, 768), (1024, 1024),
            (512, 768), (768, 512), (832, 1216), (1216, 832)
        ]

        return {
            "has_camera_hardware": has_camera_hardware,
            "camera_make": str(camera_make) if camera_make else None,
            "camera_model": str(camera_model) if camera_model else None,
            "focal_length": str(focal_length) if focal_length else None,
            "iso_speed": str(iso_speed) if iso_speed else None,
            "is_definitive_ai_metadata": is_definitive_ai,
            "detected_ai_signatures": list(set(detected_signatures)),
            "extracted_prompt_snippet": prompt_extracted,
            "c2pa_manifest_detected": c2pa_manifest_found,
            "is_standard_diffusion_dim": is_standard_diffusion_dim,
            "exif_tag_count": len(exif)
        }

    def _analyze_fft_frequency(self, img: Image.Image) -> dict[str, Any]:
        """
        Computes 2D Fast Fourier Transform (FFT), radial power spectrum roll-off,
        high-frequency energy proportion, and generates a base64 visual power spectrum.
        """
        # Standardize size for consistent spatial frequency analysis
        norm_img = img.resize((256, 256), Image.Resampling.BILINEAR)
        gray = np.array(norm_img.convert("L"), dtype=np.float32)

        # 2D FFT with shifted DC component to center
        fft = np.fft.fft2(gray)
        fft_shift = np.fft.fftshift(fft)
        magnitude = np.abs(fft_shift)
        log_mag = np.log(magnitude + 1.0)

        # 1. Radial Power Distribution (Field's 1/f Natural Scene Statistics)
        y, x = np.indices(gray.shape)
        center = (128, 128)
        r = np.hypot(x - center[1], y - center[0]).astype(int)
        max_r = 120

        tbin = np.bincount(r.ravel(), log_mag.ravel())
        nr = np.bincount(r.ravel())
        radial_profile = tbin[:max_r] / np.maximum(nr[:max_r], 1)

        # Fit spectral slope in middle-to-high frequencies (radii 15 to 90)
        radii_fit = np.arange(15, 90)
        log_radii = np.log(radii_fit)
        log_energies = radial_profile[15:90]

        # Natural photographic images have slope ~ -1.5 to -2.3
        slope, _ = np.polyfit(log_radii, log_energies, 1)
        slope_val = float(round(slope, 3))

        # 2. High-Frequency Energy Ratio (HF / Total)
        total_energy = float(np.sum(log_mag))
        high_freq_mask = (r > 64)
        high_freq_energy = float(np.sum(log_mag[high_freq_mask]))
        hf_ratio = round((high_freq_energy / max(1.0, total_energy)) * 100, 2)

        # 3. Periodic Grid / Checkerboard Spikes
        smoothed = scipy.ndimage.gaussian_filter1d(radial_profile, sigma=3)
        residual = np.abs(radial_profile[10:] - smoothed[10:])
        max_peak = float(np.max(residual)) if len(residual) > 0 else 0.0
        has_checkerboard_artifacts = bool(max_peak > 0.45)

        # 4. Anomaly score: Natural slope is around -0.6 to -1.3 in log-magnitude
        # Diffusion/GAN upsamplers either over-smooth (slope too steep) or leave high-frequency grid plateaus (slope too flat)
        slope_deviation = abs(slope_val - (-0.85))
        fft_anomaly_score = min(100.0, round((slope_deviation * 60.0) + (max_peak * 45.0), 1))

        # 5. Base64 Heatmap for UI Visualization (128x128)
        norm_preview = ((log_mag - log_mag.min()) / (log_mag.max() - log_mag.min() + 1e-8) * 255).astype(np.uint8)
        thumb = Image.fromarray(norm_preview).resize((128, 128), Image.Resampling.NEAREST)
        buf = io.BytesIO()
        thumb.save(buf, format="PNG")
        fft_heatmap_b64 = base64.b64encode(buf.getvalue()).decode("utf-8")

        return {
            "fft_anomaly_score": fft_anomaly_score,
            "spectral_slope": slope_val,
            "high_frequency_ratio": hf_ratio,
            "periodic_artifacts_detected": has_checkerboard_artifacts,
            "max_spectral_peak": round(max_peak, 3),
            "fft_heatmap_base64": f"data:image/png;base64,{fft_heatmap_b64}"
        }

    def _analyze_texture_and_noise(self, img: Image.Image) -> dict[str, Any]:
        """
        Evaluates spatial Laplacian sharpness and noise distribution uniformity across tiles.
        """
        gray = np.array(img.convert("L"), dtype=np.float32)

        # 1. Laplacian Variance (edge gradient focus metric)
        laplacian = scipy.ndimage.laplace(gray)
        laplacian_var = float(np.var(laplacian))

        # 2. Local Noise Tile Uniformity
        # Authentic camera images have heterogeneous sensor noise varying with illuminance.
        # AI images typically feature synthetic uniform noise or over-smoothed planar surfaces.
        h, w = gray.shape
        tile_size = 32
        stds = []
        for i in range(0, h - tile_size, tile_size):
            for j in range(0, w - tile_size, tile_size):
                tile = gray[i:i + tile_size, j:j + tile_size]
                stds.append(float(np.std(tile)))

        tile_var = float(np.var(stds)) if stds else 0.0
        # Low tile variance indicates unnatural smoothness/uniformity
        noise_uniformity_score = min(100.0, max(0.0, round(100.0 - (tile_var / 8.0), 1)))

        return {
            "laplacian_variance": round(laplacian_var, 1),
            "noise_uniformity_score": noise_uniformity_score,
            "tile_variance": round(tile_var, 2)
        }

    def _calculate_synthetic_probability(
        self,
        prov: dict[str, Any],
        freq: dict[str, Any],
        texture: dict[str, Any]
    ) -> dict[str, Any]:
        """
        Ensemble formula synthesizing probability (0.0 to 1.0) and explainable risk factors.
        """
        risk_factors = []

        # A. Immediate trigger on definitive AI generator signature/prompt
        if prov["is_definitive_ai_metadata"]:
            for sig in prov["detected_ai_signatures"]:
                risk_factors.append(f"Definitive AI Generator Marker: {sig}")
            return {
                "verdict": "AI_GENERATED",
                "synthetic_probability": 0.99,
                "authenticity_score": 1.0,
                "confidence": 0.98,
                "risk_factors": risk_factors
            }

        # B. Weighted heuristic ensemble
        synth_score = 0.0

        # Frequency component (0 - 45 pts)
        fft_score = freq["fft_anomaly_score"]
        if fft_score > 60.0:
            synth_score += 35.0
            risk_factors.append(f"Abnormal 2D Fourier spectral roll-off (Spectral Slope: {freq['spectral_slope']})")
        elif fft_score > 40.0:
            synth_score += 20.0

        if freq["periodic_artifacts_detected"]:
            synth_score += 20.0
            risk_factors.append("Periodic checkerboard frequency spikes detected (characteristic of neural upsampling filters)")

        # Hardware EXIF component (0 - 25 pts)
        if not prov["has_camera_hardware"]:
            synth_score += 15.0
            if prov["exif_tag_count"] == 0:
                risk_factors.append("Zero camera sensor hardware metadata (no Make, Model, ISO, or Lens profile)")
        else:
            # Genuine camera EXIF provides a strong authenticity credit
            synth_score -= 25.0

        # AI Aspect Ratio / Resolution match (0 - 10 pts)
        if prov["is_standard_diffusion_dim"]:
            synth_score += 10.0
            risk_factors.append("Native generative AI canvas dimension match (e.g. 512x512 / 1024x1024)")

        # Noise uniformity component (0 - 20 pts)
        if texture["noise_uniformity_score"] > 85.0:
            synth_score += 15.0
            risk_factors.append("Unnaturally uniform spatial noise distribution lacking sensor Poisson variance")

        # Clamp synthetic probability
        synth_score = max(5.0, min(95.0, synth_score))
        prob = round(synth_score / 100.0, 2)
        auth_score = round(100.0 - (prob * 100.0), 1)

        if prob >= 0.65:
            verdict = "AI_GENERATED"
            conf = 0.88
        elif prob >= 0.40:
            verdict = "SUSPICIOUS"
            conf = 0.72
        else:
            verdict = "AUTHENTIC_MEDIA"
            conf = 0.84

        if not risk_factors:
            risk_factors.append("Spectral frequency and texture distribution align with authentic photographic media.")

        return {
            "verdict": verdict,
            "synthetic_probability": prob,
            "authenticity_score": auth_score,
            "confidence": conf,
            "risk_factors": risk_factors
        }


# Singleton instance
synthetic_media_service = SyntheticMediaInspectionService()
