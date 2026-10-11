"""
SentiGuard - Advanced Feature Extractor & Live Network Profiler
─────────────────────────────────────────────────────────────
Extracts 36 lexical, structural, brand intelligence, and live network features
from a URL for high-confidence zero-day phishing detection.
"""

import os
import re
import socket
import ssl
import sys
import time
import urllib.parse
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from typing import Any

# Suspicious TLDs commonly abused in phishing campaigns
SUSPICIOUS_TLDS = {
    ".tk", ".ml", ".ga", ".cf", ".gq", ".xyz", ".top", ".club",
    ".online", ".site", ".website", ".info", ".biz", ".pw",
    ".cc", ".click", ".link", ".gdn", ".work", ".trade", ".buzz",
    ".icu", ".monster", ".cyou", ".fit", ".rest", ".cam",
}

# TLDs without active public port-43 WHOIS daemons (avoids socket hangs)
DEAD_WHOIS_TLDS = {
    ".tk", ".ml", ".ga", ".cf", ".gq",
}

# Known enterprise and trusted services
TRUSTED_DOMAINS = {
    "google.com", "microsoft.com", "apple.com", "amazon.com",
    "facebook.com", "twitter.com", "x.com", "linkedin.com", "github.com",
    "youtube.com", "instagram.com", "paypal.com", "netflix.com",
    "chase.com", "bankofamerica.com", "wellsfargo.com", "citi.com",
    "wikipedia.org", "python.org", "mozilla.org", "adobe.com",
    "salesforce.com", "zoom.us", "slack.com", "shopify.com",
    "spotify.com", "nytimes.com", "stackoverflow.com",
}

# Major brands frequently targeted by deceptive typosquatting / spoofing
TARGETED_BRANDS = {
    "google", "paypal", "apple", "microsoft", "amazon", "netflix",
    "chase", "bankofamerica", "wellsfargo", "facebook", "instagram",
    "whatsapp", "linkedin", "twitter", "steam", "dhl", "usps", "blockchain",
}

# High-velocity URL Shorteners hiding the true destination
URL_SHORTENERS = {
    "bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly", "is.gd",
    "buff.ly", "adf.ly", "bitly.com", "cutt.ly", "rb.gy", "shorturl.at",
}

# Common free or automated Certificate Authorities heavily abused on ephemeral phish
FREE_SSL_ISSUERS = {
    "let's encrypt", "cpanel", "zerossl", "cloud flare", "cloudflare", "free ssl", "certum",
}

# In-memory cache for network lookups to prevent duplicate DNS/WHOIS overhead
_NETWORK_CACHE: dict[str, tuple[float, dict[str, Any]]] = {}
_CACHE_TTL_SECONDS = 3600  # 1 hour TTL


# ─── Live Network Profiling Helpers ──────────────────────────

def _clean_domain(url: str) -> str:
    """Extract clean domain/hostname without scheme, port, or path."""
    parsed = _safe_parse(url)
    if not parsed or not parsed.netloc:
        match = re.search(r"^(?:https?://)?([^/:?#]+)", url, re.IGNORECASE)
        netloc = match.group(1) if match else url
    else:
        netloc = parsed.netloc

    if ":" in netloc:
        netloc = netloc.split(":")[0]
    return netloc.strip().lower()


def _get_registrable_domain(domain: str) -> str:
    """
    Extract registrable apex domain (e.g., 'sub.example.com' -> 'example.com').
    Handles common two-part TLDs like co.uk, com.au, edu.in.
    """
    parts = domain.split(".")
    if len(parts) <= 2:
        return domain

    two_part_tlds = {"co.uk", "com.au", "co.in", "net.in", "org.in", "edu.in", "gov.in", "com.br", "co.jp"}
    joined_last_two = f"{parts[-2]}.{parts[-1]}"

    if joined_last_two in two_part_tlds and len(parts) >= 3:
        return ".".join(parts[-3:])
    return ".".join(parts[-2:])


def _check_brand_spoofing(domain: str) -> bool:
    """Detects brand names embedded in untrusted domains or deceptive subdomains."""
    if any(domain == d or domain.endswith("." + d) for d in TRUSTED_DOMAINS):
        return False
    return any(b in domain for b in TARGETED_BRANDS)


