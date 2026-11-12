"""
backend/tests/test_pipeline.py

Refactored functional tests for the TrustLens analysis pipeline.
Replaces root test_pipeline.py, test_score.py, test_score2.py, and test_score3.py.
Mocks external scrapers and Gemini AI to guarantee deterministic execution without network.
"""

import pytest
from unittest.mock import AsyncMock, patch
from backend.main import get_score
from backend.gemini_client import GeminiClient
from backend.platform_resolver import resolve_platform


@pytest.mark.asyncio
async def test_pipeline_with_mocked_services():
    """Verifies the complete scoring pipeline end-to-end with mocked services."""
    mock_tracker = {"score": 12, "max": 15, "summary": "Trackers found: 2", "source": "exodus", "verified": True}
    mock_breach = {"score": 25, "max": 30, "summary": "Clean breach record", "source": "hibp", "verified": True}
    mock_security = {"observatory_grade": "B", "security_score": 65, "source": "observatory", "verified": True}
    mock_reviews = ({"reviews": [{"score": 1, "text": "Privacy issue"}]}, {"score": 11, "max": 15, "summary": "Few issues", "source": "play_store", "verified": True})
    mock_policy = {
        "total_score": 16,
        "summary": "Clear data retention policy",
        "dpdp_compliant": True,
        "dpdp_issues": [],
        "source": "gemini_ai",
        "verified": True,
    }

    with patch("backend.main.get_cached_score", return_value=None), \
         patch("backend.main.set_cached_score"), \
         patch("backend.main.scan_trackers", new_callable=AsyncMock, return_value=mock_tracker), \
         patch("backend.main.scan_breaches", new_callable=AsyncMock, return_value=mock_breach), \
         patch("backend.main.scan_security_headers", new_callable=AsyncMock, return_value=mock_security), \
         patch("backend.main.scrape_privacy_policy", new_callable=AsyncMock, return_value="Sample policy text"), \
         patch.object(GeminiClient, "analyze_policy", new_callable=AsyncMock, return_value=mock_policy), \
         patch("backend.main.scrape_reviews", new_callable=AsyncMock, return_value={"reviews": []}), \
         patch.object(GeminiClient, "analyze_complaints", new_callable=AsyncMock, return_value=mock_reviews[1]):

        result = await get_score("zomato")

        assert result is not None
        assert "score" in result
        assert "grade" in result
        assert "signals" in result

        signals = result["signals"]
        assert "breach" in signals
        assert "policy" in signals
        assert "compliance" in signals
        assert "complaint" in signals
        assert "tracker" in signals

        assert signals["policy"]["score"] == 16
        assert signals["compliance"]["compliant"] is True
        assert signals["policy"]["is_fallback"] is False


@pytest.mark.asyncio
async def test_pipeline_fallback_when_gemini_unavailable():
    """
    Refactored from test_score3.py:
    Ensures that when Gemini is unreachable (returns None), the pipeline
    falls back gracefully without crashing, setting is_fallback = True.
    """
    with patch("backend.main.get_cached_score", return_value=None), \
         patch("backend.main.set_cached_score"), \
         patch.object(GeminiClient, "analyze", new_callable=AsyncMock, return_value=None):

        result = await get_score("zomato")

        assert result is not None
        compliance_signal = result["signals"]["compliance"]
        assert compliance_signal["is_fallback"] is True
        assert "unavailable" in compliance_signal["summary"].lower()


@pytest.mark.asyncio
async def test_platform_resolver_known_platform():
    """Verifies that platform_resolver maps known names to registry entries."""
    info = await resolve_platform("zomato")
    assert info is not None
    assert info["display_name"] == "Zomato"
    assert "zomato.com" in info["domain"]
    assert "com.application.zomato" in info["android_package"]
