import sys
from pathlib import Path

# Add backend directory to path
backend_dir = str(Path(__file__).parent.parent)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.services.scan_service import ScanService
from app.services.inspector_service import inspector_service
from app.db.session import SessionLocal
from app.db.models import DisputeReport


def test_phase4_scan_deep_fields():
    """Verify scan_url includes Phase 4 deep inspection and redirect tracing fields."""
    service = ScanService()
    res = service.scan_url("https://www.google.com")
    assert "deep_inspector" in res, "Missing deep_inspector"
    assert "redirect_trace" in res, "Missing redirect_trace"
    assert "whois" in res["deep_inspector"], "Missing whois in deep_inspector"
    assert "hosting_asn" in res["deep_inspector"], "Missing hosting_asn in deep_inspector"


def test_phase4_inspector_service():
    """Verify standalone inspector_service parses WHOIS, ASN, and HTTP redirect chains."""
    inspect_res = inspector_service.inspect_full("http://google.com")
    assert "whois" in inspect_res
    assert "hosting_asn" in inspect_res
    assert "redirect_trace" in inspect_res
    assert inspect_res["redirect_trace"]["is_redirected"] is True
    assert inspect_res["redirect_trace"]["hop_count"] >= 1
    assert inspect_res["hosting_asn"].get("asn") is not None


def test_phase4_dispute_recording():
    """Verify dispute reporting records correctly in SQLite telemetry store."""
    service = ScanService()
    db = SessionLocal()
    try:
        report = service.record_dispute_report(
            db=db,
            url="https://test-dispute-domain.example",
            report_type="FALSE_POSITIVE",
            comment="Test dispute verification",
            contact_email="tester@sentiguard.security",
            original_verdict="PHISHING",
            original_trust_score=15.0,
            client_ip="127.0.0.1",
        )
        assert report.id is not None
        assert report.report_type == "FALSE_POSITIVE"
        assert report.status == "PENDING_REVIEW"
    finally:
        db.close()


if __name__ == "__main__":
    print("[TEST 1] Scan URL Phase 4 fields...")
    test_phase4_scan_deep_fields()
    print("  [OK] Scan response contains deep_inspector & redirect_trace")

    print("[TEST 2] Inspector service...")
    test_phase4_inspector_service()
    print("  [OK] Inspector service successfully resolved redirect chain & ASN")

    print("[TEST 3] Dispute report recording...")
    test_phase4_dispute_recording()
    print("  [OK] Dispute report persisted to SQLite")

    print("\nALL PHASE 4 UNIT TESTS PASSED!")
