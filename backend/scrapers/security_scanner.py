"""
backend/scrapers/security_scanner.py

Checks website security headers via the MDN HTTP Observatory — the
Mozilla-run successor to the old Mozilla Observatory API.
"""

import httpx

OBSERVATORY_API = "https://observatory-api.mdn.mozilla.net/api/v2/scan"


async def scan_security_headers(domain: str) -> dict:
    if not domain:
        return _fallback_security_score("No domain provided")

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                OBSERVATORY_API,
                params={"host": domain},
                headers={"User-Agent": "TrustLens-Privacy-Auditor/1.0"},
            )
    except httpx.RequestError as e:
        return _fallback_security_score(f"Network error: {e}")

    if resp.status_code != 200:
        return _fallback_security_score(f"HTTP {resp.status_code}")

    result = resp.json()

    if result.get("error"):
        return _fallback_security_score(result.get("message", result["error"]))

    return {
        "observatory_grade": result.get("grade", "F"),
        "security_score": result.get("score", 0),
        "headers_present": result.get("tests_passed", 0),
        "headers_missing": result.get("tests_failed", 0),
        "tests_quantity": result.get("tests_quantity", 0),
        "details_url": result.get("details_url"),
        "source": "mdn_http_observatory",
        "verified": True,
    }


def _fallback_security_score(reason: str) -> dict:
    return {
        "observatory_grade": "N/A",
        "security_score": 0,
        "headers_present": 0,
        "headers_missing": 0,
        "tests_quantity": 0,
        "details_url": None,
        "source": "fallback",
        "verified": False,
        "error_reason": reason,
    }
