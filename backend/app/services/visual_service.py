"""
SentiGuard - Visual Brand Phishing & OCR Inspection Service (Phase 1)
───────────────────────────────────────────────────────────────────────
Analyzes visual media (screenshots, flyers, invoices, email images) for:
1. Multi-tier OCR text extraction (Tesseract + Windows Native OCR fallback)
2. Brand identity detection & domain discrepancy verification (e.g., PayPal logo/name on unverified domain)
3. Urgency, social engineering, and extortion sentiment analysis
4. Fraudulent telephone / callback phishing detection
5. Automatic pipeline chaining into SentiGuard's URL intelligence engine
"""

import os
import re
from typing import Any
from urllib.parse import urlparse
from PIL import Image

try:
    from rapidfuzz import fuzz
except ImportError:
    fuzz = None

from app.utils.logger import setup_logger
from app.utils.ocr_helper import extract_text_from_image

logger = setup_logger("sentiguard.services.visual")

# Verified Brand Intelligence Dictionary
KNOWN_BRANDS = {
    "Microsoft": {
        "keywords": ["microsoft", "office 365", "microsoft 365", "outlook", "onedrive", "azure", "windows security"],
        "valid_domains": ["microsoft.com", "office.com", "office365.com", "live.com", "outlook.com", "azure.com", "microsoftonline.com", "sharepoint.com"]
    },
    "Google": {
        "keywords": ["google", "gmail", "google workspace", "google drive", "google security"],
        "valid_domains": ["google.com", "gmail.com", "googlemail.com", "youtube.com", "accounts.google.com"]
    },
    "PayPal": {
        "keywords": ["paypal", "paypal customer support", "paypal security"],
        "valid_domains": ["paypal.com", "paypal-community.com"]
    },
    "Apple": {
        "keywords": ["apple", "icloud", "apple id", "app store"],
        "valid_domains": ["apple.com", "icloud.com"]
    },
    "Amazon": {
        "keywords": ["amazon", "amazon prime", "amazon aws", "amazon security"],
        "valid_domains": ["amazon.com", "amazon.co.uk", "amazon.de", "amazon.in", "aws.amazon.com"]
    },
    "Netflix": {
        "keywords": ["netflix", "netflix membership", "netflix billing"],
        "valid_domains": ["netflix.com"]
    },
    "Meta / Facebook": {
        "keywords": ["meta", "facebook", "instagram", "whatsapp", "meta business"],
        "valid_domains": ["facebook.com", "meta.com", "instagram.com", "whatsapp.com", "fb.com"]
    },
    "Bank of America": {
        "keywords": ["bank of america", "bofa", "merrill lynch"],
        "valid_domains": ["bankofamerica.com", "bofa.com"]
    },
    "Chase": {
        "keywords": ["chase", "jpmorgan", "chase bank", "chase online"],
        "valid_domains": ["chase.com", "jpmorgan.com", "jpmorganchase.com"]
    },
    "Wells Fargo": {
        "keywords": ["wells fargo", "wellsfargo"],
        "valid_domains": ["wellsfargo.com"]
    },
    "Coinbase": {
        "keywords": ["coinbase", "coinbase pro", "coinbase wallet"],
        "valid_domains": ["coinbase.com"]
    },
    "MetaMask": {
        "keywords": ["metamask", "seed phrase", "secret recovery phrase"],
        "valid_domains": ["metamask.io"]
    },
    "Geek Squad / Best Buy": {
        "keywords": ["geek squad", "geeksquad", "best buy", "geek squad protection"],
        "valid_domains": ["bestbuy.com", "geeksquad.com"]
    },
    "Norton / McAfee": {
        "keywords": ["norton", "norton 360", "mcafee", "mcafee total protection", "antivirus renewal"],
        "valid_domains": ["norton.com", "mcafee.com"]
    },
    "DHL / FedEx / UPS": {
        "keywords": ["dhl", "fedex", "ups parcel", "usps package", "tracking notification"],
        "valid_domains": ["dhl.com", "fedex.com", "ups.com", "usps.com"]
    }
}

