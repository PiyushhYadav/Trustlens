"""
backend/scrapers/policy_scraper.py

Finds and scrapes the actual privacy policy text for any platform,
using known URLs or Play Store metadata as a fallback discovery mechanism.
"""

import asyncio
import logging

import httpx
from bs4 import BeautifulSoup
from google_play_scraper import app as gplay_app

logger = logging.getLogger(__name__)

MAX_POLICY_LENGTH = 8000

KNOWN_POLICY_URLS: dict[str, str] = {
    "zomato": "https://www.zomato.com/privacy",
    "swiggy": "https://www.swiggy.com/privacy-policy",
    "instagram": "https://privacycenter.instagram.com/policy",
    "paytm": "https://paytm.com/about-us/privacy-policy",
    "flipkart": "https://www.flipkart.com/pages/privacypolicy",
    "phonepe": "https://www.phonepe.com/privacy-policy/",
    "ola": "https://www.olacabs.com/privacy",
    "bigbasket": "https://www.bigbasket.com/privacy-policy/",
    "cred": "https://cred.club/privacy",
    "myntra": "https://www.myntra.com/privacypolicy",
    "nykaa": "https://www.nykaa.com/privacy-policy",
    "uber": "https://www.uber.com/legal/en/document/?name=privacy-notice",
    "whatsapp": "https://www.whatsapp.com/legal/privacy-policy",
}


async def scrape_privacy_policy(
    platform_name: str, known_url: str | None = None
) -> str | None:
    """Fetch and return the plain-text privacy policy for *platform_name*.

    Resolution order:
    1. *known_url* if explicitly provided.
    2. ``KNOWN_POLICY_URLS`` lookup by normalised platform name.
    3. ``None`` — caller may try ``discover_policy_url_from_playstore`` separately.

    Returns up to 8 000 characters of cleaned text, or ``None`` on failure.
    """
    url = known_url or KNOWN_POLICY_URLS.get(platform_name.lower().strip())

    if not url:
        logger.info("No known policy URL for '%s'", platform_name)
        return None

    try:
        async with httpx.AsyncClient(
            timeout=15,
            follow_redirects=True,
        ) as client:
            resp = await client.get(
                url,
                headers={"User-Agent": "TrustLens-Privacy-Auditor/1.0"},
            )
            resp.raise_for_status()
    except Exception as exc:
        logger.error("Failed to fetch policy from %s: %s", url, exc)
        return None

    try:
        soup = BeautifulSoup(resp.text, "html.parser")

        # Remove non-content tags
        for tag in soup.find_all(["script", "style", "nav", "footer", "header", "aside"]):
            tag.decompose()

        text = soup.get_text(separator="\n", strip=True)
        return text[:MAX_POLICY_LENGTH] if text else None
    except Exception as exc:
        logger.error("Failed to parse policy HTML from %s: %s", url, exc)
        return None


async def discover_policy_url_from_playstore(app_handle: str) -> str | None:
    """Look up the ``privacyPolicy`` field from a Play Store app listing.

    Uses ``google_play_scraper.app()`` (synchronous) wrapped in
    ``asyncio.to_thread`` so we don't block the event loop.

    Returns the URL string or ``None``.
    """
    if not app_handle:
        return None

    try:
        details = await asyncio.to_thread(gplay_app, app_handle)
        return details.get("privacyPolicy")
    except Exception as exc:
        logger.error(
            "Failed to discover policy URL from Play Store for %s: %s",
            app_handle,
            exc,
        )
        return None
