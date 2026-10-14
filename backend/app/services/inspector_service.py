"""
SentiGuard - Deep Domain & Infrastructure Inspector Service
────────────────────────────────────────────────────────────
Provides:
1. HTTP Redirect Chain Tracer (detects shorteners, intermediate hops, path expansion)
2. Deep WHOIS Metadata (Registrar, creation date, expiration date, domain status, nameservers)
3. Hosting & ASN Intelligence (Resolved IPs, ASN, AS Organization, CIDR, Reverse DNS)
"""

import re
import socket
import json
import datetime
from datetime import timezone
import time
import urllib.request
import urllib.error
import urllib.parse
from typing import Any
import dns.resolver

from app.utils.logger import setup_logger

logger = setup_logger("sentiguard.services.inspector")

# Known URL Shorteners frequently abused in phishing
URL_SHORTENERS = {
    "bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly", "is.gd",
    "buff.ly", "adf.ly", "bitly.com", "cutt.ly", "rb.gy", "shorturl.at",
    "tiny.cc", "lnkd.in", "rebrand.ly", "soo.gd", "s.id", "v.gd",
}

# In-memory cache for deep inspection results to preserve <2ms scan speed
_INSPECTION_CACHE: dict[str, tuple[float, dict[str, Any]]] = {}
_CACHE_TTL = 3600  # 1 hour


class _NoRedirectHandler(urllib.request.HTTPRedirectHandler):
    """Custom handler that prevents automatic redirection so we can capture each hop."""
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def _clean_domain(url: str) -> str:
    """Extract clean domain/hostname without scheme, port, or path."""
    match = re.search(r"^(?:https?://)?([^/:?#]+)", url, re.IGNORECASE)
    netloc = match.group(1) if match else url
    if ":" in netloc:
        netloc = netloc.split(":")[0]
    return netloc.strip().lower()


def _get_registrable_domain(domain: str) -> str:
    """Extract registrable apex domain (e.g., 'sub.example.com' -> 'example.com')."""
    parts = domain.split(".")
    if len(parts) <= 2:
        return domain

    two_part_tlds = {"co.uk", "com.au", "co.in", "net.in", "org.in", "edu.in", "gov.in", "com.br", "co.jp"}
    joined_last_two = f"{parts[-2]}.{parts[-1]}"

    if joined_last_two in two_part_tlds and len(parts) >= 3:
        return ".".join(parts[-3:])
    return ".".join(parts[-2:])