# High-risk urgency and extortion patterns
URGENCY_PATTERNS = [
    (r"(?i)\b(?:immediately|within\s+(?:\d{1,2}|24|48)\s+hours?|urgent|urgently)\b", 15.0, "Artificial urgency deadline"),
    (r"(?i)\b(?:account\s+(?:suspended|terminated|locked|disabled|blocked|restricted))\b", 25.0, "Account suspension threat"),
    (r"(?i)\b(?:unauthorized|fraudulent|suspicious)\s+(?:transaction|charge|login|activity)\b", 20.0, "Scare-tactic unauthorized charge alert"),
    (r"(?i)\b(?:refund\s+desk|billing\s+department|call\s+now|call\s+toll[\s-]free|helpdesk\s+number)\b", 20.0, "Callback phishing / tech support lure"),
    (r"(?i)\b(?:gift\s+card|bitcoin|crypto(?:currency)?|wire\s+transfer|western\s+union)\b", 30.0, "Untraceable payment coercion (crypto / gift card)"),
    (r"(?i)\b(?:law\s+enforcement|police|arrest\s+warrant|fbi|legal\s+action)\b", 35.0, "Extortion / legal intimidation"),
    (r"(?i)\b(?:enter\s+password|verify\s+identity|confirm\s+credentials|seed\s+phrase)\b", 25.0, "Credential harvesting prompt"),
]


