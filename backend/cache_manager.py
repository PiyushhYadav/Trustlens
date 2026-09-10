"""
backend/cache_manager.py

SQLite-based caching layer with TTL support for scored platform payloads.
Uses an absolute DB path and WAL mode for safe concurrent access.
"""

import json
import os
import sqlite3
import time
from typing import Optional

# Absolute path anchored to this file's directory
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "trustlens.db")

# Default TTL: 6 hours
DEFAULT_TTL = 6 * 60 * 60


def init_db() -> None:
    """Initialize the cache database with TTL support and WAL mode."""
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("PRAGMA journal_mode=WAL;")
        conn.execute("""
            CREATE TABLE IF NOT EXISTS score_cache (
                platform_name TEXT PRIMARY KEY,
                score_data TEXT NOT NULL,
                created_at REAL NOT NULL,
                expires_at REAL NOT NULL
            )
        """)
        conn.commit()


def get_cached_score(platform_name: str) -> Optional[dict]:
    """
    Retrieves a cached score if it exists and hasn't expired.
    Returns None if not found or expired.
    """
    try:
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.execute(
                "SELECT score_data, expires_at FROM score_cache WHERE platform_name = ?",
                (platform_name,),
            )
            row = cursor.fetchone()
            if row:
                score_data, expires_at = row
                if time.time() < expires_at:
                    return json.loads(score_data)
                else:
                    # Expired — clean it up
                    conn.execute(
                        "DELETE FROM score_cache WHERE platform_name = ?",
                        (platform_name,),
                    )
                    conn.commit()
    except Exception as e:
        print(f"[CacheManager] get_cached_score error: {e}")
    return None


def set_cached_score(platform_name: str, score_data: dict, ttl: int = DEFAULT_TTL) -> None:
    """
    Stores a score in the cache with a TTL (time-to-live) in seconds.
    """
    now = time.time()
    try:
        with sqlite3.connect(DB_PATH) as conn:
            conn.execute(
                "INSERT OR REPLACE INTO score_cache (platform_name, score_data, created_at, expires_at) VALUES (?, ?, ?, ?)",
                (platform_name, json.dumps(score_data), now, now + ttl),
            )
            conn.commit()
    except Exception as e:
        print(f"[CacheManager] set_cached_score error: {e}")


def clear_expired() -> int:
    """Remove all expired cache entries. Returns count of removed entries."""
    try:
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.execute(
                "DELETE FROM score_cache WHERE expires_at < ?",
                (time.time(),),
            )
            conn.commit()
            return cursor.rowcount
    except Exception as e:
        print(f"[CacheManager] clear_expired error: {e}")
        return 0


def clear_all() -> None:
    """Clear the entire cache (useful for development)."""
    try:
        with sqlite3.connect(DB_PATH) as conn:
            conn.execute("DELETE FROM score_cache")
            conn.commit()
    except Exception as e:
        print(f"[CacheManager] clear_all error: {e}")
