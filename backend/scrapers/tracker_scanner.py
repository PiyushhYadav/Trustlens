"""
backend/scrapers/tracker_scanner.py

Fetches real tracker data from Exodus Privacy for a given
Android app handle (e.g. "com.whatsapp").

Operates in dual mode:
1. Official API if EXODUS_API_TOKEN is set.
2. Web scraping fallback (hitting public reports) if no token is available.
"""

import logging
import os
import re
from bs4 import BeautifulSoup

import httpx

logger = logging.getLogger(__name__)

EXODUS_API_URL = "https://reports.exodus-privacy.eu.org/api/search/{app_handle}"
EXODUS_SCRAPE_URL = "https://reports.exodus-privacy.eu.org/en/reports/{app_handle}/latest/"
MAX_SCORE = 15


async def scan_trackers(app_handle: str) -> dict:
    """Query Exodus Privacy for tracker / permission data on *app_handle*.

    Returns a score dict (0-15) with tracker names and permission count.
    Falls back gracefully on network or API errors.
    """
    if not app_handle:
        return _fallback_tracker_score("No app handle provided")

    token = os.getenv("EXODUS_API_TOKEN")
    
    if token:
        logger.info(f"[Exodus] Using official API mode for {app_handle}")
        return await _scan_via_api(app_handle, token)
    else:
        logger.warning(f"[Exodus] No API token. Falling back to public scraping mode for {app_handle}")
        return await _scan_via_scrape(app_handle)


async def _scan_via_api(app_handle: str, token: str) -> dict:
    url = EXODUS_API_URL.format(app_handle=app_handle)
    headers = {
        "User-Agent": "TrustLens-Privacy-Auditor/1.0",
        "Authorization": f"Token {token}"
    }

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(url, headers=headers)
            if resp.status_code == 404:
                return _fallback_tracker_score("Not found in Exodus database")
            resp.raise_for_status()
    except httpx.HTTPStatusError as exc:
        logger.error("Exodus API HTTP error %s for %s", exc.response.status_code, app_handle)
        return _fallback_tracker_score(f"HTTP {exc.response.status_code}")
    except httpx.RequestError as exc:
        logger.error("Exodus API request error for %s: %s", app_handle, exc)
        return _fallback_tracker_score(f"Network error: {exc}")

    try:
        data = resp.json()
    except Exception:
        return _fallback_tracker_score("Invalid JSON response")

    # Response is keyed by package name; each value has a "reports" list.
    reports: list[dict] | None = None
    for _pkg, pkg_data in data.items():
        if isinstance(pkg_data, dict) and "reports" in pkg_data:
            reports = pkg_data["reports"]
            break

    if not reports:
        return _fallback_tracker_score("No reports found for this app")

    latest_report = reports[-1]

    trackers: list[dict] = latest_report.get("trackers", [])
    permissions: list[str] = latest_report.get("permissions", [])

    tracker_count = len(trackers)
    tracker_names = [t["name"] for t in trackers if "name" in t]
    
    return _build_score(tracker_count, tracker_names, len(permissions), "exodus_privacy_api")


async def _scan_via_scrape(app_handle: str) -> dict:
    url = EXODUS_SCRAPE_URL.format(app_handle=app_handle)
    headers = {"User-Agent": "TrustLens-Privacy-Auditor/1.0"}
    
    try:
        async with httpx.AsyncClient(timeout=15, follow_redirects=True) as client:
            resp = await client.get(url, headers=headers)
            if resp.status_code == 404:
                return _fallback_tracker_score("Not found in Exodus database")
            resp.raise_for_status()
    except httpx.HTTPStatusError as exc:
        logger.error("Exodus Scrape HTTP error %s for %s", exc.response.status_code, app_handle)
        return _fallback_tracker_score(f"HTTP {exc.response.status_code}")
    except httpx.RequestError as exc:
        logger.error("Exodus Scrape request error for %s: %s", app_handle, exc)
        return _fallback_tracker_score(f"Network error: {exc}")

    soup = BeautifulSoup(resp.text, 'html.parser')
    
    # Extract trackers
    tracker_nodes = soup.find_all('a', href=re.compile(r'/trackers/\d+/'))
    seen = set()
    unique_trackers = []
    for node in tracker_nodes:
        name = node.text.strip()
        if name and name not in seen:
            seen.add(name)
            unique_trackers.append(name)
            
    # Extract permissions count
    perm_count = 0
    perm_nodes = soup.find_all(string=re.compile(r'^\s*permissions\s*$', re.I))
    for node in perm_nodes:
        parent_text = node.parent.parent.text.strip()
        match = re.match(r'^(\d+)', parent_text)
        if match:
            perm_count = int(match.group(1))
            break

    return _build_score(len(unique_trackers), unique_trackers, perm_count, "exodus_privacy_scrape")


def _build_score(tracker_count: int, tracker_names: list[str], permissions_count: int, source: str) -> dict:
    """Computes the score and builds the result dict given the parsed data."""
    # Scoring: 0 trackers → 15/15, each tracker deducts 1 point, min 0.
    score = max(0, MAX_SCORE - tracker_count)

    # Build human-readable summary
    display_names = tracker_names[:5]
    if tracker_count == 0:
        summary = "No trackers detected — excellent privacy posture."
    else:
        names_str = ", ".join(display_names)
        if tracker_count > 5:
            names_str += f", … (+{tracker_count - 5} more)"
        summary = f"{tracker_count} trackers detected: {names_str}"

    return {
        "score": score,
        "max": MAX_SCORE,
        "summary": summary,
        "tracker_count": tracker_count,
        "tracker_names": display_names,
        "permissions_count": permissions_count,
        "source": source,
        "verified": True,
    }


def _fallback_tracker_score(reason: str) -> dict:
    """Return a neutral fallback score when live data is unavailable."""
    return {
        "score": 10,  # Bumped to 10 for apps not found (benefit of doubt instead of penalizing)
        "max": MAX_SCORE,
        "summary": f"Tracker scan unavailable: {reason}",
        "tracker_count": 0,
        "tracker_names": [],
        "permissions_count": 0,
        "source": "fallback",
        "verified": False,
        "error_reason": reason,
    }
