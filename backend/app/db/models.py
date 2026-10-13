"""
SentiGuard - SQLAlchemy ORM Models
───────────────────────────────────
Schema definitions for scan persistence, threat intelligence telemetry,
and false-positive community dispute feedback loops.
"""

from datetime import datetime, timezone
import json
from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime
from app.db.session import Base


def utc_now():
    return datetime.now(timezone.utc)


class ScanRecord(Base):
    """Stores telemetry for every scanned URL."""
    __tablename__ = "scan_records"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    url = Column(String(2048), index=True, nullable=False)
    verdict = Column(String(32), nullable=False)           # "SAFE" | "PHISHING"
    trust_score = Column(Float, nullable=False)           # 0.0 – 100.0
    confidence = Column(Float, nullable=False)            # 0.0 – 1.0
    risk_factors_json = Column(Text, nullable=True)       # Serialized list[str]
    model_type = Column(String(64), nullable=True)
    has_dns_a_record = Column(Boolean, default=True)
    has_valid_ssl = Column(Boolean, default=True)
    domain_age_days = Column(Float, default=-1.0)
    cached = Column(Boolean, default=False)
    client_ip = Column(String(64), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    @property
    def risk_factors(self) -> list[str]:
        if not self.risk_factors_json:
            return []
        try:
            return json.loads(self.risk_factors_json)
        except Exception:
            return []

    @risk_factors.setter
    def risk_factors(self, value: list[str]):
        self.risk_factors_json = json.dumps(value) if value else "[]"


class DisputeReport(Base):
    """Stores community false-positive and missed threat reports for model retraining."""
    __tablename__ = "dispute_reports"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    url = Column(String(2048), index=True, nullable=False)
    report_type = Column(String(32), nullable=False)      # "FALSE_POSITIVE" | "FALSE_NEGATIVE" | "NEW_THREAT"
    comment = Column(Text, nullable=True)
    contact_email = Column(String(256), nullable=True)
    original_verdict = Column(String(32), nullable=True)
    original_trust_score = Column(Float, nullable=True)
    client_ip = Column(String(64), nullable=True)
    status = Column(String(32), default="PENDING_REVIEW") # "PENDING_REVIEW" | "ACCEPTED" | "REJECTED"
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
