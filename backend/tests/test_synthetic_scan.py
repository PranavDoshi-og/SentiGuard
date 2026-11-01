"""
Unit tests for SentiGuard Phase 2: AI Deepfake & Synthetic Media Inspection
"""

import os
import pytest
import numpy as np
from PIL import Image, PngImagePlugin
from fastapi.testclient import TestClient

import sys
sys.path.insert(0, os.path.abspath("backend"))

from main import app
from app.services.synthetic_media_service import synthetic_media_service

client = TestClient(app)


@pytest.fixture
def ai_generated_sample_image(tmp_path):
    """Generate a sample PNG containing Stable Diffusion prompt metadata."""
    img_path = str(tmp_path / "synthetic_portrait.png")
    img = Image.new("RGB", (512, 512), color=(120, 140, 160))

    # Inject standard AI generator metadata
    png_info = PngImagePlugin.PngInfo()
    png_info.add_text("parameters", "photorealistic portrait of executive, 8k resolution\nNegative prompt: blurry, deformed\nSteps: 30, Sampler: DPM++ 2M Karras, Seed: 8392104")

    img.save(img_path, pnginfo=png_info)
    return img_path


@pytest.fixture
def authentic_mock_image(tmp_path):
    """Generate a sample image without AI signatures."""
    img_path = str(tmp_path / "camera_photo.jpg")
    # Natural gradient with noise
    arr = np.zeros((400, 600, 3), dtype=np.uint8)
    for c in range(3):
        arr[:, :, c] = np.tile(np.linspace(50, 200, 600, dtype=np.uint8), (400, 1))
    img = Image.fromarray(arr)
    img.save(img_path)
    return img_path


def test_synthetic_metadata_detection(ai_generated_sample_image):
    result = synthetic_media_service.inspect_image(ai_generated_sample_image)
    assert result["verdict"] == "AI_GENERATED"
    assert result["synthetic_probability"] >= 0.95
    assert result["provenance"]["is_definitive_ai_metadata"] is True
    assert len(result["provenance"]["detected_ai_signatures"]) > 0


def test_fft_frequency_analysis_structure(authentic_mock_image):
    result = synthetic_media_service.inspect_image(authentic_mock_image)
    freq = result["frequency_analysis"]
    assert "fft_anomaly_score" in freq
    assert "spectral_slope" in freq
    assert "fft_heatmap_base64" in freq
    assert freq["fft_heatmap_base64"].startswith("data:image/png;base64,")


def test_api_synthetic_scan_endpoint(ai_generated_sample_image):
    with open(ai_generated_sample_image, "rb") as f:
        response = client.post(
            "/api/scan/synthetic",
            files={"file": ("synthetic_portrait.png", f, "image/png")}
        )

    assert response.status_code == 200
    data = response.json()
    assert "verdict" in data
    assert "synthetic_probability" in data
    assert "authenticity_score" in data
    assert "frequency_analysis" in data
    assert "provenance" in data
    assert "visual_forensics" in data
