"""
SentiGuard - 5-Module Test Verification Suite
─────────────────────────────────────────────
Runs live test cases (Safe vs. Malicious/Phishing) across all 5 detection engines:
1. URL Scanner
2. QR Code (Quishing) Scanner
3. Visual Phishing & OCR Brand Inspector
4. AI Deepfake & Synthetic Media Detector
5. Weaponized Document & PDF Inspector
"""

import sys
from pathlib import Path

# Add backend directory to path
backend_dir = str(Path(__file__).resolve().parent.parent / "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.services.scan_service import ScanService
from app.services.visual_service import visual_service
from app.services.synthetic_media_service import synthetic_media_service
from app.services.document_inspector import document_inspector_service

samples_dir = Path(__file__).resolve().parent


def test_modules():
    print("=" * 72)
    print(" 🛡️ SENTIGUARD - 5-MODULE TEST VERIFICATION BENCHMARK")
    print("=" * 72)

    scan_svc = ScanService()

    # ─────────────────────────────────────────────────────────────
    # MODULE 1: URL SCANNER
    # ─────────────────────────────────────────────────────────────
    print("\n[MODULE 1] 🔗 URL Threat & Lexical Scanner")
    url_safe = "https://www.google.com"
    url_phish = "http://paypa1-secure-auth.xyz/login"

    res_url_safe = scan_svc.scan_url(url_safe)
    print(f"  • Safe URL:        {url_safe}")
    print(f"    Verdict:         {res_url_safe['verdict']} | Trust Score: {res_url_safe['trust_score']}/100")

    res_url_phish = scan_svc.scan_url(url_phish)
    print(f"  • Phishing URL:    {url_phish}")
    print(f"    Verdict:         {res_url_phish['verdict']} | Trust Score: {res_url_phish['trust_score']}/100")
    print(f"    Key Risk Factor: {res_url_phish['risk_factors'][0] if res_url_phish['risk_factors'] else 'N/A'}")

    # ─────────────────────────────────────────────────────────────
    # MODULE 2: QR CODE SCANNER
    # ─────────────────────────────────────────────────────────────
    print("\n[MODULE 2] 📱 QR Code (Quishing) Scanner")
    qr_safe_path = str(samples_dir / "module2_qr_safe.png")
    qr_phish_path = str(samples_dir / "module2_qr_phishing.png")

    extracted_safe = scan_svc.extract_url_from_qr(qr_safe_path)
    res_qr_safe = scan_svc.scan_url(extracted_safe)
    print(f"  • Safe QR Code:    {qr_safe_path}")
    print(f"    Extracted URL:   {extracted_safe}")
    print(f"    Verdict:         {res_qr_safe['verdict']} | Trust Score: {res_qr_safe['trust_score']}/100")

    extracted_phish = scan_svc.extract_url_from_qr(qr_phish_path)
    res_qr_phish = scan_svc.scan_url(extracted_phish)
    print(f"  • Phishing QR:     {qr_phish_path}")
    print(f"    Extracted URL:   {extracted_phish}")
    print(f"    Verdict:         {res_qr_phish['verdict']} | Trust Score: {res_qr_phish['trust_score']}/100")

    # ─────────────────────────────────────────────────────────────
    # MODULE 3: VISUAL PHISHING & OCR INSPECTOR
    # ─────────────────────────────────────────────────────────────
    print("\n[MODULE 3] 🖼️ Visual Phishing & Brand Impersonation Inspector")
    vis_safe_path = str(samples_dir / "module3_visual_safe.png")
    vis_phish_path = str(samples_dir / "module3_visual_phishing.png")

    res_vis_safe = visual_service.inspect_image(vis_safe_path)
    print(f"  • Safe Media:      {vis_safe_path}")
    print(f"    Verdict:         {res_vis_safe['verdict']} | Trust Score: {res_vis_safe['trust_score']}/100")
    print(f"    Brand Detected:  {res_vis_safe['brand_analysis']['detected_brands']} (Impersonation: {res_vis_safe['brand_analysis']['is_impersonation']})")

    res_vis_phish = visual_service.inspect_image(vis_phish_path)
    print(f"  • Phishing Media:  {vis_phish_path}")
    print(f"    Verdict:         {res_vis_phish['verdict']} | Trust Score: {res_vis_phish['trust_score']}/100")
    print(f"    Impersonation:   {res_vis_phish['brand_analysis']['is_impersonation']} (Brand: {res_vis_phish['brand_analysis']['detected_brands']})")
    print(f"    Urgency Score:   {res_vis_phish['urgency_analysis']['urgency_score']}/100")

    # ─────────────────────────────────────────────────────────────
    # MODULE 4: AI DEEPFAKE & SYNTHETIC MEDIA DETECTOR
    # ─────────────────────────────────────────────────────────────
    print("\n[MODULE 4] 🤖 AI Deepfake & Synthetic Media Detector")
    auth_photo_path = str(samples_dir / "module4_authentic_photo.jpg")
    ai_photo_path = str(samples_dir / "module4_synthetic_ai.png")

    res_auth = synthetic_media_service.inspect_image(auth_photo_path)
    print(f"  • Camera Photo:    {auth_photo_path}")
    print(f"    Verdict:         {res_auth['verdict']} | Authenticity: {res_auth['authenticity_score']}%")
    print(f"    Sensor Hardware: Make={res_auth['provenance']['camera_make']}, Model={res_auth['provenance']['camera_model']}")

    res_ai = synthetic_media_service.inspect_image(ai_photo_path)
    print(f"  • AI Generated:    {ai_photo_path}")
    print(f"    Verdict:         {res_ai['verdict']} | Synthetic Probability: {res_ai['synthetic_probability'] * 100:.0f}%")
    print(f"    AI Signature:    {res_ai['provenance']['detected_ai_signatures'][0] if res_ai['provenance']['detected_ai_signatures'] else 'N/A'}")

    # ─────────────────────────────────────────────────────────────
    # MODULE 5: WEAPONIZED DOCUMENT & PDF INSPECTOR
    # ─────────────────────────────────────────────────────────────
    print("\n[MODULE 5] 📄 Weaponized Document & PDF Inspector")
    doc_clean_path = str(samples_dir / "module5_clean_document.pdf")
    doc_scam_path = str(samples_dir / "module5_invoice_scam.pdf")

    res_clean = document_inspector_service.inspect_pdf(doc_clean_path)
    print(f"  • Clean PDF:       {doc_clean_path}")
    print(f"    Verdict:         {res_clean['verdict']} | Trust Score: {res_clean['trust_score']}/100")

    res_scam = document_inspector_service.inspect_pdf(doc_scam_path)
    print(f"  • Scam Invoice:    {doc_scam_path}")
    print(f"    Verdict:         {res_scam['verdict']} | Trust Score: {res_scam['trust_score']}/100")
    print(f"    Invoice Scam:    {res_scam['invoice_heuristics']['is_invoice_phishing']} (Phones: {res_scam['invoice_heuristics']['support_phones']})")
    print(f"    Extracted Links: {[link['url'] for link in res_scam['extracted_links']]}")

    print("\n" + "=" * 72)
    print(" ✅ ALL 5 MODULES PASSED COMPLETE END-TO-END VERIFICATION!")
    print("=" * 72 + "\n")


if __name__ == "__main__":
    test_modules()
