"""
SentiGuard - Scan Service (Phase 2 Enhanced)
─────────────────────────────────────────────
Core business logic:
1. Sub-2ms Reputation Cache Lookup (TTLCache / Redis)
2. Feature Extraction (Lexical + Live Network Profiling)
3. LightGBM / RF ML Classification with SHAP Explainability
4. Multi-Engine Hybrid Threat Feeds (Google Safe Browsing & Cloudflare Radar)
5. Telemetry & Database Persistence
"""

import json
from typing import Any
from sqlalchemy.orm import Session

from app.ml.predictor import PhishingPredictor
from app.ml.feature_extractor import extract_features
from app.services.cache_service import reputation_cache
from app.services.threat_feeds import threat_feeds_service
from app.services.inspector_service import inspector_service
from app.db.models import ScanRecord, DisputeReport
from app.utils.logger import setup_logger

logger = setup_logger("sentiguard.services.scan")


class ScanService:
    def __init__(self):
        self.predictor = PhishingPredictor()
        self.cache = reputation_cache
        self.threat_feeds = threat_feeds_service
        self.inspector = inspector_service

    def scan_url(self, url: str, bypass_cache: bool = False) -> dict[str, Any]:
        """
        Full Phase 4 pipeline:
        1. Check reputation cache (sub-2ms)
        2. Feature extraction (lexical + live network)
        3. ML prediction with SHAP explanations
        4. External intelligence verification (Google Safe Browsing / Cloudflare)
        5. Deep Domain Inspection (WHOIS, Hosting & ASN, HTTP Redirect Chain)
        6. Store in cache & return
        """
        # 1. Reputation Cache Check
        if not bypass_cache:
            cached_result = self.cache.get(url)
            if cached_result is not None:
                logger.info(f"Cache HIT for {url} ({cached_result.get('cache_latency_ms', 0)}ms)")
                return cached_result

        # 2. Extract Features (Lexical + Live Network WHOIS/DNS/SSL)
        features = extract_features(url, enable_network=True)

        # 3. ML Inference & SHAP Explainability
        prediction = self.predictor.predict(features, include_shap=True)
        is_phishing = prediction["is_phishing"]
        confidence = prediction["confidence"]
        verdict = "PHISHING" if is_phishing else "SAFE"

        # Trust score: 0 = definitely phishing, 100 = definitely safe
        trust_score = round((1.0 - confidence) * 100.0, 1) if is_phishing else round(confidence * 100.0, 1)
        risk_factors = self._identify_risk_factors(features)

        # 4. Multi-Engine External Threat Feeds
        feed_intel = self.threat_feeds.check_url(url)
        if feed_intel.get("is_flagged"):
            verdict = "PHISHING"
            trust_score = 0.0
            confidence = 1.0
            for detail in feed_intel.get("details", []):
                risk_factors.insert(0, f"🚨 {detail}")

        # 5. Deep Domain Inspection & Redirect Tracer
        deep_intel = self.inspector.inspect_full(url)
        if deep_intel["redirect_trace"].get("has_shortener_hop"):
            if not any("shortener" in rf.lower() for rf in risk_factors):
                risk_factors.append("URL Shortener intermediary detected – hides true landing destination")

        whois_data = deep_intel.get("whois", {})
        hosting_data = deep_intel.get("hosting_asn", {})

        domain_age = whois_data.get("domain_age_days")
        if domain_age is None or domain_age < 0:
            domain_age = features.get("domain_age_days", -1.0)

        time_to_expiry = whois_data.get("time_to_expiry_days")
        if time_to_expiry is None or time_to_expiry < 0:
            time_to_expiry = features.get("time_to_expiry_days", -1.0)

        network_profile = {
            "has_dns_a_record": bool(features.get("has_dns_a_record", 0.0) > 0),
            "has_dns_mx_record": bool(features.get("has_dns_mx_record", 0.0) > 0),
            "domain_age_days": domain_age,
            "time_to_expiry_days": time_to_expiry,
            "has_valid_ssl": bool(features.get("has_valid_ssl", 0.0) > 0),
            "ssl_days_to_expiry": features.get("ssl_days_to_expiry", -1.0),
            "is_free_ssl_issuer": bool(features.get("is_free_ssl_issuer", 0.0) > 0),
            "registrar": whois_data.get("registrar"),
            "primary_ip": hosting_data.get("primary_ip"),
            "asn": hosting_data.get("asn"),
            "as_name": hosting_data.get("as_name"),
            "country": hosting_data.get("country"),
        }

        result = {
            "url": url,
            "verdict": verdict,
            "trust_score": trust_score,
            "confidence": round(confidence, 4),
            "risk_factors": risk_factors,
            "features": features,
            "shap_explanations": prediction.get("shap_explanations", []),
            "model_type": prediction.get("model_type", "Unknown"),
            "network_profile": network_profile,
            "deep_inspector": {
                "whois": whois_data,
                "hosting_asn": hosting_data,
            },
            "redirect_trace": deep_intel.get("redirect_trace", {}),
            "external_intelligence": {
                "flagged": feed_intel.get("is_flagged", False),
                "sources": feed_intel.get("sources", []),
                "engines_checked": feed_intel.get("checked_engines", []),
            },
            "cached": False,
        }

        # 6. Populate Reputation Cache
        self.cache.set(url, result)
        return result

    def record_scan_telemetry(self, db: Session, result: dict[str, Any], client_ip: str | None = None) -> None:
        """Persists scan telemetry into SQLite/PostgreSQL for auditing and analytics."""
        try:
            network = result.get("network_profile", {})
            record = ScanRecord(
                url=result["url"],
                verdict=result["verdict"],
                trust_score=result["trust_score"],
                confidence=result["confidence"],
                risk_factors_json=json.dumps(result.get("risk_factors", [])),
                model_type=result.get("model_type", "Unknown"),
                has_dns_a_record=network.get("has_dns_a_record", True),
                has_valid_ssl=network.get("has_valid_ssl", True),
                domain_age_days=network.get("domain_age_days", -1.0),
                cached=result.get("cached", False),
                client_ip=client_ip,
            )
            db.add(record)
            db.commit()
        except Exception as e:
            db.rollback()
            logger.warning(f"Telemetry logging error: {e}")

    def record_dispute_report(
        self,
        db: Session,
        url: str,
        report_type: str,
        comment: str | None = None,
        contact_email: str | None = None,
        original_verdict: str | None = None,
        original_trust_score: float | None = None,
        client_ip: str | None = None,
    ) -> DisputeReport:
        """Stores a community dispute report for retraining review."""
        report = DisputeReport(
            url=url,
            report_type=report_type,
            comment=comment,
            contact_email=contact_email,
            original_verdict=original_verdict,
            original_trust_score=original_trust_score,
            client_ip=client_ip,
            status="PENDING_REVIEW",
        )
        db.add(report)
        db.commit()
        db.refresh(report)
        logger.info(f"Logged dispute report #{report.id} for {url} ({report_type})")
        return report

    def extract_url_from_qr(self, image_path: str) -> str | None:
        """
        Uses pyzbar to decode a QR code image and extract the embedded URL.
        """
        try:
            from pyzbar.pyzbar import decode
            from PIL import Image

            image = Image.open(image_path)
            decoded = decode(image)

            for item in decoded:
                data = item.data.decode("utf-8")
                if data.startswith("http://") or data.startswith("https://"):
                    return data
                if "." in data and "/" in data:
                    return "https://" + data

            return None
        except ImportError:
            logger.error("pyzbar or Pillow not installed. Run: pip install pyzbar Pillow")
            raise RuntimeError("QR scanning libraries not available.")
        except Exception as e:
            logger.error(f"QR decode error: {e}")
            raise

    def _identify_risk_factors(self, features: dict[str, Any]) -> list[str]:
        """Generate human-readable risk factor descriptions covering lexical & network threats."""
        risks = []

        # Network & Infrastructure signals
        if features.get("has_dns_a_record", 1.0) == 0.0:
            risks.append("No valid DNS A/AAAA record - domain does not resolve to an active IP")

        if not features.get("has_https"):
            risks.append("No HTTPS - communication is unencrypted and vulnerable to interception")
        elif features.get("has_valid_ssl", 1.0) == 0.0:
            risks.append("Invalid or untrusted SSL/TLS certificate chain")

        domain_age = features.get("domain_age_days", -1.0)
        if 0 <= domain_age < 30:
            risks.append(f"Newly registered domain ({int(domain_age)} days old) - high indicator of disposable attack domain")

        time_to_exp = features.get("time_to_expiry_days", -1.0)
        if 0 <= time_to_exp < 30:
            risks.append(f"Domain registration expiring soon ({int(time_to_exp)} days remaining)")

        if features.get("is_free_ssl_issuer", 0.0) > 0.0:
            risks.append("Uses automated/free SSL certificate commonly found on phishing sites")

        # Lexical & Structural signals
        if features.get("has_brand_spoofing"):
            risks.append("Deceptive brand impersonation detected in domain or subdomain")
        if features.get("has_digit_substitution"):
            risks.append("Homoglyph / digit character substitution detected (e.g. 0 for o, 1 for l)")
        if features.get("is_url_shortener"):
            risks.append("Known URL shortener service - true destination domain is masked")
        if features.get("has_ip_address"):
            risks.append("Direct IP address used as hostname instead of a registered domain")
        if features.get("has_suspicious_tld"):
            risks.append("High-risk or commonly abused Top-Level Domain (TLD)")
        if features.get("has_at_symbol"):
            risks.append("@ symbol present in URL – can redirect browser credentials")
        if features.get("has_double_slash"):
            risks.append("Mid-URL double slash redirection sequence detected")
        if features.get("url_length", 0) > 75:
            risks.append(f"Unusually long URL ({int(features['url_length'])} characters)")
        if features.get("num_dots", 0) > 4:
            risks.append(f"Excessive dot count ({int(features['num_dots'])} dots) – possible subdomain masking")
        if features.get("subdomain_count", 0) > 2:
            risks.append(f"Deep subdomain nesting ({int(features['subdomain_count'])} levels)")
        if features.get("num_hyphens", 0) > 3:
            risks.append(f"High number of hyphens ({int(features['num_hyphens'])}) – common brand spoofing indicator")
        if features.get("has_login_keyword"):
            risks.append("Contains sensitive authentication keywords (login, signin, verify, auth)")
        if features.get("has_bank_keyword"):
            risks.append("Contains financial keywords (bank, paypal, payment, billing)")
        if features.get("has_free_keyword"):
            risks.append("Contains urgency/lure keywords (free, prize, winner, bonus)")
        if features.get("has_hex_encoding"):
            risks.append("Obfuscated hex-encoded characters detected in URL string")
        if features.get("num_params", 0) > 5:
            risks.append(f"High parameter count ({int(features['num_params'])} parameters)")

        return risks