class InspectorService:
    def __init__(self):
        self.opener = urllib.request.build_opener(_NoRedirectHandler)
        self.user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 SentiGuard-Inspector/2.0"

    def trace_redirects(self, url: str, max_hops: int = 8, timeout: float = 3.0) -> dict[str, Any]:
        """
        Traces the full HTTP redirect chain for a target URL.
        Captures intermediate status codes (301, 302, 307, 308) and identifies shorteners.
        """
        hops = []
        current_url = url
        has_shortener = False

        try:
            for hop_idx in range(1, max_hops + 1):
                clean_host = _clean_domain(current_url)
                is_short = any(clean_host == s or clean_host.endswith("." + s) for s in URL_SHORTENERS)
                if is_short:
                    has_shortener = True

                req = urllib.request.Request(
                    current_url,
                    headers={"User-Agent": self.user_agent, "Accept": "*/*"},
                    method="HEAD"
                )

                status_code = None
                location = None

                try:
                    with self.opener.open(req, timeout=timeout) as resp:
                        status_code = resp.status if hasattr(resp, "status") else resp.getcode()
                except urllib.error.HTTPError as e:
                    status_code = e.code
                    location = e.headers.get("Location")
                except Exception:
                    # Retry with GET method if HEAD is blocked
                    try:
                        req_get = urllib.request.Request(
                            current_url,
                            headers={"User-Agent": self.user_agent, "Accept": "*/*"},
                            method="GET"
                        )
                        with self.opener.open(req_get, timeout=timeout) as resp:
                            status_code = resp.status if hasattr(resp, "status") else resp.getcode()
                    except urllib.error.HTTPError as e_get:
                        status_code = e_get.code
                        location = e_get.headers.get("Location")
                    except Exception as err:
                        hops.append({
                            "hop": hop_idx,
                            "url": current_url,
                            "status_code": None,
                            "is_shortener": is_short,
                            "target_url": None,
                            "error": str(err),
                        })
                        break

                next_url = None
                if status_code in (301, 302, 303, 307, 308) and location:
                    next_url = urllib.parse.urljoin(current_url, location)

                hops.append({
                    "hop": hop_idx,
                    "url": current_url,
                    "status_code": status_code,
                    "is_shortener": is_short,
                    "target_url": next_url,
                })

                if next_url and next_url != current_url:
                    current_url = next_url
                else:
                    break

        except Exception as e:
            logger.warning(f"Redirect trace error for {url}: {e}")

        final_url = hops[-1]["url"] if hops else url
        is_redirected = len(hops) > 1 or (hops and hops[0]["url"] != final_url)

        return {
            "hops": hops,
            "hop_count": len(hops),
            "is_redirected": is_redirected,
            "final_url": final_url,
            "has_shortener_hop": has_shortener,
        }

    def get_hosting_asn(self, domain: str, timeout: float = 2.0) -> dict[str, Any]:
        """
        Resolves IP addresses, reverse DNS, and queries Cymru DNS for ASN,
        AS Organization Name, CIDR block, and Country code.
        """
        info: dict[str, Any] = {
            "resolved_ips": [],
            "primary_ip": None,
            "asn": None,
            "as_name": None,
            "country": None,
            "cidr": None,
            "reverse_dns": None,
        }

        clean_dom = domain.split(":")[0].strip().lower()
        if not clean_dom or "localhost" in clean_dom:
            return info

        # 1. Resolve A Records
        resolver = dns.resolver.Resolver()
        resolver.lifetime = timeout
        resolver.timeout = timeout

        try:
            ans = resolver.resolve(clean_dom, "A")
            ips = [r.to_text() for r in ans]
            info["resolved_ips"] = ips
            if ips:
                info["primary_ip"] = ips[0]
        except Exception:
            try:
                addrs = socket.gethostbyname_ex(clean_dom)
                info["resolved_ips"] = addrs[2]
                if addrs[2]:
                    info["primary_ip"] = addrs[2][0]
            except Exception:
                pass

        primary_ip = info["primary_ip"]
        if not primary_ip:
            return info

        # 2. Reverse DNS hostname
        try:
            host, _, _ = socket.gethostbyaddr(primary_ip)
            info["reverse_dns"] = host
        except Exception:
            pass

        # 3. ASN Resolution via Cymru DNS TXT queries (RFC DNS protocol)
        if not primary_ip.startswith(("127.", "10.", "192.168.", "172.16.", "172.17.", "172.18.", "172.19.", "172.2", "172.3")):
            try:
                rev = ".".join(reversed(primary_ip.split("."))) + ".origin.asn.cymru.com"
                txt_ans = resolver.resolve(rev, "TXT")
                for r in txt_ans:
                    txt = r.to_text().strip('"')
                    parts = [p.strip() for p in txt.split("|")]
                    if len(parts) >= 3:
                        asn_num = parts[0]
                        info["asn"] = f"AS{asn_num}"
                        info["cidr"] = parts[1]
                        info["country"] = parts[2]

                        # Query AS Name
                        try:
                            as_ans = resolver.resolve(f"AS{asn_num}.asn.cymru.com", "TXT")
                            for r2 in as_ans:
                                as_txt = r2.to_text().strip('"')
                                as_parts = [p.strip() for p in as_txt.split("|")]
                                if len(as_parts) >= 5:
                                    info["as_name"] = as_parts[4]
                        except Exception:
                            pass
                        break
            except Exception:
                pass

        return info

    def get_deep_whois(self, domain: str, timeout: float = 3.0) -> dict[str, Any]:
        """
        Retrieves registrar name, creation date, expiration date,
        nameservers, and domain status using RDAP with fallback to python-whois.
        """
        info: dict[str, Any] = {
            "registrar": None,
            "creation_date": None,
            "expiration_date": None,
            "domain_age_days": -1.0,
            "time_to_expiry_days": -1.0,
            "status": [],
            "name_servers": [],
            "source": "Unavailable",
        }

        clean_dom = _clean_domain(domain)
        if not clean_dom or "localhost" in clean_dom or re.match(r"^\d{1,3}(\.\d{1,3}){3}$", clean_dom):
            return info

        registrable = _get_registrable_domain(clean_dom)

        # 1. Primary: RDAP (HTTPS JSON query, RFC 7480)
        try:
            req = urllib.request.Request(
                f"https://rdap.org/domain/{registrable}",
                headers={"User-Agent": self.user_agent, "Accept": "application/json"}
            )
            # Default opener automatically follows 302 redirects to registry RDAP
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                if resp.status == 200 or resp.getcode() == 200:
                    raw_data = resp.read().decode("utf-8")
                    data = json.loads(raw_data)
                    info["source"] = "RDAP"

                    # Registrar entity
                    for ent in data.get("entities", []):
                        roles = ent.get("roles", [])
                        if "registrar" in roles:
                            vcard = ent.get("vcardArray", [])
                            if len(vcard) > 1 and isinstance(vcard[1], list):
                                for item in vcard[1]:
                                    if isinstance(item, list) and len(item) > 3 and item[0] == "fn":
                                        info["registrar"] = item[3]
                                        break

                    # Registration & Expiration events
                    now = datetime.datetime.now(timezone.utc)
                    for ev in data.get("events", []):
                        action = ev.get("eventAction")
                        date_str = ev.get("eventDate")
                        if action == "registration" and date_str:
                            info["creation_date"] = date_str
                            try:
                                dt = datetime.datetime.fromisoformat(date_str.replace("Z", "+00:00"))
                                info["domain_age_days"] = float(max(0, (now - dt).days))
                            except Exception:
                                pass
                        elif action == "expiration" and date_str:
                            info["expiration_date"] = date_str
                            try:
                                dt = datetime.datetime.fromisoformat(date_str.replace("Z", "+00:00"))
                                info["time_to_expiry_days"] = float((dt - now).days)
                            except Exception:
                                pass

                    info["status"] = data.get("status", [])
                    info["name_servers"] = [ns.get("ldhName") for ns in data.get("nameservers", []) if ns.get("ldhName")]
                    return info
        except Exception as e:
            logger.debug(f"RDAP lookup skipped or failed for {registrable}: {e}")

        # 2. Fallback: python-whois (Port 43 TCP)
        try:
            import whois
            w = whois.whois(registrable)
            info["source"] = "WHOIS"

            # Registrar
            if isinstance(w.registrar, list) and w.registrar:
                info["registrar"] = str(w.registrar[0])
            elif w.registrar:
                info["registrar"] = str(w.registrar)

            # Dates
            c_date = w.creation_date[0] if isinstance(w.creation_date, list) and w.creation_date else w.creation_date
            e_date = w.expiration_date[0] if isinstance(w.expiration_date, list) and w.expiration_date else w.expiration_date
            now = datetime.datetime.now(timezone.utc)

            if c_date and isinstance(c_date, datetime.datetime):
                c_date = c_date.astimezone(timezone.utc) if c_date.tzinfo else c_date.replace(tzinfo=timezone.utc)
                info["creation_date"] = c_date.isoformat()
                info["domain_age_days"] = float(max(0, (now - c_date).days))

            if e_date and isinstance(e_date, datetime.datetime):
                e_date = e_date.astimezone(timezone.utc) if e_date.tzinfo else e_date.replace(tzinfo=timezone.utc)
                info["expiration_date"] = e_date.isoformat()
                info["time_to_expiry_days"] = float((e_date - now).days)

            if hasattr(w, "name_servers") and w.name_servers:
                ns_list = w.name_servers if isinstance(w.name_servers, list) else [w.name_servers]
                info["name_servers"] = [str(ns).upper() for ns in ns_list if ns]

            if hasattr(w, "status") and w.status:
                st_list = w.status if isinstance(w.status, list) else [w.status]
                info["status"] = [str(st) for st in st_list if st]

        except Exception as e:
            logger.debug(f"WHOIS fallback error for {registrable}: {e}")

        return info

    def inspect_full(self, url: str) -> dict[str, Any]:
        """
        Executes full deep inspection bundle:
        - HTTP Redirect Tracer
        - Deep WHOIS (Registrar & Dates)
        - Hosting & ASN Intelligence
        Results are cached in memory.
        """
        domain = _clean_domain(url)
        now = time.time()

        if domain in _INSPECTION_CACHE:
            ts, cached = _INSPECTION_CACHE[domain]
            if now - ts < _CACHE_TTL:
                return cached.copy()

        redirects = self.trace_redirects(url)
        whois_data = self.get_deep_whois(domain)
        hosting_data = self.get_hosting_asn(domain)

        deep_data = {
            "domain": domain,
            "whois": whois_data,
            "hosting_asn": hosting_data,
            "redirect_trace": redirects,
        }

        _INSPECTION_CACHE[domain] = (now, deep_data.copy())
        return deep_data


inspector_service = InspectorService()