class VisualInspectionService:
    def __init__(self):
        self._scan_service = None

    @property
    def scan_service(self):
        if self._scan_service is None:
            from app.services.scan_service import ScanService
            self._scan_service = ScanService()
        return self._scan_service

    def inspect_image(self, image_path: str, origin_url: str | None = None) -> dict[str, Any]:
        """
        Executes full Phase 1 visual phishing analysis on an uploaded image.
        """
        # 1. Verify and inspect image dimensions
        try:
            with Image.open(image_path) as img:
                img_format = img.format or "UNKNOWN"
                img_size = img.size
        except Exception as e:
            logger.error(f"Failed to open image {image_path}: {e}")
            raise ValueError(f"Invalid or corrupted image: {e}")

        # 2. Multi-tier OCR extraction (Tesseract or Windows Native OCR)
        ocr_result = extract_text_from_image(image_path)
        extracted_text = ocr_result.get("text", "")
        ocr_available = ocr_result.get("ocr_available", False)
        ocr_engine = ocr_result.get("engine", "None")

        # 3. Entity & Pattern Extraction (URLs, Phone Numbers, Emails)
        entities = self._extract_entities(extracted_text)

        # 4. Brand Impersonation & Domain Discrepancy Analysis
        brand_analysis = self._detect_brand_impersonation(
            extracted_text=extracted_text,
            found_urls=entities["urls"],
            origin_url=origin_url
        )

        # 5. Phishing Sentiment & Urgency Analysis
        urgency_analysis = self._analyze_urgency_heuristics(extracted_text)

        # 6. Chain Extracted URLs into SentiGuard URL Scan Engine
        url_scan_results = []
        highest_url_threat = 0.0
        urls_to_scan = list(entities["urls"])
        if origin_url and origin_url not in urls_to_scan:
            urls_to_scan.append(origin_url)

        for target_url in urls_to_scan[:3]:  # Scan top 3 extracted links
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
                logger.warning(f"Failed to auto-scan extracted URL '{target_url}': {e}")
                url_scan_results.append({
                    "url": target_url,
                    "verdict": "ERROR",
                    "error": str(e)
                })

        # 7. Synthesize Composite Threat Score & Risk Factors
        composite = self._compute_visual_risk(
            brand_analysis=brand_analysis,
            urgency_analysis=urgency_analysis,
            entities=entities,
            highest_url_threat=highest_url_threat,
            ocr_available=ocr_available
        )

        return {
            "verdict": composite["verdict"],
            "trust_score": composite["trust_score"],
            "confidence": composite["confidence"],
            "risk_factors": composite["risk_factors"],
            "image_metadata": {
                "format": img_format,
                "width": img_size[0],
                "height": img_size[1],
                "ocr_engine": ocr_engine,
                "ocr_ready": ocr_available
            },
            "brand_analysis": brand_analysis,
            "urgency_analysis": urgency_analysis,
            "extracted_entities": entities,
            "extracted_urls_scans": url_scan_results,
            "raw_text_snippet": extracted_text[:1200] if extracted_text else ""
        }

    def _extract_entities(self, text: str) -> dict[str, list[str]]:
        """Extract URLs, toll-free/support phone numbers, and email addresses from OCR text."""
        if not text:
            return {"urls": [], "phone_numbers": [], "emails": []}

        # URL extraction
        url_pattern = r"(?:https?:\/\/|www\.)[a-zA-Z0-9_\-\.]+(?:\.[a-zA-Z]{2,})[^\s]*|[a-zA-Z0-9_\-]+\.(?:com|org|net|io|xyz|info|top|cc|ru|live|app|biz|online)(?:\/[^\s]*)?"
        raw_urls = re.findall(url_pattern, text, re.IGNORECASE)
        normalized_urls = []
        for u in raw_urls:
            cleaned = u.rstrip(".,;)\"'")
            if not cleaned.startswith("http://") and not cleaned.startswith("https://"):
                cleaned = "https://" + cleaned
            if cleaned not in normalized_urls:
                normalized_urls.append(cleaned)

        # Phone numbers
        phone_pattern = r"(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}"
        phone_matches = re.findall(phone_pattern, text)
        phones = list(dict.fromkeys([p.strip() for p in phone_matches if len(re.sub(r"\D", "", p)) >= 10]))

        # Email addresses
        email_pattern = r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+"
        emails = list(dict.fromkeys(re.findall(email_pattern, text)))

        return {
            "urls": normalized_urls,
            "phone_numbers": phones,
            "emails": emails
        }

    def _detect_brand_impersonation(
        self,
        extracted_text: str,
        found_urls: list[str],
        origin_url: str | None
    ) -> dict[str, Any]:
        """
        Determines if a recognized brand is referenced in the visual media and checks
        if any destination URLs or origin domain match that brand's legitimate infrastructure.
        """
        detected_brands = []
        mismatched_brands = []
        lower_text = extracted_text.lower()

        # Gather all domains referenced in this media
        associated_domains = []
        for u in found_urls:
            try:
                parsed = urlparse(u)
                if parsed.netloc:
                    associated_domains.append(parsed.netloc.lower())
            except Exception:
                pass

        if origin_url:
            try:
                parsed_orig = urlparse(origin_url if "://" in origin_url else f"https://{origin_url}")
                if parsed_orig.netloc:
                    associated_domains.append(parsed_orig.netloc.lower())
            except Exception:
                pass

        for brand_name, brand_info in KNOWN_BRANDS.items():
            matched = False
            for kw in brand_info["keywords"]:
                if kw in lower_text:
                    matched = True
                    break
                elif fuzz and fuzz.partial_ratio(kw, lower_text) > 88:
                    matched = True
                    break

            if matched:
                detected_brands.append(brand_name)
                valid_domains = brand_info["valid_domains"]
                has_legit_domain = False

                if associated_domains:
                    for d in associated_domains:
                        if any(d == vd or d.endswith("." + vd) for vd in valid_domains):
                            has_legit_domain = True
                            break

                # If brand is detected, but domain points elsewhere or suspicious phishing lure context
                if not has_legit_domain and (associated_domains or any(w in lower_text for w in ["support", "helpdesk", "invoice", "refund", "suspend", "security", "warning", "login", "password"])):
                    mismatched_brands.append({
                        "brand": brand_name,
                        "expected_domains": valid_domains,
                        "found_domains": associated_domains
                    })

        is_impersonation = len(mismatched_brands) > 0

        return {
            "detected_brands": detected_brands,
            "is_impersonation": is_impersonation,
            "mismatched_brands": mismatched_brands
        }

    def _analyze_urgency_heuristics(self, text: str) -> dict[str, Any]:
        """Scans OCR text for extortion, coercion, and artificial urgency cues."""
        if not text:
            return {"urgency_score": 0.0, "detected_cues": []}

        urgency_score = 0.0
        detected_cues = []

        for pattern, weight, description in URGENCY_PATTERNS:
            matches = re.findall(pattern, text)
            if matches:
                urgency_score += weight
                detected_cues.append(f"{description} (matched: '{matches[0]}')")

        urgency_score = min(100.0, urgency_score)

        return {
            "urgency_score": round(urgency_score, 1),
            "detected_cues": detected_cues
        }

    def _compute_visual_risk(
        self,
        brand_analysis: dict[str, Any],
        urgency_analysis: dict[str, Any],
        entities: dict[str, Any],
        highest_url_threat: float,
        ocr_available: bool
    ) -> dict[str, Any]:
        """Calculates consolidated Trust Score, Verdict, and explainable Risk Factors."""
        trust_score = 100.0
        risk_factors = []

        # 1. Brand Impersonation (P0 Threat)
        if brand_analysis["is_impersonation"]:
            for item in brand_analysis["mismatched_brands"]:
                trust_score -= 50.0
                found = ", ".join(item["found_domains"]) if item["found_domains"] else "None / Unverified destination"
                risk_factors.append(
                    f"Brand Impersonation: '{item['brand']}' detected, but target destination is {found}"
                )

        # 2. Extracted URL Maliciousness
        if highest_url_threat >= 1.0:
            trust_score -= 45.0
            risk_factors.append("Embedded URL in visual media confirmed as PHISHING by SentiGuard threat engine")
        elif highest_url_threat >= 0.7:
            trust_score -= 25.0
            risk_factors.append("Embedded URL in visual media shows suspicious security heuristics")

        # 3. Urgency & Social Engineering Sentiment
        urgency_score = urgency_analysis["urgency_score"]
        if urgency_score >= 60.0:
            trust_score -= 30.0
            risk_factors.append(f"Severe social engineering urgency detected (Urgency Score: {urgency_score}/100)")
        elif urgency_score >= 30.0:
            trust_score -= 15.0
            risk_factors.append(f"Suspicious coercive phrasing detected (Urgency Score: {urgency_score}/100)")

        # 4. Callback / Tech Support Phone Lures
        if entities["phone_numbers"] and any(b in ["Geek Squad / Best Buy", "Norton / McAfee", "PayPal", "Amazon"] for b in brand_analysis["detected_brands"]):
            trust_score -= 20.0
            phone_list = ", ".join(entities["phone_numbers"][:2])
            risk_factors.append(f"Callback phishing pattern: High-risk brand with direct phone support lure ({phone_list})")

        # Clamp trust score
        trust_score = max(0.0, min(100.0, round(trust_score, 1)))

        # Assign verdict
        if trust_score < 45.0 or brand_analysis["is_impersonation"] or highest_url_threat >= 1.0:
            verdict = "PHISHING"
            confidence = 0.92
        elif trust_score < 75.0:
            verdict = "SUSPICIOUS"
            confidence = 0.78
        else:
            verdict = "SAFE"
            confidence = 0.88

        if not ocr_available:
            risk_factors.append("OCR engine operating with baseline heuristics.")

        return {
            "verdict": verdict,
            "trust_score": trust_score,
            "confidence": confidence,
            "risk_factors": risk_factors
        }


# Singleton instance
visual_service = VisualInspectionService()
