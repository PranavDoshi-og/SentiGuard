import sys
sys.path.insert(0, 'backend')
from app.services.scan_service import ScanService
from app.services.inspector_service import inspector_service
from app.db.session import SessionLocal
from app.db.models import DisputeReport

s = ScanService()

# 1. Test scan_url includes Phase 4 fields
print("[TEST 1] Scan URL Phase 4 fields...")
res = s.scan_url("https://www.google.com")
assert "deep_inspector" in res, "Missing deep_inspector"
assert "redirect_trace" in res, "Missing redirect_trace"
assert "whois" in res["deep_inspector"], "Missing whois in deep_inspector"
assert "hosting_asn" in res["deep_inspector"], "Missing hosting_asn in deep_inspector"
print("  [OK] Scan response contains deep_inspector & redirect_trace")

# 2. Test inspector_service standalone
print("[TEST 2] Inspector service...")
inspect_res = inspector_service.inspect_full("http://google.com")
assert "whois" in inspect_res
assert "hosting_asn" in inspect_res
assert "redirect_trace" in inspect_res
assert inspect_res["redirect_trace"]["is_redirected"] is True
print(f"  [OK] Redirect hops: {inspect_res['redirect_trace']['hop_count']}")
print(f"  [OK] ASN: {inspect_res['hosting_asn'].get('asn')}")
print(f"  [OK] Registrar: {inspect_res['whois'].get('registrar')}")

# 3. Test dispute reporting persistence
print("[TEST 3] Dispute report recording...")
db = SessionLocal()
try:
    report = s.record_dispute_report(
        db=db,
        url="https://test-dispute-domain.example",
        report_type="FALSE_POSITIVE",
        comment="Test dispute verification",
        contact_email="tester@sentiguard.security",
        original_verdict="PHISHING",
        original_trust_score=15.0,
        client_ip="127.0.0.1"
    )
    assert report.id is not None
    assert report.report_type == "FALSE_POSITIVE"
    print(f"  [OK] Dispute report created successfully (ID: {report.id})")
finally:
    db.close()

print("\nALL PHASE 4 UNIT TESTS PASSED!")
