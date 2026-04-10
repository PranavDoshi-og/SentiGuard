"""
SentiGuard - Scan Service
Core business logic: feature extraction → ML prediction → result formatting.
"""

from app.ml.predictor import PhishingPredictor
from app.ml.feature_extractor import extract_features
from app.utils.logger import setup_logger

logger = setup_logger("sentiguard.services.scan")


class ScanService:
    def __init__(self):
        self.predictor = PhishingPredictor()

    def scan_url(self, url: str) -> dict:
        """
        Full pipeline: extract features → predict → format result.
        Returns a dict with verdict, trust_score, confidence, risk_factors, features.
        """
        features = extract_features(url)
        prediction = self.predictor.predict(features)

        verdict = "PHISHING" if prediction["is_phishing"] else "SAFE"
        confidence = prediction["confidence"]

        # Trust score: 0 = definitely phishing, 100 = definitely safe
        trust_score = round((1 - confidence) * 100, 1) if prediction["is_phishing"] \
                      else round(confidence * 100, 1)

        risk_factors = self._identify_risk_factors(features)

        return {
            "url": url,
            "verdict": verdict,
            "trust_score": trust_score,
            "confidence": round(confidence, 4),
            "risk_factors": risk_factors,
            "features": features,
        }

    def extract_url_from_qr(self, image_path: str) -> str | None:
        """
        Uses pyzbar to decode a QR code image and extract the URL.
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
                # Some QR codes omit scheme
                if "." in data and "/" in data:
                    return "https://" + data

            return None

        except ImportError:
            logger.error("pyzbar or Pillow not installed. Run: pip install pyzbar Pillow")
            raise RuntimeError("QR scanning libraries not available.")
        except Exception as e:
            logger.error(f"QR decode error: {e}")
            raise

    def _identify_risk_factors(self, features: dict) -> list[str]:
        """Generate human-readable risk factor descriptions."""
        risks = []

        if not features.get("has_https"):
            risks.append("No HTTPS – connection is not encrypted")
        if features.get("has_ip_address"):
            risks.append("IP address used instead of domain name")
        if features.get("url_length", 0) > 75:
            risks.append(f"Unusually long URL ({features['url_length']} chars)")
        if features.get("num_dots", 0) > 4:
            risks.append(f"Excessive subdomains ({features['num_dots']} dots)")
        if features.get("has_at_symbol"):
            risks.append("@ symbol present – can redirect to different host")
        if features.get("has_double_slash"):
            risks.append("Double slash redirection detected")
        if features.get("num_hyphens", 0) > 3:
            risks.append(f"Many hyphens in URL ({features['num_hyphens']})")
        if features.get("has_suspicious_tld"):
            risks.append("Suspicious top-level domain")
        if features.get("num_params", 0) > 5:
            risks.append(f"High number of URL parameters ({features['num_params']})")
        if features.get("has_hex_encoding"):
            risks.append("Hex-encoded characters found in URL")
        if features.get("subdomain_count", 0) > 2:
            risks.append(f"Multiple subdomains detected ({features['subdomain_count']})")

        return risks
