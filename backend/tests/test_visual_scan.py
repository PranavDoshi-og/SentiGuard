"""
Unit tests for SentiGuard Phase 1: Visual Brand Phishing & OCR Inspection
"""

import os
import pytest
from PIL import Image, ImageDraw
from fastapi.testclient import TestClient

import sys
sys.path.insert(0, os.path.abspath("backend"))

from main import app
from app.services.visual_service import visual_service

client = TestClient(app)


@pytest.fixture
def sample_phishing_image(tmp_path):
    """Generate a synthetic phishing screenshot with brand keywords & extortion text."""
    img_path = str(tmp_path / "phishing_sample.png")
    img = Image.new("RGB", (600, 200), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    text = "Microsoft Security Warning: Your Account Suspended Immediately. Verify: https://microsoft-auth-login.xyz"
    draw.text((15, 60), text, fill=(0, 0, 0))
    img.save(img_path)
    return img_path


def test_visual_service_heuristics_and_brand_matching():
    # Test brand detection directly
    brand_res = visual_service._detect_brand_impersonation(
        extracted_text="Immediate action: Your PayPal Account will be terminated within 24 hours.",
        found_urls=["https://pay-pal-security-verification.com/login"],
        origin_url=None
    )
    assert "PayPal" in brand_res["detected_brands"]
    assert brand_res["is_impersonation"] is True
    assert len(brand_res["mismatched_brands"]) > 0

    # Test legitimate brand match
    legit_res = visual_service._detect_brand_impersonation(
        extracted_text="Welcome to your PayPal dashboard.",
        found_urls=["https://www.paypal.com/signin"],
        origin_url=None
    )
    assert "PayPal" in legit_res["detected_brands"]
    assert legit_res["is_impersonation"] is False


def test_visual_service_urgency_heuristics():
    urgency_res = visual_service._analyze_urgency_heuristics(
        "Your account suspended immediately. Legal action and arrest warrant will be issued."
    )
    assert urgency_res["urgency_score"] >= 40.0
    assert len(urgency_res["detected_cues"]) >= 2


def test_api_visual_scan_endpoint(sample_phishing_image):
    with open(sample_phishing_image, "rb") as f:
        response = client.post(
            "/api/scan/visual",
            files={"file": ("phishing_sample.png", f, "image/png")},
            data={"origin_url": "https://suspicious-origin.xyz"}
        )

    assert response.status_code == 200
    data = response.json()
    assert "verdict" in data
    assert "trust_score" in data
    assert "brand_analysis" in data
    assert "urgency_analysis" in data
    assert "extracted_entities" in data
