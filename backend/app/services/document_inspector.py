"""
SentiGuard - Weaponized Document & PDF Inspection Service (Phase 3)
───────────────────────────────────────────────────────────────────
Inspects uploaded PDF files and invoice attachments for:
1. Low-level structural exploits (/JavaScript, /Launch, /OpenAction, /EmbeddedFiles, /SubmitForm)
2. Embedded hyperlink extraction from interactive annotations and streams
3. Automated threat chaining into SentiGuard's URL intelligence engine
4. Invoice phishing & callback extortion heuristics (fake charges, toll-free lures)
"""

import os
import re
from typing import Any
import pypdf
from pypdf.generic import IndirectObject

from app.utils.logger import setup_logger

logger = setup_logger("sentiguard.services.document")

# Known scam invoice brands
INVOICE_BRANDS = [
    "Geek Squad", "Best Buy", "Norton", "Norton 360", "McAfee",
    "PayPal", "Amazon", "Apple", "Microsoft 365", "Crypto.com",
    "Coinbase", "MetaMask", "Invoice", "Renewal Receipt"
]

# Patterns for fake invoice lures
INVOICE_AMOUNT_PATTERN = r"(?:\$|USD\s*|CAD\s*|GBP\s*|EUR\s*|€)\s*(\d{1,4}(?:,\d{3})*(?:\.\d{2})?)"
PHONE_PATTERN = r"(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}"
DISPUTE_CANCELLATION_PATTERN = r"(?i)\b(?:cancel\s+(?:subscription|order|charge|auto[\s-]renewal)|dispute\s+this\s+charge|call\s+(?:us|helpdesk|support|toll[\s-]free)|within\s+24\s+hours|auto[\s-]debit(?:ed)?)\b"


