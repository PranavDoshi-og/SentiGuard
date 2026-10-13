"""
SentiGuard - Reputation & Scan Cache Service
────────────────────────────────────────────
Sub-2ms caching layer utilizing cachetools.TTLCache with optional Redis support.
Stores verdicts, trust scores, risk factors, and SHAP explainability diagnostics.
"""

import json
import os
import threading
import time
from urllib.parse import urlparse
from cachetools import TTLCache

from app.utils.logger import setup_logger

logger = setup_logger("sentiguard.services.cache")


def normalize_cache_key(url: str) -> str:
    """
    Normalizes a URL string for consistent cache key generation:
    - Lowercases scheme and netloc
    - Strips default ports (80 for http, 443 for https)
    - Strips trailing slash on root paths
    """
    url = url.strip()
    try:
        parsed = urlparse(url)
        scheme = (parsed.scheme or "http").lower()
        netloc = parsed.netloc.lower()

        # Remove default ports
        if netloc.endswith(":80") and scheme == "http":
            netloc = netloc[:-3]
        elif netloc.endswith(":443") and scheme == "https":
            netloc = netloc[:-4]

        path = parsed.path
        if path == "/":
            path = ""
        elif path.endswith("/") and len(path) > 1:
            path = path[:-1]

        query = parsed.query
        normalized = f"{scheme}://{netloc}{path}"
        if query:
            normalized = f"{normalized}?{query}"
        return normalized
    except Exception:
        return url.lower()


class ReputationCache:
    """
    Hybrid cache providing sub-2ms in-memory lookups via TTLCache,
    with transparent Redis fallback if REDIS_URL is provided in environment.
    """

    def __init__(
        self,
        maxsize: int | None = None,
        ttl_seconds: int | None = None,
    ):
        self.maxsize = maxsize or int(os.getenv("CACHE_MAXSIZE", "5000"))
        self.ttl = ttl_seconds or int(os.getenv("CACHE_TTL_SECONDS", "3600"))

        self._lock = threading.Lock()
        self._memory_cache = TTLCache(maxsize=self.maxsize, ttl=self.ttl)
        self._redis_client = None
        self._backend = "memory"

        self.hits = 0
        self.misses = 0

        # Attempt optional Redis initialization if configured
        redis_url = os.getenv("REDIS_URL")
        if redis_url:
            try:
                import redis
                self._redis_client = redis.from_url(redis_url, socket_timeout=2.0)
                self._redis_client.ping()
                self._backend = "redis"
                logger.info(f"Connected to Redis cache at {redis_url}")
            except Exception as e:
                logger.warning(f"Redis configured but unreachable ({e}). Falling back to in-memory TTLCache.")
                self._redis_client = None
                self._backend = "memory"
        else:
            logger.info(f"Initialized in-memory TTLCache (maxsize={self.maxsize}, ttl={self.ttl}s)")

    def get(self, url: str) -> dict | None:
        """Retrieve a cached scan result. Returns None on cache miss."""
        key = normalize_cache_key(url)
        start_time = time.perf_counter()

        # 1. Check Redis if active
        if self._redis_client:
            try:
                raw = self._redis_client.get(f"sg:scan:{key}")
                if raw:
                    self.hits += 1
                    data = json.loads(raw)
                    latency_ms = (time.perf_counter() - start_time) * 1000.0
                    data["cached"] = True
                    data["cache_latency_ms"] = round(latency_ms, 3)
                    return data
            except Exception as e:
                logger.warning(f"Redis get error: {e}. Falling back to memory.")

        # 2. Check in-memory TTLCache
        with self._lock:
            if key in self._memory_cache:
                self.hits += 1
                result = dict(self._memory_cache[key])
                latency_ms = (time.perf_counter() - start_time) * 1000.0
                result["cached"] = True
                result["cache_latency_ms"] = round(latency_ms, 3)
                return result

            self.misses += 1
            return None

    def set(self, url: str, result: dict, ttl_override: int | None = None) -> None:
        """Store a scan result in cache."""
        key = normalize_cache_key(url)
        ttl = ttl_override or self.ttl

        # Save to memory cache (create copy without cached/latency flags)
        payload = dict(result)
        payload.pop("cached", None)
        payload.pop("cache_latency_ms", None)

        with self._lock:
            self._memory_cache[key] = payload

        # Save to Redis if available
        if self._redis_client:
            try:
                self._redis_client.setex(
                    f"sg:scan:{key}",
                    ttl,
                    json.dumps(payload, default=str),
                )
            except Exception as e:
                logger.warning(f"Redis set error: {e}")

    def clear(self) -> None:
        """Purge all entries from the cache."""
        with self._lock:
            self._memory_cache.clear()
            self.hits = 0
            self.misses = 0

        if self._redis_client:
            try:
                # Flush keys matching prefix
                keys = self._redis_client.keys("sg:scan:*")
                if keys:
                    self._redis_client.delete(*keys)
            except Exception as e:
                logger.warning(f"Redis clear error: {e}")

        logger.info("Reputation cache purged successfully.")

    def stats(self) -> dict:
        """Return cache health telemetry and performance metrics."""
        with self._lock:
            total_queries = self.hits + self.misses
            hit_ratio = round((self.hits / total_queries * 100.0), 1) if total_queries > 0 else 0.0

            return {
                "backend": self._backend,
                "current_size": len(self._memory_cache),
                "max_size": self.maxsize,
                "ttl_seconds": self.ttl,
                "hits": self.hits,
                "misses": self.misses,
                "total_queries": total_queries,
                "hit_ratio_percent": hit_ratio,
            }


# Global singleton cache instance
reputation_cache = ReputationCache()
