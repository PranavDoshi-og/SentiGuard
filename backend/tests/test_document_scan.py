"""
Unit tests for SentiGuard Phase 3: Weaponized Document & PDF Inspection
"""

import os
import pytest
import pypdf
from fastapi.testclient import TestClient

import sys
sys.path.insert(0, os.path.abspath("backend"))

from main import app
from app.services.document_inspector import document_inspector_service

client = TestClient(app)


@pytest.fixture
def sample_clean_pdf(tmp_path):
    """Generate a valid, clean PDF document."""
    pdf_path = str(tmp_path / "clean_document.pdf")
    writer = pypdf.PdfWriter()
    writer.add_blank_page(width=300, height=300)
    writer.add_metadata({"/Title": "Legitimate Statement", "/Author": "Enterprise Security"})
    with open(pdf_path, "wb") as f:
        writer.write(f)
    return pdf_path


@pytest.fixture
def sample_invoice_scam_pdf(tmp_path):
    """Generate a PDF containing GeekSquad invoice scam patterns."""
    pdf_path = str(tmp_path / "invoice_scam.pdf")
    writer = pypdf.PdfWriter()
    writer.add_blank_page(width=400, height=500)
    # We can write text into the PDF stream or test heuristics directly
    writer.add_metadata({"/Title": "Geek Squad Renewal Invoice #84920"})
    with open(pdf_path, "wb") as f:
        writer.write(f)
    return pdf_path


def test_clean_pdf_inspection(sample_clean_pdf):
    result = document_inspector_service.inspect_pdf(sample_clean_pdf)
    assert result["verdict"] == "SAFE"
    assert result["trust_score"] >= 80.0
    assert result["structural_exploits"]["has_javascript"] is False
    assert result["structural_exploits"]["has_launch_action"] is False


def test_invoice_heuristics_logic():
    text = (
        "Geek Squad Protection Plan Renewal Invoice\n"
        "Your account will be debited for $499.99 within 24 hours.\n"
        "To dispute this charge or cancel subscription, call toll-free: 1-800-555-0199 immediately."
    )
    res = document_inspector_service._analyze_invoice_heuristics(text)
    assert res["is_invoice_phishing"] is True
    assert "Geek Squad" in res["detected_brands"]
    assert "499.99" in res["claimed_amounts"]
    assert len(res["support_phones"]) > 0


def test_api_document_scan_endpoint(sample_clean_pdf):
    with open(sample_clean_pdf, "rb") as f:
        response = client.post(
            "/api/scan/document",
            files={"file": ("clean_document.pdf", f, "application/pdf")}
        )

    assert response.status_code == 200
    data = response.json()
    assert "verdict" in data
    assert "trust_score" in data
    assert "document_metadata" in data
    assert "structural_exploits" in data
    assert "invoice_heuristics" in data
