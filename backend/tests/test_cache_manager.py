"""
backend/tests/test_cache_manager.py

Unit tests for the SQLite-based cache manager.
Uses an isolated temporary database for each test to verify cache operations,
TTL expiration, and cache clearing.
"""

import time
import pytest
import backend.cache_manager as cm


@pytest.fixture(autouse=True)
def isolated_cache(tmp_path, monkeypatch):
    """Point DB_PATH to a temporary database file for the test run."""
    temp_db = str(tmp_path / "test_trustlens.db")
    monkeypatch.setattr(cm, "DB_PATH", temp_db)
    cm.init_db()
    yield temp_db


class TestCacheManagerOperations:
    def test_cache_miss_returns_none(self):
        assert cm.get_cached_score("nonexistent_app") is None

    def test_set_and_get_cached_score(self):
        sample_data = {"score": 85, "grade": "A", "signals": {}}
        cm.set_cached_score("swiggy", sample_data, ttl=3600)
        retrieved = cm.get_cached_score("swiggy")
        assert retrieved == sample_data

    def test_ttl_expiration(self):
        sample_data = {"score": 45, "grade": "C"}
        # 1-second TTL
        cm.set_cached_score("fast_expire", sample_data, ttl=1)
        # Verify it exists immediately
        assert cm.get_cached_score("fast_expire") == sample_data
        # Sleep until expired
        time.sleep(1.2)
        # Should now return None
        assert cm.get_cached_score("fast_expire") is None

    def test_clear_expired(self):
        cm.set_cached_score("app_expired", {"score": 10}, ttl=1)
        cm.set_cached_score("app_valid", {"score": 90}, ttl=3600)
        time.sleep(1.2)
        removed_count = cm.clear_expired()
        assert removed_count >= 1
        assert cm.get_cached_score("app_expired") is None
        assert cm.get_cached_score("app_valid") is not None

    def test_clear_all(self):
        cm.set_cached_score("app_1", {"score": 80}, ttl=3600)
        cm.set_cached_score("app_2", {"score": 70}, ttl=3600)
        cm.clear_all()
        assert cm.get_cached_score("app_1") is None
        assert cm.get_cached_score("app_2") is None
