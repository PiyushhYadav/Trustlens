"""
backend/tests/test_api_endpoints.py

FastAPI endpoint integration tests using Starlette TestClient.
All external scrapers, cache, and Gemini calls are mocked so these tests
run completely offline without network or secrets.
"""

import pytest
from unittest.mock import AsyncMock, patch
from fastapi.testclient import TestClient

MOCK_PAYLOAD = {
    "score": 78,
    "grade": "B",
    "grade_desc": "Acceptable",
    "dpdp_compliant": True,
    "signals": {
        "breach": {"score": 25, "max": 30, "summary": "No breaches", "source": "hibp", "verified": True, "is_fallback": False},
        "policy": {"score": 15, "max": 20, "summary": "Good policy", "source": "gemini_ai", "verified": True, "is_fallback": False},
        "compliance": {"score": 20, "max": 25, "summary": "DPDP Compliant", "source": "gemini_ai", "verified": True, "is_fallback": False, "compliant": True, "issues": []},
        "complaint": {"score": 10, "max": 15, "summary": "Few complaints", "source": "play_store", "verified": True, "is_fallback": False},
        "tracker": {"score": 8, "max": 15, "summary": "2 trackers", "source": "exodus", "verified": True, "is_fallback": False},
    },
    "action_steps": ["Check permissions."],
    "trend": [70] * 12,
    "alternative": None,
    "description": "Mocked test platform description.",
    "sources": {},
    "analyzed_at": "2026-11-12T00:00:00Z",
    "platform_info": {
        "display_name": "Zomato",
        "category": "food",
        "domain": "zomato.com",
        "android_package": "com.application.zomato",
        "policy_url": "https://zomato.com/privacy",
    },
}


@pytest.fixture
def client():
    """Create a test client with lifespan hooks initialized safely."""
    with patch("backend.cache_manager.init_db"), patch("backend.cache_manager.clear_expired"):
        from backend.main import app
        with TestClient(app) as test_client:
            yield test_client


class TestAPIEndpoints:
    def test_health_check(self, client):
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["version"] == "2.0.0"
        assert "TrustLens" in data["status"]

    def test_list_platforms(self, client):
        response = client.get("/platforms")
        assert response.status_code == 200
        data = response.json()
        assert "platforms" in data
        assert "total" in data
        assert isinstance(data["platforms"], list)
        assert data["total"] > 0

    def test_score_empty_platform_returns_422(self, client):
        response = client.get("/score?platform=")
        assert response.status_code == 422

    def test_score_cached_response(self, client):
        with patch("backend.main.get_cached_score", return_value=MOCK_PAYLOAD):
            response = client.get("/score?platform=zomato")
            assert response.status_code == 200
            assert response.json()["score"] == 78
            assert response.json()["grade"] == "B"

    def test_score_unknown_platform_returns_404(self, client):
        with patch("backend.main.get_cached_score", return_value=None), \
             patch("backend.main.resolve_platform", new_callable=AsyncMock, return_value=None):
            response = client.get("/score?platform=definitelyunknownapp123456")
            assert response.status_code == 404

    def test_score_by_domain_empty_returns_422(self, client):
        response = client.get("/score-by-domain?domain=")
        assert response.status_code == 422

    def test_score_by_domain_unknown_returns_404(self, client):
        response = client.get("/score-by-domain?domain=completelyunregistereddomain.xyz")
        assert response.status_code == 404

    def test_score_by_domain_known_platform(self, client):
        with patch("backend.main.get_score", new_callable=AsyncMock, return_value=MOCK_PAYLOAD):
            response = client.get("/score-by-domain?domain=zomato.com")
            assert response.status_code == 200
            assert response.json()["score"] == 78

    def test_clear_cache_endpoint(self, client):
        with patch("backend.cache_manager.clear_all"):
            response = client.post("/clear-cache")
            assert response.status_code == 200
            assert response.json()["status"] == "success"

    def test_pdf_report_generation(self, client):
        """Replaces ad-hoc test_pdf.py and test_pdf2.py."""
        with patch("backend.main.get_score", new_callable=AsyncMock, return_value=MOCK_PAYLOAD):
            response = client.get("/report/zomato")
            assert response.status_code == 200
            assert response.headers["content-type"] == "application/pdf"
            assert len(response.content) > 100
