"""
SentiGuard - FastAPI Backend Entry Point
"""

import uvicorn
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.routes import scan, health
from app.utils.logger import setup_logger

# ─── Logger ──────────────────────────────────────────────
logger = setup_logger("sentiguard.main")

# ─── App Instance ─────────────────────────────────────────
app = FastAPI(
    title="SentiGuard API",
    description="Phishing Detection API using ML + URL Feature Analysis",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─── CORS ─────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],       # In production: replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ──────────────────────────────────────────────
app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(scan.router,   prefix="/api", tags=["Scan"])

# Keep repo-root website support because production serves static frontend from there.
# Note: Render service may track backend directory changes for auto-deploy triggers.
frontend_candidates = [
    Path(__file__).resolve().parent.parent / "website",  # Repo root checkout
    Path(__file__).resolve().parent / "website",         # Railway backend-root copy
]
FRONTEND_DIR = next((p for p in frontend_candidates if p.exists()), None)

if FRONTEND_DIR:
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="frontend")
else:
    logger.warning("Frontend directory not found. Serving API only.")


@app.on_event("startup")
async def on_startup():
    logger.info("SentiGuard API starting up...")
    logger.info("Visit http://localhost:8000/docs for API documentation")


@app.on_event("shutdown")
async def on_shutdown():
    logger.info("SentiGuard API shutting down.")


# ─── Dev Runner ───────────────────────────────────────────
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
