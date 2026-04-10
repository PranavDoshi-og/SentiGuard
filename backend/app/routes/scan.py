"""
SentiGuard - Scan Routes
Handles URL scanning and QR code scanning endpoints.
"""

import os
import shutil
import tempfile
from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse

from app.services.scan_service import ScanService
from app.utils.logger import setup_logger
from app.utils.validators import is_valid_url
from pydantic import BaseModel

router = APIRouter()
logger = setup_logger("sentiguard.routes.scan")
scan_service = ScanService()


# ─── Request / Response Models ────────────────────────────

class URLScanRequest(BaseModel):
    url: str

    class Config:
        schema_extra = {
            "example": {"url": "https://example.com/login?id=12345"}
        }


class ScanResponse(BaseModel):
    url: str
    verdict: str          # "SAFE" | "PHISHING"
    trust_score: float    # 0.0 – 100.0
    confidence: float     # 0.0 – 1.0
    risk_factors: list[str]
    features: dict


# ─── Endpoints ────────────────────────────────────────────

@router.post("/scan/url", response_model=ScanResponse)
async def scan_url(request: URLScanRequest):
    """
    Scan a URL for phishing. Returns verdict, trust score, and risk factors.
    """
    url = request.url.strip()

    if not url:
        raise HTTPException(status_code=400, detail="URL cannot be empty.")

    if not is_valid_url(url):
        raise HTTPException(status_code=400, detail="Invalid URL format.")

    try:
        result = scan_service.scan_url(url)
        logger.info(f"Scanned URL: {url} → {result['verdict']} (trust={result['trust_score']})")
        return result
    except Exception as e:
        logger.error(f"Error scanning URL '{url}': {e}")
        raise HTTPException(status_code=500, detail=f"Scan failed: {str(e)}")


@router.post("/scan/qr")
async def scan_qr(file: UploadFile = File(...)):
    """
    Upload a QR code image, extract the embedded URL, then scan it.
    """
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {file.content_type}. Use JPEG, PNG, or WebP."
        )

    # Save to temp file
    suffix = os.path.splitext(file.filename)[-1] or ".png"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    try:
        extracted_url = scan_service.extract_url_from_qr(tmp_path)

        if not extracted_url:
            raise HTTPException(status_code=422, detail="No URL found in QR code.")

        result = scan_service.scan_url(extracted_url)
        result["qr_extracted_url"] = extracted_url
        logger.info(f"QR Scan: extracted={extracted_url} → {result['verdict']}")
        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"QR scan error: {e}")
        raise HTTPException(status_code=500, detail=f"QR scan failed: {str(e)}")
    finally:
        os.unlink(tmp_path)