def _check_digit_substitution(domain: str) -> bool:
    """Detects leetspeak homoglyph substitutions like g00gle, paypa1, faceb00k."""
    # Look for digits surrounded by letters or common substitutions: 0->o, 1->l/i, 5->s
    if re.search(r"[a-z][01345][a-z]", domain):
        return True
    return bool(re.search(r"(g00gle|paypa1|rnicrosoft|arnazon|faceb00k|netfl1x|app1e)", domain))


def get_dns_records(domain: str, timeout: float = 1.0) -> dict[str, Any]:
    """Query DNS for A/AAAA address records and MX mail records."""
    records = {
        "has_dns_a_record": 0.0,
        "has_dns_mx_record": 0.0,
        "dns_resolved_ips_count": 0.0,
    }

    if not domain or domain.replace(".", "").isdigit():
        return records

    try:
        import dns.resolver
        resolver = dns.resolver.Resolver()
        resolver.lifetime = timeout
        resolver.timeout = timeout

        try:
            answers = resolver.resolve(domain, "A")
            records["has_dns_a_record"] = 1.0
            records["dns_resolved_ips_count"] = float(len(answers))
        except Exception:
            try:
                answers = resolver.resolve(domain, "AAAA")
                records["has_dns_a_record"] = 1.0
                records["dns_resolved_ips_count"] = float(len(answers))
            except Exception:
                records["has_dns_a_record"] = 0.0

        try:
            mx_answers = resolver.resolve(domain, "MX")
            records["has_dns_mx_record"] = 1.0 if len(mx_answers) > 0 else 0.0
        except Exception:
            records["has_dns_mx_record"] = 0.0

    except ImportError:
        try:
            socket.setdefaulttimeout(timeout)
            addrs = socket.gethostbyname_ex(domain)
            records["has_dns_a_record"] = 1.0
            records["dns_resolved_ips_count"] = float(len(addrs[2]))
        except Exception:
            pass

    return records


def get_domain_whois(domain: str, timeout: float = 1.5) -> dict[str, Any]:
    """Query WHOIS to extract domain registration age and expiration window."""
    whois_info = {
        "domain_age_days": -1.0,
        "time_to_expiry_days": -1.0,
    }

    if not domain or re.match(r"^\d{1,3}(\.\d{1,3}){3}$", domain) or "localhost" in domain:
        return whois_info

    if any(domain.endswith(tld) for tld in DEAD_WHOIS_TLDS):
        return whois_info

    registrable = _get_registrable_domain(domain)

    def _query():
        orig_stderr = sys.stderr
        try:
            sys.stderr = open(os.devnull, "w")
            import whois
            w = whois.whois(registrable)

            c_date = w.creation_date
            e_date = w.expiration_date

            if isinstance(c_date, list) and c_date:
                c_date = c_date[0]
            if isinstance(e_date, list) and e_date:
                e_date = e_date[0]

            now = datetime.now(timezone.utc)

            if c_date and isinstance(c_date, datetime):
                if c_date.tzinfo is not None:
                    c_date = c_date.astimezone(timezone.utc)
                else:
                    c_date = c_date.replace(tzinfo=timezone.utc)
                age = (now - c_date).days
                whois_info["domain_age_days"] = float(max(0, age))

            if e_date and isinstance(e_date, datetime):
                if e_date.tzinfo is not None:
                    e_date = e_date.astimezone(timezone.utc)
                else:
                    e_date = e_date.replace(tzinfo=timezone.utc)
                days_left = (e_date - now).days
                whois_info["time_to_expiry_days"] = float(days_left)

            return whois_info
        except Exception:
            return whois_info
        finally:
            try:
                sys.stderr.close()
            except Exception:
                pass
            sys.stderr = orig_stderr

    with ThreadPoolExecutor(max_workers=1) as executor:
        future = executor.submit(_query)
        try:
            return future.result(timeout=timeout)
        except Exception:
            return whois_info


