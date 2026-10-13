"""
SentiGuard - Database Session & Initialization
─────────────────────────────────────────────
Configures SQLAlchemy connection, session management, and table bootstrap.
Supports SQLite (default) and external PostgreSQL/MySQL via DATABASE_URL.
"""

import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Default to SQLite database located in backend directory
DEFAULT_DB_PATH = Path(__file__).resolve().parent.parent.parent / "sentiguard.db"
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DEFAULT_DB_PATH}")

connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """FastAPI dependency for obtaining a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Creates all database tables if they do not already exist."""
    from app.db.models import ScanRecord, DisputeReport  # noqa: F401
    Base.metadata.create_all(bind=engine)
