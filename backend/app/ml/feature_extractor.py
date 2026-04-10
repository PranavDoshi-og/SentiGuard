"""
SentiGuard - URL Feature Extractor
Extracts 20+ features from a URL for phishing detection.
"""

import re
import urllib.parse
from typing import Any


# Suspicious TLDs commonly used in phishing
SUSPICIOUS_TLDS = {
    ".tk", ".ml", ".ga", ".cf", ".gq", ".xyz", ".top", ".club",
    ".online", ".site", ".website", ".info", ".biz", ".pw",
    ".cc", ".click", ".link", ".gdn", ".work", ".trade",
}

# Known legitimate domains (very basic list – extend as needed)
TRUSTED_DOMAINS = {
    "google.com", "microsoft.com", "apple.com", "amazon.com",
    "facebook.com", "twitter.com", "linkedin.com", "github.com",
    "youtube.com", "instagram.com", "paypal.com", "netflix.com",
}


def extract_features(url: str) -> dict[str, Any]:
    """
    Extract a comprehensive feature set from a URL.
    Returns a flat dictionary of numeric/boolean features.
    """
    parsed = _safe_parse(url)
    full_url = url.lower()
    domain = parsed.netloc.lower() if parsed else ""
    path = parsed.path.lower() if parsed else ""
    query = parsed.query.lower() if parsed else ""

    features = {
        # ── Basic Structure ──────────────────────────
        "url_length":           len(url),
        "domain_length":        len(domain),
        "path_length":          len(path),

        # ── Protocol ─────────────────────────────────
        "has_https":            url.startswith("https://"),
        "has_http":             url.startswith("http://") and not url.startswith("https://"),

        # ── Domain Characteristics ────────────────────
        "num_dots":             full_url.count("."),
        "subdomain_count":      max(0, domain.count(".") - 1),
        "has_ip_address":       bool(re.search(r"\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}", domain)),
        "has_suspicious_tld":   any(domain.endswith(t) for t in SUSPICIOUS_TLDS),
        "is_trusted_domain":    any(domain == d or domain.endswith("." + d) for d in TRUSTED_DOMAINS),

        # ── Special Characters ────────────────────────
        "has_at_symbol":        "@" in full_url,
        "has_double_slash":     "//" in full_url[7:],   # skip scheme
        "num_hyphens":          full_url.count("-"),
        "has_underscore":       "_" in domain,
        "num_digits_in_domain": sum(c.isdigit() for c in domain),

        # ── URL Encoding / Obfuscation ────────────────
        "has_hex_encoding":     bool(re.search(r"%[0-9a-fA-F]{2}", full_url)),
        "has_unicode_escape":   "\\u" in full_url or "%u" in full_url,
        "num_encoded_chars":    len(re.findall(r"%[0-9a-fA-F]{2}", full_url)),

        # ── Query String ──────────────────────────────
        "num_params":           len(urllib.parse.parse_qs(query)),
        "query_length":         len(query),

        # ── Suspicious Keywords ───────────────────────
        "has_login_keyword":    bool(re.search(r"login|signin|logon|auth|verify|secure|account|update|password", full_url)),
        "has_bank_keyword":     bool(re.search(r"bank|paypal|payment|wallet|billing|invoice|transfer", full_url)),
        "has_free_keyword":     bool(re.search(r"free|prize|winner|claim|reward|gift|lucky|bonus", full_url)),

        # ── Path Depth ────────────────────────────────
        "path_depth":           path.count("/"),
        "has_exe_extension":    bool(re.search(r"\.(exe|zip|rar|bat|cmd|msi|apk)($|\?)", full_url)),
    }

    return features


def get_feature_names() -> list[str]:
    """Returns the ordered list of feature names (for ML training consistency)."""
    dummy = extract_features("https://example.com")
    return list(dummy.keys())


def features_to_vector(features: dict) -> list[float]:
    """Converts feature dict to ordered numeric list for ML model input."""
    return [float(features[k]) for k in get_feature_names()]


# ─── Internal Helpers ──────────────────────────────────────

def _safe_parse(url: str):
    try:
        return urllib.parse.urlparse(url)
    except Exception:
        return None
