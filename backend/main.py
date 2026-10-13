"""
SentiGuard - Enterprise Threat Intelligence & Phishing Detection API
───────────────────────────────────────────────────────────────────
High-performance REST API backend powering zero-day phishing detection,
sub-2ms reputation caching, live network profiling, rate limiting, and SHAP diagnostics.
"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.routes import health, scan
from app.utils.logger import setup_logger
from app.utils.limiter import limiter
from app.db.session import init_db

logger = setup_logger("sentiguard.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("SentiGuard Threat Intelligence API initializing...")
    try:
        init_db()
        logger.info("SQL database schema initialized successfully.")
    except Exception as e:
        logger.error(f"Failed to initialize database schema: {e}")

    logger.info("Interactive OpenAPI documentation active at /docs and /redoc")
    yield
    logger.info("SentiGuard API shutting down cleanly.")


# ─── FastAPI Application Instance ─────────────────────────────
app = FastAPI(
    title="SentiGuard Threat Intelligence API",
    description="Enterprise ML-Driven Phishing Detection, Network Profiling & Reputation API",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# ─── SlowAPI Rate Limiting ────────────────────────────────────
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ─── CORS Middleware ──────────────────────────────────────────
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "*").strip()
if allowed_origins_env == "*":
    origins = ["*"]
else:
    origins = [o.strip() for o in allowed_origins_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── API Routes ───────────────────────────────────────────────
app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(scan.router,   prefix="/api", tags=["Scan"])


# ─── Root Status Endpoint ─────────────────────────────────────
@app.get("/", tags=["Status"])
def root():
    """Root status endpoint returning service telemetry and available endpoints."""
    return {
        "service": "SentiGuard Threat Intelligence API",
        "status": "online",
        "version": "2.0.0",
        "endpoints": {
            "health": "/api/health",
            "scan_url": "/api/scan/url",
            "scan_qr": "/api/scan/qr",
            "report_dispute": "/api/scan/report",
            "cache_stats": "/api/scan/cache/stats",
            "telemetry_stats": "/api/scan/stats",
            "documentation": "/docs",
            "redoc": "/redoc",
            "openapi_schema": "/openapi.json"
        }
    }


# ─── Standalone Runner ────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