def get_ssl_info(domain: str, port: int = 443, timeout: float = 1.2) -> dict[str, Any]:
    """Perform TLS handshake and inspect peer certificate parameters."""
    ssl_info = {
        "has_valid_ssl": 0.0,
        "ssl_days_to_expiry": -1.0,
        "is_free_ssl_issuer": 0.0,
    }

    if not domain or re.match(r"^\d{1,3}(\.\d{1,3}){3}$", domain) or "localhost" in domain:
        return ssl_info

    try:
        ctx = ssl.create_default_context()
        with socket.create_connection((domain, port), timeout=timeout) as sock:
            with ctx.wrap_socket(sock, server_hostname=domain) as ssock:
                cert = ssock.getpeercert()
                if not cert:
                    return ssl_info

                ssl_info["has_valid_ssl"] = 1.0

                not_after = cert.get("notAfter")
                if not_after:
                    exp_date = datetime.strptime(not_after, "%b %d %H:%M:%S %Y %Z").replace(tzinfo=timezone.utc)
                    now = datetime.now(timezone.utc)
                    days_left = (exp_date - now).days
                    ssl_info["ssl_days_to_expiry"] = float(max(-1, days_left))

                issuer_str = ""
                for field in cert.get("issuer", ()):
                    for item in field:
                        if isinstance(item, tuple) and len(item) == 2:
                            issuer_str += " " + str(item[1]).lower()

                if any(free_ca in issuer_str for free_ca in FREE_SSL_ISSUERS):
                    ssl_info["is_free_ssl_issuer"] = 1.0

    except Exception:
        ssl_info["has_valid_ssl"] = 0.0

    return ssl_info


def extract_network_features(url: str, timeout: float = 1.5) -> dict[str, Any]:
    """Concurrently extracts DNS, WHOIS, and SSL characteristics with memory caching."""
    domain = _clean_domain(url)
    now_ts = time.time()

    if domain in _NETWORK_CACHE:
        cached_time, cached_data = _NETWORK_CACHE[domain]
        if now_ts - cached_time < _CACHE_TTL_SECONDS:
            return cached_data.copy()

    net_features = {
        "domain_age_days": -1.0,
        "time_to_expiry_days": -1.0,
        "has_dns_a_record": 0.0,
        "has_dns_mx_record": 0.0,
        "dns_resolved_ips_count": 0.0,
        "has_valid_ssl": 0.0,
        "ssl_days_to_expiry": -1.0,
        "is_free_ssl_issuer": 0.0,
    }

    if not domain or re.match(r"^\d{1,3}(\.\d{1,3}){3}$", domain) or "localhost" in domain:
        _NETWORK_CACHE[domain] = (now_ts, net_features.copy())
        return net_features

    # 1. DNS check first
    dns_res = get_dns_records(domain, timeout=min(timeout, 1.0))
    net_features.update(dns_res)

    # 2. If DNS resolved, inspect SSL and WHOIS
    if net_features["has_dns_a_record"] > 0:
        with ThreadPoolExecutor(max_workers=2) as pool:
            whois_future = pool.submit(get_domain_whois, domain, timeout=timeout)
            ssl_future = pool.submit(get_ssl_info, domain, port=443, timeout=min(timeout, 1.2))

            try:
                net_features.update(whois_future.result())
            except Exception:
                pass

            try:
                net_features.update(ssl_future.result())
            except Exception:
                pass
    else:
        if not any(domain.endswith(t) for t in DEAD_WHOIS_TLDS):
            try:
                whois_res = get_domain_whois(domain, timeout=min(timeout, 1.0))
                net_features.update(whois_res)
            except Exception:
                pass

    _NETWORK_CACHE[domain] = (now_ts, net_features.copy())
    return net_features


# ─── Comprehensive URL Feature Extraction ───────────────────

