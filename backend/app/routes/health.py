"""
SentiGuard - Health Check Route
"""

from fastapi import APIRouter
from datetime import datetime

router = APIRouter()


@router.get("/health")
async def health_check():
    """API health check endpoint."""
    return {
        "status": "ok",
        "service": "SentiGuard API",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }
