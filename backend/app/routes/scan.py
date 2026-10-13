"""
SentiGuard - Scan & Intelligence Routes (Phase 2)
─────────────────────────────────────────────────
Provides URL & QR code scanning, reputation cache management,
SlowAPI rate limiting, community dispute reporting, and telemetry statistics.
"""

import os
import shutil
import tempfile
from typing import Any
from fastapi import APIRouter, HTTPException, UploadFile, File, Request, Response, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from app.services.scan_service import ScanService
from app.services.cache_service import reputation_cache
from app.utils.logger import setup_logger
from app.utils.validators import is_valid_url
from app.utils.limiter import limiter, get_real_client_ip
from app.db.session import get_db, SessionLocal
from app.db.models import ScanRecord, DisputeReport

router = APIRouter()
logger = setup_logger("sentiguard.routes.scan")
scan_service = ScanService()


# ─── Request / Response Schemas ───────────────────────────

class URLScanRequest(BaseModel):
    url: str
    bypass_cache: bool = False

    model_config = {
        "json_schema_extra": {
            "example": {
                "url": "https://example.com/login?id=12345",
                "bypass_cache": False
            }
        }
    }


class ScanResponse(BaseModel):
    url: str
    verdict: str                  # "SAFE" | "PHISHING"
    trust_score: float            # 0.0 – 100.0
    confidence: float             # 0.0 – 1.0
    risk_factors: list[str]
    features: dict[str, Any]
    shap_explanations: list[dict[str, Any]] = []
    model_type: str = "ML Classifier"
    network_profile: dict[str, Any] = {}
    external_intelligence: dict[str, Any] = {}
    cached: bool = False
    cache_latency_ms: float | None = None
    qr_extracted_url: str | None = None


class DisputeReportRequest(BaseModel):
    url: str
    report_type: str = Field(..., description="FALSE_POSITIVE | FALSE_NEGATIVE | NEW_THREAT")
    comment: str | None = Field(default=None, max_length=2000)
    contact_email: str | None = Field(default=None, max_length=256)
    original_verdict: str | None = None
    original_trust_score: float | None = None

    model_config = {
        "json_schema_extra": {
            "example": {
                "url": "https://my-internal-company-portal.local",
                "report_type": "FALSE_POSITIVE",
                "comment": "Internal enterprise portal erroneously classified as phishing.",
                "contact_email": "security@enterprise.com",
                "original_verdict": "PHISHING",
                "original_trust_score": 12.5
            }
        }
    }


class DisputeReportResponse(BaseModel):
    status: str
    message: str
    report_id: int
    url: str
    report_type: str


# ─── Background Persistence Task ───────────────────────────

def persist_scan_background(result: dict[str, Any], client_ip: str | None):
    """Background task to store scan metrics without slowing API response."""
    db = SessionLocal()
    try:
        scan_service.record_scan_telemetry(db, result, client_ip)
    finally:
        db.close()


# ─── Endpoints ────────────────────────────────────────────

@router.post("/scan/url", response_model=ScanResponse)
@limiter.limit("60/minute")
async def scan_url(
    request: Request,
    response: Response,
    payload: URLScanRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """
    Scan a URL for phishing threats.
    Protected by 60 scans/min rate limiter and sub-2ms reputation cache.
    """
    url = payload.url.strip()

    if not url:
        raise HTTPException(status_code=400, detail="URL cannot be empty.")

    if not is_valid_url(url):
        raise HTTPException(status_code=400, detail="Invalid URL format.")

    client_ip = get_real_client_ip(request)

    try:
        result = scan_service.scan_url(url, bypass_cache=payload.bypass_cache)

        # Log asynchronously to database
        background_tasks.add_task(persist_scan_background, result, client_ip)

        logger.info(
            f"Scan: {url} -> {result['verdict']} "
            f"(trust={result['trust_score']}, cached={result.get('cached', False)})"
        )
        return result

    except Exception as e:
        logger.error(f"Error scanning URL '{url}': {e}")
        raise HTTPException(status_code=500, detail=f"Scan failed: {str(e)}")


@router.post("/scan/qr", response_model=ScanResponse)
@limiter.limit("30/minute")
async def scan_qr(
    request: Request,
    response: Response,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """
    Upload a QR code image, extract embedded URL, and perform security scan.
    """
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {file.content_type}. Use JPEG, PNG, or WebP."
        )

    suffix = os.path.splitext(file.filename or "")[-1] or ".png"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    try:
        extracted_url = scan_service.extract_url_from_qr(tmp_path)
        if not extracted_url:
            raise HTTPException(status_code=422, detail="No readable URL found in uploaded QR code.")

        client_ip = get_real_client_ip(request)
        result = scan_service.scan_url(extracted_url)
        result["qr_extracted_url"] = extracted_url

        # Log asynchronously to database
        background_tasks.add_task(persist_scan_background, result, client_ip)

        logger.info(f"QR Scan: extracted={extracted_url} -> {result['verdict']}")
        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"QR scan error: {e}")
        raise HTTPException(status_code=500, detail=f"QR scan failed: {str(e)}")
    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)