def extract_features(url: str, enable_network: bool = True, timeout: float = 1.5) -> dict[str, Any]:
    """
    Extract a comprehensive feature set (36 features) from a URL.
    Returns a flat dictionary of numeric features suitable for ML classifiers.
    """
    parsed = _safe_parse(url)
    full_url = url.lower()
    domain = parsed.netloc.lower() if parsed and parsed.netloc else _clean_domain(url)
    clean_dom = _clean_domain(url)
    path = parsed.path.lower() if parsed and parsed.path else ""
    query = parsed.query.lower() if parsed and parsed.query else ""

    features: dict[str, Any] = {
        # ── Basic Structure ──────────────────────────
        "url_length":           float(len(url)),
        "domain_length":        float(len(domain)),
        "path_length":          float(len(path)),

        # ── Protocol ─────────────────────────────────
        "has_https":            1.0 if url.startswith("https://") else 0.0,
        "has_http":             1.0 if (url.startswith("http://") and not url.startswith("https://")) else 0.0,

        # ── Domain Characteristics ────────────────────
        "num_dots":             float(full_url.count(".")),
        "subdomain_count":      float(max(0, domain.count(".") - 1)),
        "has_ip_address":       1.0 if bool(re.search(r"\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}", domain)) else 0.0,
        "has_suspicious_tld":   1.0 if any(clean_dom.endswith(t) for t in SUSPICIOUS_TLDS) else 0.0,
        "is_trusted_domain":    1.0 if any(clean_dom == d or clean_dom.endswith("." + d) for d in TRUSTED_DOMAINS) else 0.0,

        # ── Brand & Obfuscation Signals ───────────────
        "is_url_shortener":     1.0 if any(clean_dom == s or clean_dom.endswith("." + s) for s in URL_SHORTENERS) else 0.0,
        "has_brand_spoofing":   1.0 if _check_brand_spoofing(clean_dom) else 0.0,
        "has_digit_substitution": 1.0 if _check_digit_substitution(clean_dom) else 0.0,

        # ── Special Characters ────────────────────────
        "has_at_symbol":        1.0 if "@" in full_url else 0.0,
        "has_double_slash":     1.0 if ("//" in full_url[7:]) else 0.0,
        "num_hyphens":          float(full_url.count("-")),
        "has_underscore":       1.0 if ("_" in domain) else 0.0,
        "num_digits_in_domain": float(sum(c.isdigit() for c in domain)),

        # ── URL Encoding / Obfuscation ────────────────
        "has_hex_encoding":     1.0 if bool(re.search(r"%[0-9a-fA-F]{2}", full_url)) else 0.0,
        "has_unicode_escape":   1.0 if ("\\u" in full_url or "%u" in full_url) else 0.0,
        "num_encoded_chars":    float(len(re.findall(r"%[0-9a-fA-F]{2}", full_url))),

        # ── Query String ──────────────────────────────
        "num_params":           float(len(urllib.parse.parse_qs(query))),
        "query_length":         float(len(query)),

        # ── Suspicious Keywords ───────────────────────
        "has_login_keyword":    1.0 if bool(re.search(r"login|signin|logon|auth|verify|secure|account|update|password", full_url)) else 0.0,
        "has_bank_keyword":     1.0 if bool(re.search(r"bank|paypal|payment|wallet|billing|invoice|transfer", full_url)) else 0.0,
        "has_free_keyword":     1.0 if bool(re.search(r"free|prize|winner|claim|reward|gift|lucky|bonus|promo", full_url)) else 0.0,

        # ── Path Depth ────────────────────────────────
        "path_depth":           float(path.count("/")),
        "has_exe_extension":    1.0 if bool(re.search(r"\.(exe|zip|rar|bat|cmd|msi|apk|vbs|ps1)($|\?)", full_url)) else 0.0,

        # ── Live Network Intelligence ─────────────────
        "domain_age_days":        -1.0,
        "time_to_expiry_days":    -1.0,
        "has_dns_a_record":       0.0,
        "has_dns_mx_record":      0.0,
        "dns_resolved_ips_count": 0.0,
        "has_valid_ssl":          0.0,
        "ssl_days_to_expiry":     -1.0,
        "is_free_ssl_issuer":     0.0,
    }

    if enable_network:
        try:
            net = extract_network_features(url, timeout=timeout)
            features.update(net)
        except Exception:
            pass

    return features


def get_feature_names() -> list[str]:
    """Returns the ordered list of feature names for ML model training and inference."""
    dummy = extract_features("https://example.com", enable_network=False)
    return list(dummy.keys())


def features_to_vector(features: dict[str, Any]) -> list[float]:
    """Converts feature dict to ordered numeric list for ML model input."""
    names = get_feature_names()
    return [float(features.get(k, 0.0)) for k in names]


# ─── Internal Helpers ──────────────────────────────────────────

def _safe_parse(url: str):
    try:
        if not re.match(r"^[a-zA-Z][a-zA-Z0-9+.-]*://", url):
            url = "https://" + url
        return urllib.parse.urlparse(url)
    except Exception:
        return None
