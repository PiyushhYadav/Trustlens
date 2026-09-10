"""
backend/scrapers/breach_scanner.py

Checks real breach history for a domain via the Have I Been Pwned
(HIBP) free breaches-by-domain API.
"""

import asyncio
import logging

import httpx

logger = logging.getLogger(__name__)

HIBP_API_URL = "https://haveibeenpwned.com/api/v3/breaches"
MAX_SCORE = 30


async def scan_breaches(domain: str) -> dict:
    """Query HIBP for known data breaches associated with *domain*.

    Scoring starts at 30 and deducts points based on breach severity:
    - Critical (>10 M records): −10
    - Major   (>100 K records): −5
    - Minor   (≤100 K records): −2

    Returns a score dict with breach details (top 5).
    """
    if not domain:
        return _fallback_breach_score("No domain provided")

    headers = {"User-Agent": "TrustLens-Privacy-Auditor/1.0"}
    params = {"Domain": domain}

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(HIBP_API_URL, headers=headers, params=params)

            # Handle rate-limiting: sleep and retry once
            if resp.status_code == 429:
                logger.warning("HIBP rate-limited — retrying after 2 s")
                await asyncio.sleep(2)
                resp = await client.get(HIBP_API_URL, headers=headers, params=params)

            # 404 means no breaches found — great news
            if resp.status_code == 404:
                return {
                    "score": MAX_SCORE,
                    "max": MAX_SCORE,
                    "summary": f"No known breaches found for {domain}",
                    "breach_count": 0,
                    "breaches": [],
                    "source": "haveibeenpwned",
                    "verified": True,
                }

            resp.raise_for_status()
    except httpx.HTTPStatusError as exc:
        logger.error("HIBP HTTP error %s for %s", exc.response.status_code, domain)
        return _fallback_breach_score(f"HTTP {exc.response.status_code}")
    except httpx.RequestError as exc:
        logger.error("HIBP request error for %s: %s", domain, exc)
        return _fallback_breach_score(f"Network error: {exc}")

    try:
        breaches: list[dict] = resp.json()
    except Exception:
        return _fallback_breach_score("Invalid JSON response")

    if not isinstance(breaches, list):
        return _fallback_breach_score("Unexpected response format")

    # --- Scoring ---
    score = MAX_SCORE
    for b in breaches:
        pwn_count = b.get("PwnCount", 0)
        if pwn_count > 10_000_000:
            score -= 10  # critical
        elif pwn_count > 100_000:
            score -= 5   # major
        else:
            score -= 2   # minor
    score = max(0, score)

    # Build top-5 breach summaries
    top_breaches = [
        {
            "name": b.get("Name", "Unknown"),
            "date": b.get("BreachDate", "Unknown"),
            "records": b.get("PwnCount", 0),
            "data_classes": b.get("DataClasses", []),
            "is_verified": b.get("IsVerified", False),
        }
        for b in breaches[:5]
    ]

    breach_count = len(breaches)
    summary_parts = [f"{breach_count} breach(es) found for {domain}"]
    for tb in top_breaches[:3]:
        summary_parts.append(f"  • {tb['name']} ({tb['date']}, {tb['records']:,} records)")
    summary = "\n".join(summary_parts)

    return {
        "score": score,
        "max": MAX_SCORE,
        "summary": summary,
        "breach_count": breach_count,
        "breaches": top_breaches,
        "source": "haveibeenpwned",
        "verified": True,
    }


def _fallback_breach_score(reason: str) -> dict:
    """Return a neutral fallback score when live breach data is unavailable."""
    return {
        "score": 15,
        "max": MAX_SCORE,
        "summary": f"Breach data unavailable — {reason}",
        "breach_count": 0,
        "breaches": [],
        "source": "fallback",
        "verified": False,
        "error_reason": reason,
    }