@router.post("/scan/report", response_model=DisputeReportResponse)
@limiter.limit("20/minute")
async def report_dispute(
    request: Request,
    response: Response,
    report: DisputeReportRequest,
    db: Session = Depends(get_db),
):
    """
    Submit a false-positive or false-negative dispute report.
    Feeds into community threat review and automated ML retraining dataset.
    """
    url = report.url.strip()
    if not url or not is_valid_url(url):
        raise HTTPException(status_code=400, detail="Invalid URL for dispute report.")

    report_type = report.report_type.strip().upper()
    if report_type not in ["FALSE_POSITIVE", "FALSE_NEGATIVE", "NEW_THREAT"]:
        raise HTTPException(
            status_code=400,
            detail="report_type must be one of: FALSE_POSITIVE, FALSE_NEGATIVE, NEW_THREAT"
        )

    client_ip = get_real_client_ip(request)

    record = scan_service.record_dispute_report(
        db=db,
        url=url,
        report_type=report_type,
        comment=report.comment,
        contact_email=report.contact_email,
        original_verdict=report.original_verdict,
        original_trust_score=report.original_trust_score,
        client_ip=client_ip,
    )

    return DisputeReportResponse(
        status="success",
        message="Dispute report successfully recorded for threat intelligence review.",
        report_id=record.id,
        url=record.url,
        report_type=record.report_type,
    )


@router.get("/scan/cache/stats")
async def get_cache_stats():
    """Retrieve reputation cache performance metrics, hit ratios, and telemetry."""
    return reputation_cache.stats()


@router.post("/scan/cache/clear")
async def clear_cache():
    """Purge all entries from the reputation cache."""
    reputation_cache.clear()
    return {"status": "success", "message": "Reputation cache cleared."}


@router.get("/scan/stats")
async def get_scan_statistics(db: Session = Depends(get_db)):
    """
    Returns high-level scanning volume, threat distribution,
    and community dispute telemetry.
    """
    total_scans = db.query(ScanRecord).count()
    phishing_count = db.query(ScanRecord).filter(ScanRecord.verdict == "PHISHING").count()
    safe_count = db.query(ScanRecord).filter(ScanRecord.verdict == "SAFE").count()
    disputes_count = db.query(DisputeReport).count()

    cache_telemetry = reputation_cache.stats()

    return {
        "total_scans_logged": total_scans,
        "threat_distribution": {
            "phishing": phishing_count,
            "safe": safe_count,
            "phishing_percentage": round((phishing_count / total_scans * 100.0), 1) if total_scans > 0 else 0.0,
        },
        "community_disputes_count": disputes_count,
        "cache_performance": cache_telemetry,
    }


@router.get("/scan/reports")
async def get_recent_reports(limit: int = 50, db: Session = Depends(get_db)):
    """Retrieve recent community dispute reports for review and retraining."""
    limit = min(max(1, limit), 200)
    reports = db.query(DisputeReport).order_by(DisputeReport.id.desc()).limit(limit).all()
    return [
        {
            "id": r.id,
            "url": r.url,
            "report_type": r.report_type,
            "comment": r.comment,
            "contact_email": r.contact_email,
            "original_verdict": r.original_verdict,
            "original_trust_score": r.original_trust_score,
            "status": r.status,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in reports
    ]
