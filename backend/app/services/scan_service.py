"""
SentiGuard - Scan Service
─────────────────────────
Core business logic: feature extraction → ML prediction → result formatting & explainability.
"""

from typing import Any
from app.ml.predictor import PhishingPredictor
from app.ml.feature_extractor import extract_features
from app.utils.logger import setup_logger

logger = setup_logger("sentiguard.services.scan")


class ScanService:
    def __init__(self):
        self.predictor = PhishingPredictor()

    def scan_url(self, url: str) -> dict[str, Any]:
        """
        Full pipeline: extract features (lexical + live network) → ML prediction with SHAP → format result.
        Returns a dict with verdict, trust_score, confidence, risk_factors, features, shap_explanations, model_type.
        """
        features = extract_features(url, enable_network=True)
        prediction = self.predictor.predict(features, include_shap=True)

        verdict = "PHISHING" if prediction["is_phishing"] else "SAFE"
        confidence = prediction["confidence"]

        # Trust score: 0 = definitely phishing, 100 = definitely safe
        trust_score = round((1.0 - confidence) * 100.0, 1) if prediction["is_phishing"] \
                      else round(confidence * 100.0, 1)

        risk_factors = self._identify_risk_factors(features)

        network_profile = {
            "has_dns_a_record": bool(features.get("has_dns_a_record", 0.0) > 0),
            "has_dns_mx_record": bool(features.get("has_dns_mx_record", 0.0) > 0),
            "domain_age_days": features.get("domain_age_days", -1.0),
            "time_to_expiry_days": features.get("time_to_expiry_days", -1.0),
            "has_valid_ssl": bool(features.get("has_valid_ssl", 0.0) > 0),
            "ssl_days_to_expiry": features.get("ssl_days_to_expiry", -1.0),
            "is_free_ssl_issuer": bool(features.get("is_free_ssl_issuer", 0.0) > 0),
        }

        return {
            "url": url,
            "verdict": verdict,
            "trust_score": trust_score,
            "confidence": round(confidence, 4),
            "risk_factors": risk_factors,
            "features": features,
            "shap_explanations": prediction.get("shap_explanations", []),
            "model_type": prediction.get("model_type", "Unknown"),
            "network_profile": network_profile,
        }

    def extract_url_from_qr(self, image_path: str) -> str | None:
        """
        Uses pyzbar to decode a QR code image and extract the embedded URL.
        Returns the URL string or None if not found.
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
