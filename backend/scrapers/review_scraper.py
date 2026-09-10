"""
backend/scrapers/review_scraper.py

Scrapes real Google Play Store reviews for an Android app and filters
for privacy-related user complaints.
"""

import asyncio
import logging
from datetime import datetime

from google_play_scraper import reviews, Sort

logger = logging.getLogger(__name__)

PRIVACY_KEYWORDS: list[str] = [
    "privacy", "data", "tracking", "permission", "spam", "calls", "ads",
    "personal", "leak", "breach", "share", "sell", "third party", "otp",
    "sms", "contact", "location", "camera", "microphone", "surveillance",
]

MAX_PRIVACY_REVIEWS = 20


def _is_privacy_related(text: str) -> bool:
    """Return True if the review text mentions any privacy keyword."""
    lower = text.lower()
    return any(kw in lower for kw in PRIVACY_KEYWORDS)


async def scrape_reviews(app_handle: str, count: int = 100) -> dict:
    """Fetch up to *count* newest Play Store reviews and surface privacy ones.

    Returns a dict with filtered privacy reviews, counts, and avg rating.
    """
    if not app_handle:
        return _fallback_reviews("No app handle provided")

    try:
        result, _continuation = await asyncio.to_thread(
            reviews,
            app_handle,
            lang="en",
            country="in",
            sort=Sort.NEWEST,
            count=count,
        )
    except Exception as exc:
        logger.error("Failed to scrape reviews for %s: %s", app_handle, exc)
        return _fallback_reviews(f"Scraping error: {exc}")

    if not result:
        return _fallback_reviews("No reviews returned")

    privacy_reviews: list[dict] = []
    total_score = 0

    for rev in result:
        total_score += rev.get("score", 0)
        text = rev.get("content", "")
        if _is_privacy_related(text):
            date_val = rev.get("at")
            if isinstance(date_val, datetime):
                date_str = date_val.strftime("%Y-%m-%d")
            else:
                date_str = str(date_val) if date_val else ""

            privacy_reviews.append({
                "text": text[:300],
                "score": rev.get("score", 0),
                "date": date_str,
            })

    # Cap at top MAX_PRIVACY_REVIEWS
    privacy_reviews = privacy_reviews[:MAX_PRIVACY_REVIEWS]

    avg_rating = round(total_score / len(result), 2) if result else 0.0

    return {
        "reviews": privacy_reviews,
        "privacy_complaint_count": len(privacy_reviews),
        "total_reviewed": len(result),
        "avg_rating": avg_rating,
        "source": "google_play_store",
        "verified": True,
    }


def _fallback_reviews(reason: str) -> dict:
    """Return an empty fallback when review scraping fails."""
    return {
        "reviews": [],
        "privacy_complaint_count": 0,
        "total_reviewed": 0,
        "avg_rating": 0.0,
        "source": "fallback",
        "verified": False,
        "error_reason": reason,
    }
