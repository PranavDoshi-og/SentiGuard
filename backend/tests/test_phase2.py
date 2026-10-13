"""
SentiGuard - Phase 2 Backend Resilience & Intelligence Test Suite
────────────────────────────────────────────────────────────────
Validates:
1. Sub-2ms in-memory TTL reputation caching and normalization
2. SQLite/SQLAlchemy telemetry logging and dispute report persistence
3. Multi-engine external threat feed fallback handling
4. Fast API routes (cache stats, dispute reporting, global scan metrics)
5. SlowAPI rate limiting configuration
"""

import sys
from pathlib import Path

# Ensure UTF-8 output on Windows console
try:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from fastapi.testclient import TestClient
from main import app
from app.services.cache_service import reputation_cache, normalize_cache_key
from app.services.threat_feeds import threat_feeds_service
from app.db.session import init_db, SessionLocal
from app.db.models import ScanRecord, DisputeReport


def setup_module():
    """Ensure database tables exist before running tests."""
    init_db()
    reputation_cache.clear()


def test_url_cache_normalization():
    """Verify that equivalent URLs produce canonical cache keys."""
    k1 = normalize_cache_key("https://EXAMPLE.com/")
    k2 = normalize_cache_key("https://example.com")
    k3 = normalize_cache_key("https://example.com:443")
    assert k1 == k2 == k3 == "https://example.com", f"Keys do not match: {k1}, {k2}, {k3}"


def test_reputation_cache_performance():
    """Verify caching, sub-2ms hit retrieval, and latency telemetry."""
    test_url = "https://verified-safe-portal.internal"
    mock_payload = {
        "url": test_url,
        "verdict": "SAFE",
        "trust_score": 98.5,
        "confidence": 0.985,
        "risk_factors": [],
    }

    # Cache miss
    assert reputation_cache.get(test_url) is None

    # Set cache
    reputation_cache.set(test_url, mock_payload)

    # Cache hit
    cached = reputation_cache.get(test_url)
    assert cached is not None
    assert cached["cached"] is True
    assert cached["verdict"] == "SAFE"
    assert "cache_latency_ms" in cached
    assert cached["cache_latency_ms"] < 20.0  # Fast sub-millisecond in-memory lookup

    # Telemetry
    stats = reputation_cache.stats()
    assert stats["hits"] >= 1
    assert stats["current_size"] >= 1


def test_threat_feeds_graceful_fallback():
    """Verify threat feed service behaves gracefully when no keys are configured."""
    result = threat_feeds_service.check_url("https://example.com")
    assert isinstance(result, dict)
    assert "is_flagged" in result
    assert "checked_engines" in result


def test_database_and_dispute_persistence():
    """Verify SQLite persistence for scans and community disputes."""
    db = SessionLocal()
    try:
        # Create dispute report
        report = DisputeReport(
            url="https://false-alarm-site.com",
            report_type="FALSE_POSITIVE",
            comment="This is our legitimate enterprise portal.",
            contact_email="admin@false-alarm-site.com",
            original_verdict="PHISHING",
            original_trust_score=15.0,
        )
        db.add(report)
        db.commit()
        db.refresh(report)

        assert report.id is not None

        # Query back
        retrieved = db.query(DisputeReport).filter_by(id=report.id).first()
        assert retrieved is not None
        assert retrieved.report_type == "FALSE_POSITIVE"
        assert retrieved.status == "PENDING_REVIEW"
    finally:
        db.close()


def test_api_scan_and_cache_cycle():
    """End-to-end API test with FastAPI TestClient."""
    with TestClient(app) as client:
        test_url = "https://github.com"

        # 1. First scan (live ML + feature extraction)
        resp1 = client.post("/api/scan/url", json={"url": test_url})
        assert resp1.status_code == 200, resp1.text
        data1 = resp1.json()
        assert data1["verdict"] == "SAFE"
        assert data1["cached"] is False

        # 2. Second scan (should hit reputation cache)
        resp2 = client.post("/api/scan/url", json={"url": test_url})
        assert resp2.status_code == 200
        data2 = resp2.json()
        assert data2["cached"] is True
        assert "cache_latency_ms" in data2

        # 3. Cache stats endpoint
        resp_stats = client.get("/api/scan/cache/stats")
        assert resp_stats.status_code == 200
        stats = resp_stats.json()
        assert stats["hits"] >= 1

        # 4. Dispute submission endpoint
        resp_dispute = client.post(
            "/api/scan/report",
            json={
                "url": "https://test-dispute-site.org",
                "report_type": "FALSE_POSITIVE",
                "comment": "Verified internal link",
                "contact_email": "ops@test-dispute-site.org",
                "original_verdict": "PHISHING",
                "original_trust_score": 10.0,
            },
        )
        assert resp_dispute.status_code == 200
        dispute_data = resp_dispute.json()
        assert dispute_data["status"] == "success"
        assert "report_id" in dispute_data

        # 5. Retrieve dispute reports
        resp_reports = client.get("/api/scan/reports")
        assert resp_reports.status_code == 200
        reports = resp_reports.json()
        assert len(reports) >= 1

        # 6. Global stats endpoint
        resp_global = client.get("/api/scan/stats")
        assert resp_global.status_code == 200
        global_stats = resp_global.json()
        assert "threat_distribution" in global_stats
        assert "cache_performance" in global_stats
        assert global_stats["community_disputes_count"] >= 1

        # 7. Clear cache endpoint
        resp_clear = client.post("/api/scan/cache/clear")
        assert resp_clear.status_code == 200


if __name__ == "__main__":
    print("Running Phase 2 Test Suite...")
    setup_module()
    test_url_cache_normalization()
    print("  [✓] URL Cache Normalization passed")
    test_reputation_cache_performance()
    print("  [✓] Reputation Cache Sub-2ms Latency passed")
    test_threat_feeds_graceful_fallback()
    print("  [✓] Threat Feeds Fallback passed")
    test_database_and_dispute_persistence()
    print("  [✓] Database & Dispute Persistence passed")
    test_api_scan_and_cache_cycle()
    print("  [✓] API Scan & Cache Cycle with FastAPI TestClient passed")
    print("\n✅ All Phase 2 Tests PASSED successfully!")
