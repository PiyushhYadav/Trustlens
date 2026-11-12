"""
backend/tests/test_gemini_client.py

Unit tests for GeminiClient with mocked HTTP calls (for CI)
and an optional live test marked with @pytest.mark.live.
Uses standard asyncio.run(...) inside tests for maximum portability across all pytest environments.
"""

import asyncio
import json
import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from backend.gemini_client import GeminiClient


class TestGeminiClientMocked:
    def test_analyze_missing_api_key_returns_none(self):
        async def run():
            client = GeminiClient()
            client.api_key = None
            return await client.analyze("Hello")

        result = asyncio.run(run())
        assert result is None

    def test_analyze_successful_mocked_response(self):
        async def run():
            client = GeminiClient()
            mock_payload = {"clarity_score": 4, "total_score": 16, "summary": "Clear policy", "dpdp_compliant": True}
            gemini_response_body = {
                "candidates": [
                    {
                        "content": {
                            "parts": [
                                {"text": json.dumps(mock_payload)}
                            ]
                        }
                    }
                ]
            }

            mock_resp = MagicMock()
            mock_resp.status_code = 200
            mock_resp.json.return_value = gemini_response_body

            with patch("httpx.AsyncClient.post", new_callable=AsyncMock, return_value=mock_resp):
                return await client.analyze("Test prompt")

        result = asyncio.run(run())
        assert result["total_score"] == 16
        assert result["dpdp_compliant"] is True

    def test_analyze_policy_success(self):
        async def run():
            client = GeminiClient()
            mock_output = {
                "total_score": 15,
                "summary": "Good policy",
                "dpdp_compliant": True,
                "red_flags": [],
                "dpdp_issues": [],
            }

            with patch.object(client, "analyze", new_callable=AsyncMock, return_value=mock_output):
                return await client.analyze_policy("We collect minimal user data and store it safely.")

        result = asyncio.run(run())
        assert result["total_score"] == 15
        assert result["dpdp_compliant"] is True
        assert result["summary"] == "Good policy"

    def test_analyze_policy_fallback_on_failure(self):
        async def run():
            client = GeminiClient()
            with patch.object(client, "analyze", new_callable=AsyncMock, return_value=None):
                return await client.analyze_policy("Sample policy text")

        result = asyncio.run(run())
        assert result["total_score"] == 10
        assert result["dpdp_compliant"] is False
        assert result["source"] == "fallback"
        assert result["verified"] is False

    def test_analyze_complaints_empty_list(self):
        async def run():
            client = GeminiClient()
            return await client.analyze_complaints([], "Zomato")

        result = asyncio.run(run())
        assert result["score"] == 10
        assert result["source"] == "no_data"
        assert result["verified"] is False

    def test_analyze_complaints_mocked_success(self):
        async def run():
            client = GeminiClient()
            mock_complaint = {
                "score": 12,
                "summary": "Few privacy complaints",
                "complaint_categories": ["Spam notifications"],
                "severity": "low",
            }
            with patch.object(client, "analyze", new_callable=AsyncMock, return_value=mock_complaint):
                reviews = [{"score": 1, "text": "Sends too many notifications"}]
                return await client.analyze_complaints(reviews, "TestApp")

        result = asyncio.run(run())
        assert result["score"] == 12
        assert result["max"] == 15
        assert result["verified"] is True
        assert result["source"] == "play_store_reviews"


class TestGeminiClientLive:
    @pytest.mark.live
    def test_live_gemini_call(self):
        """Live test marked with @pytest.mark.live; skipped in CI by default."""
        async def run():
            client = GeminiClient()
            if not client.api_key or client.api_key.startswith("AIzaSyDummy"):
                pytest.skip("No real GEMINI_API_KEY available for live test")
            prompt = "Return JSON with key 'status' equal to 'ok'. ONLY valid JSON."
            return await client.analyze(prompt)

        result = asyncio.run(run())
        assert result is not None
        assert result.get("status") == "ok"