class DocumentInspectionService:
    def __init__(self):
        self._scan_service = None

    @property
    def scan_service(self):
        if self._scan_service is None:
            from app.services.scan_service import ScanService
            self._scan_service = ScanService()
        return self._scan_service

    def inspect_pdf(self, pdf_path: str) -> dict[str, Any]:
        """
        Parses a PDF document for structural exploits, dangerous interactive actions,
        embedded phishing links, and fraudulent invoice templates.
        """
        try:
            reader = pypdf.PdfReader(pdf_path)
            num_pages = len(reader.pages)
            is_encrypted = reader.is_encrypted
        except Exception as e:
            logger.error(f"Failed to parse PDF document {pdf_path}: {e}")
            raise ValueError(f"Corrupted or invalid PDF file: {e}")

        # Extract Document Metadata
        metadata = self._extract_metadata(reader, num_pages, is_encrypted)

        # Structural Exploit & Action Analysis
        structural = self._analyze_structural_exploits(reader)

        # Extract Embedded Hyperlinks from Annotations & Page Text
        links_data = self._extract_links(reader)
        extracted_urls = links_data["urls"]

        # Extract Text for Invoice / Scam Heuristics
        text_content = links_data["extracted_text"]
        invoice_heuristics = self._analyze_invoice_heuristics(text_content)

        # Chain Extracted URLs to SentiGuard URL Intelligence
        url_scan_results = []
        highest_url_threat = 0.0

        for target_url in extracted_urls[:4]:  # Scan top 4 links
            try:
                scan_res = self.scan_service.scan_url(target_url)
                url_scan_results.append({
                    "url": target_url,
                    "verdict": scan_res.get("verdict", "UNKNOWN"),
                    "trust_score": scan_res.get("trust_score", 50.0),
                    "confidence": scan_res.get("confidence", 0.0),
                    "risk_factors": scan_res.get("risk_factors", [])[:3]
                })
                if scan_res.get("verdict") == "PHISHING":
                    highest_url_threat = max(highest_url_threat, 1.0)
                elif scan_res.get("trust_score", 100.0) < 50.0:
                    highest_url_threat = max(highest_url_threat, 0.7)
            except Exception as e:
                logger.warning(f"Failed to scan PDF embedded link '{target_url}': {e}")
                url_scan_results.append({
                    "url": target_url,
                    "verdict": "ERROR",
                    "error": str(e)
                })

        # Synthesize Risk Score & Verdict
        scoring = self._calculate_risk(structural, invoice_heuristics, highest_url_threat, is_encrypted)

        return {
            "verdict": scoring["verdict"],
            "trust_score": scoring["trust_score"],
            "confidence": scoring["confidence"],
            "risk_factors": scoring["risk_factors"],
            "document_metadata": metadata,
            "structural_exploits": structural,
            "invoice_heuristics": invoice_heuristics,
            "extracted_links": url_scan_results,
            "text_preview": text_content[:1500] if text_content else ""
        }

    def _extract_metadata(self, reader: pypdf.PdfReader, num_pages: int, is_encrypted: bool) -> dict[str, Any]:
        """Extracts standard PDF document metadata dictionary."""
        info = reader.metadata or {}
        return {
            "page_count": num_pages,
            "is_encrypted": is_encrypted,
            "title": str(info.get("/Title", "")).strip() or "Untitled",
            "author": str(info.get("/Author", "")).strip() or "Unknown",
            "creator": str(info.get("/Creator", "")).strip() or "Unknown",
            "producer": str(info.get("/Producer", "")).strip() or "Unknown",
            "creation_date": str(info.get("/CreationDate", "")).strip() or None
        }

    def _analyze_structural_exploits(self, reader: pypdf.PdfReader) -> dict[str, Any]:
        """
        Inspects PDF root dictionary, catalog, and names tree for dangerous actions:
        - /JavaScript / /JS: executable scripting
        - /Launch: OS command execution
        - /OpenAction / /AA: automatic execution on open
        - /EmbeddedFiles: hidden file drops
        - /SubmitForm: credential exfiltration
        """
        has_js = False
        has_launch = False
        has_open_action = False
        has_embedded_files = False
        has_submit_form = False
        detected_exploits = []

        try:
            trailer = reader.trailer
            root = trailer.get("/Root", {})
            if isinstance(root, IndirectObject):
                root = root.get_object()

            # 1. Check for /OpenAction or /AA in catalog
            if "/OpenAction" in root:
                has_open_action = True
                detected_exploits.append("/OpenAction trigger: Executes actions automatically when opened")

            if "/AA" in root:
                has_open_action = True
                detected_exploits.append("/AA (Additional Action): Triggers automated behavior on viewer events")

            # 2. Check for Embedded JavaScript in /Names
            names = root.get("/Names", {})
            if isinstance(names, IndirectObject):
                names = names.get_object()

            if isinstance(names, dict) and "/JavaScript" in names:
                has_js = True
                detected_exploits.append("Embedded /JavaScript namespace identified in PDF root catalog")

            # 3. Check for /EmbeddedFiles
            if isinstance(names, dict) and "/EmbeddedFiles" in names:
                has_embedded_files = True
                detected_exploits.append("Hidden /EmbeddedFiles detected (possible file drop or dropper container)")

            # 4. Check for /AcroForm scripting & /SubmitForm
            acro_form = root.get("/AcroForm", {})
            if isinstance(acro_form, IndirectObject):
                acro_form = acro_form.get_object()

            if isinstance(acro_form, dict):
                if "/SubmitForm" in str(acro_form):
                    has_submit_form = True
                    detected_exploits.append("/SubmitForm action: Exfiltrates user credentials to remote server")
                if "/JS" in acro_form or "/JavaScript" in acro_form:
                    has_js = True
                    detected_exploits.append("Interactive form field contains executable JavaScript")

            # 5. Page-level inspection for /Launch, /JS, and /AA
            for idx, page in enumerate(reader.pages):
                page_obj = page.get_object() if isinstance(page, IndirectObject) else page
                if "/AA" in page_obj:
                    detected_exploits.append(f"Page {idx+1}: /AA event trigger")

                annots = page_obj.get("/Annots", [])
                if isinstance(annots, IndirectObject):
                    annots = annots.get_object()

                if isinstance(annots, list):
                    for annot in annots:
                        annot_obj = annot.get_object() if isinstance(annot, IndirectObject) else annot
                        if isinstance(annot_obj, dict):
                            action = annot_obj.get("/A", {})
                            if isinstance(action, IndirectObject):
                                action = action.get_object()

                            action_s = str(action.get("/S", ""))
                            if action_s == "/Launch":
                                has_launch = True
                                detected_exploits.append(f"Page {idx+1}: /Launch action attempting external command execution")
                            elif action_s in ["/JavaScript", "/JS"]:
                                has_js = True
                                detected_exploits.append(f"Page {idx+1}: Annotation contains embedded /JavaScript")

        except Exception as e:
            logger.warning(f"Error inspecting PDF structural dictionaries: {e}")

        return {
            "has_javascript": has_js,
            "has_launch_action": has_launch,
            "has_open_action": has_open_action,
            "has_embedded_files": has_embedded_files,
            "has_submit_form": has_submit_form,
            "detected_exploits": list(set(detected_exploits))
        }

    def _extract_links(self, reader: pypdf.PdfReader) -> dict[str, Any]:
        """Extracts clickable URLs from annotations and scans page text."""
        urls = []
        full_text = []

        url_regex = r"(?:https?:\/\/|www\.)[a-zA-Z0-9_\-\.]+(?:\.[a-zA-Z]{2,})[^\s]*|[a-zA-Z0-9_\-]+\.(?:com|org|net|io|xyz|info|top|cc|ru|live|app|biz|online)(?:\/[^\s]*)?"

        for page in reader.pages:
            # 1. Extract text
            try:
                txt = page.extract_text() or ""
                if txt:
                    full_text.append(txt)
                    # Search text for plain-text links
                    for match in re.findall(url_regex, txt, re.IGNORECASE):
                        cleaned = match.rstrip(".,;)\"'")
                        if not cleaned.startswith("http://") and not cleaned.startswith("https://"):
                            cleaned = "https://" + cleaned
                        if cleaned not in urls:
                            urls.append(cleaned)
            except Exception:
                pass

            # 2. Extract clickable link annotations
            try:
                annots = page.get("/Annots", [])
                if isinstance(annots, IndirectObject):
                    annots = annots.get_object()

                if isinstance(annots, list):
                    for annot in annots:
                        annot_obj = annot.get_object() if isinstance(annot, IndirectObject) else annot
                        if isinstance(annot_obj, dict):
                            action = annot_obj.get("/A", {})
                            if isinstance(action, IndirectObject):
                                action = action.get_object()
                            if isinstance(action, dict):
                                uri = action.get("/URI", "")
                                if uri:
                                    uri_str = str(uri).strip()
                                    if uri_str not in urls:
                                        urls.append(uri_str)
            except Exception:
                pass

        return {
            "urls": urls,
            "extracted_text": "\n".join(full_text)
        }

    def _analyze_invoice_heuristics(self, text: str) -> dict[str, Any]:
        """Scans extracted document text for fake invoice scams & callback phishing patterns."""
        if not text:
            return {
                "is_invoice_phishing": False,
                "detected_brands": [],
                "claimed_amounts": [],
                "support_phones": [],
                "detected_lures": []
            }

        lower = text.lower()
        detected_brands = [b for b in INVOICE_BRANDS if b.lower() in lower]

        # Extract amounts
        amounts = list(dict.fromkeys(re.findall(INVOICE_AMOUNT_PATTERN, text)))

        # Extract phone numbers
        phone_matches = re.findall(PHONE_PATTERN, text)
        phones = list(dict.fromkeys([p.strip() for p in phone_matches if len(re.sub(r"\D", "", p)) >= 10]))

        # Extract urgency / cancellation lures
        lures = list(dict.fromkeys(re.findall(DISPUTE_CANCELLATION_PATTERN, text)))

        # Determine if invoice phishing template match
        is_invoice_scam = (
            len(detected_brands) > 0 and
            (len(amounts) > 0 or "invoice" in lower or "receipt" in lower or "subscription" in lower) and
            (len(phones) > 0 or len(lures) > 0)
        )

        return {
            "is_invoice_phishing": is_invoice_scam,
            "detected_brands": detected_brands,
            "claimed_amounts": amounts[:3],
            "support_phones": phones[:2],
            "detected_lures": lures[:4]
        }

    def _calculate_risk(
        self,
        structural: dict[str, Any],
        invoice: dict[str, Any],
        highest_url_threat: float,
        is_encrypted: bool
    ) -> dict[str, Any]:
        """Computes consolidated threat verdict, trust score, and explainable risk factors."""
        trust_score = 100.0
        risk_factors = []

        # 1. Critical Exploit Directives
        if structural["has_launch_action"]:
            trust_score = 0.0
            risk_factors.append("CRITICAL: /Launch directive attempts external OS executable or shell execution")

        if structural["has_submit_form"]:
            trust_score = min(trust_score, 10.0)
            risk_factors.append("CRITICAL: /SubmitForm directive silently transmits form data to remote host")

        if structural["has_javascript"]:
            trust_score -= 40.0
            risk_factors.append("Weaponized /JavaScript code embedded in document structure")

        if structural["has_open_action"]:
            trust_score -= 25.0
            risk_factors.append("/OpenAction trigger forces automated execution upon opening document")

        if structural["has_embedded_files"]:
            trust_score -= 30.0
            risk_factors.append("/EmbeddedFiles payload container found inside PDF")

        # 2. Embedded Phishing Links
        if highest_url_threat >= 1.0:
            trust_score -= 45.0
            risk_factors.append("Embedded hyperlink in document confirmed as PHISHING by SentiGuard threat engine")
        elif highest_url_threat >= 0.7:
            trust_score -= 20.0
            risk_factors.append("Embedded hyperlink in document shows suspicious security heuristics")

        # 3. Invoice Phishing / Callback Lure
        if invoice["is_invoice_phishing"]:
            trust_score -= 35.0
            brands_str = ", ".join(invoice["detected_brands"]) if invoice["detected_brands"] else "Payment Service"
            phone_str = f" (Contact line: {invoice['support_phones'][0]})" if invoice["support_phones"] else ""
            risk_factors.append(f"Scam Invoice template detected: Impersonating {brands_str}{phone_str} with unauthorized debit lure")

        if is_encrypted:
            trust_score -= 10.0
            risk_factors.append("Document uses password encryption to hinder automated gateway inspection")

        # Clamp trust score
        trust_score = max(0.0, min(100.0, round(trust_score, 1)))

        # Assign verdict
        if trust_score < 40.0 or structural["has_launch_action"] or highest_url_threat >= 1.0:
            verdict = "MALICIOUS"
            confidence = 0.94
        elif trust_score < 75.0 or invoice["is_invoice_phishing"] or structural["has_open_action"]:
            verdict = "SUSPICIOUS"
            confidence = 0.82
        else:
            verdict = "SAFE"
            confidence = 0.90

        if not risk_factors:
            risk_factors.append("No weaponized scripts, exploit actions, or phishing indicators detected.")

        return {
            "verdict": verdict,
            "trust_score": trust_score,
            "confidence": confidence,
            "risk_factors": risk_factors
        }


# Singleton instance
document_inspector_service = DocumentInspectionService()
