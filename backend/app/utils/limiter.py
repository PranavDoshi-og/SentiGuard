"""
SentiGuard - SlowAPI Rate Limiter Configuration
───────────────────────────────────────────────
Defines rate limiting keys and thresholds for scan endpoints and abuse prevention.
Handles real client IP extraction behind reverse proxies (Cloudflare, Render, etc.).
"""

import os
from fastapi import Request
from slowapi import Limiter
from slowapi.util import get_remote_address


def get_real_client_ip(request: Request) -> str:
    """
    Extract the real client IP address, respecting reverse proxy headers:
    1. CF-Connecting-IP (Cloudflare)
    2. X-Forwarded-For (First non-trusted IP)
    3. Direct client host
    """
    cf_ip = request.headers.get("cf-connecting-ip")
    if cf_ip:
        return cf_ip.strip()

    xff = request.headers.get("x-forwarded-for")
    if xff:
        # First IP in comma-separated chain is the original client
        return xff.split(",")[0].strip()

    if request.client and request.client.host:
        return request.client.host

    return get_remote_address(request)


DEFAULT_RATE_LIMIT = os.getenv("RATE_LIMIT_PER_MINUTE", "60/minute")

limiter = Limiter(
    key_func=get_real_client_ip,
    default_limits=[DEFAULT_RATE_LIMIT],
    headers_enabled=False,
    storage_uri=os.getenv("REDIS_URL", "memory://"),
)
