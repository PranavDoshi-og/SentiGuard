"""
SentiGuard - External Threat Intelligence Feeds Service
───────────────────────────────────────────────────────
Integrates Google Safe Browsing API v4 and Cloudflare Radar threat intelligence.
Provides multi-engine hybrid threat verification with strict timeout fallbacks.
"""

import os
from typing import Any
from urllib.parse import urlparse
import httpx

from app.utils.logger import setup_logger

logger = setup_logger("sentiguard.services.threat_feeds")


class ThreatFeedsService:
    """
    Queries external threat intelligence engines if API keys are configured in environment.
    Falls back gracefully to internal ML heuristics if keys are missing or services timeout.
    """

    def __init__(self):
        self.google_api_key = os.getenv("GOOGLE_SAFE_BROWSING_KEY") or os.getenv("SAFE_BROWSING_API_KEY")
        self.cloudflare_token = os.getenv("CLOUDFLARE_RADAR_TOKEN") or os.getenv("CLOUDFLARE_API_KEY")
        self.timeout = float(os.getenv("EXTERNAL_FEED_TIMEOUT_SECONDS", "2.5"))

    @property
    def has_configured_feeds(self) -> bool:
        return bool(self.google_api_key or self.cloudflare_token)

    def check_url(self, url: str) -> dict[str, Any]:
        """
        Runs configured external threat checks synchronously with tight timeouts.
        Returns a dictionary detailing external feed verdicts.
        """
        results = {
            "is_flagged": False,
            "sources": [],
            "threat_types": [],
            "details": [],
            "checked_engines": [],
        }

        # 1. Google Safe Browsing API v4
        if self.google_api_key:
            results["checked_engines"].append("Google Safe Browsing v4")
            gsb_res = self._check_google_safe_browsing(url)
            if gsb_res.get("match"):
                results["is_flagged"] = True
                results["sources"].append("Google Safe Browsing")
                threat_type = gsb_res.get("threat_type", "MALICIOUS")
                results["threat_types"].append(threat_type)
                results["details"].append(f"Flagged by Google Safe Browsing as {threat_type}")

        # 2. Cloudflare Radar API (if token provided)
        if self.cloudflare_token and not results["is_flagged"]:
            results["checked_engines"].append("Cloudflare Radar")
            cf_res = self._check_cloudflare_radar(url)
            if cf_res.get("match"):
                results["is_flagged"] = True
                results["sources"].append("Cloudflare Radar")
                results["threat_types"].append(cf_res.get("threat_type", "SECURITY_RISK"))
                results["details"].append(f"Cloudflare Radar identified domain as {cf_res.get('threat_type')}")

        return results

    def _check_google_safe_browsing(self, url: str) -> dict[str, Any]:
        """Query Google Safe Browsing Lookup API v4."""
        endpoint = f"https://safebrowsing.googleapis.com/v4/threatMatches:find?key={self.google_api_key}"
        payload = {
            "client": {
                "clientId": "sentiguard-enterprise",
                "clientVersion": "2.0.0"
            },
            "threatInfo": {
                "threatTypes": [
                    "MALWARE",
                    "SOCIAL_ENGINEERING",
                    "UNWANTED_SOFTWARE",
                    "POTENTIALLY_HARMFUL_APPLICATION"
                ],
                "platformTypes": ["ANY_PLATFORM"],
                "threatEntryTypes": ["URL"],
                "threatEntries": [{"url": url}]
            }
        }

        try:
            with httpx.Client(timeout=self.timeout) as client:
                resp = client.post(endpoint, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    matches = data.get("matches", [])
                    if matches:
                        first = matches[0]
                        threat_type = first.get("threatType", "SOCIAL_ENGINEERING")
                        logger.warning(f"Google Safe Browsing hit for {url}: {threat_type}")
                        return {"match": True, "threat_type": threat_type}
                    return {"match": False}
                else:
                    logger.warning(f"Google Safe Browsing API returned status {resp.status_code}: {resp.text[:200]}")
                    return {"match": False, "error": f"HTTP {resp.status_code}"}
        except Exception as e:
            logger.warning(f"Google Safe Browsing lookup error for {url}: {e}")
            return {"match": False, "error": str(e)}

    def _check_cloudflare_radar(self, url: str) -> dict[str, Any]:
        """Query Cloudflare Radar domain categorization."""
        try:
            domain = urlparse(url).netloc.split(":")[0]
            if not domain:
                return {"match": False}

            endpoint = f"https://api.cloudflare.com/client/v4/radar/entities/domains/{domain}"
            headers = {"Authorization": f"Bearer {self.cloudflare_token}"}

            with httpx.Client(timeout=self.timeout) as client:
                resp = client.get(endpoint, headers=headers)
                if resp.status_code == 200:
                    data = resp.json()
                    result = data.get("result", {}).get("domain", {})
                    categories = result.get("categories", [])
                    for cat in categories:
                        name = cat.get("name", "").lower()
                        if any(risk in name for risk in ["malware", "phishing", "spam", "security_risk"]):
                            logger.warning(f"Cloudflare Radar risk hit for {domain}: {name}")
                            return {"match": True, "threat_type": name.upper()}
                    return {"match": False}
                return {"match": False}
        except Exception as e:
            logger.warning(f"Cloudflare Radar lookup error: {e}")
            return {"match": False, "error": str(e)}


# Global singleton threat feeds service
threat_feeds_service = ThreatFeedsService()
