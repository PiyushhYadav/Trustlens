"""
backend/main.py

TrustLens FastAPI application — live privacy auditing for any platform.
Runs all scrapers in parallel, analyzes with Gemini AI, and returns
real, verifiable trust scores.
"""

import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from backend.cache_manager import init_db, get_cached_score, set_cached_score, clear_expired
from backend.demo_data import DEMO_PLATFORMS
from backend.gemini_client import GeminiClient
from backend.platform_resolver import resolve_platform, get_known_platforms
from backend.scoring_engine import calculate_score
from backend.scrapers.tracker_scanner import scan_trackers
from backend.scrapers.review_scraper import scrape_reviews
from backend.scrapers.policy_scraper import scrape_privacy_policy, discover_policy_url_from_playstore
from backend.scrapers.breach_scanner import scan_breaches
from backend.scrapers.security_scanner import scan_security_headers

# Shared Gemini client instance
gemini = GeminiClient()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database and clean expired cache on startup."""
    init_db()
    clear_expired()
    yield


app = FastAPI(
    title="TrustLens API",
    description="Trust and privacy auditing platform for India's digital ecosystem.",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS — restrict in production, open for dev/demo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,  # Fixed: can't use True with wildcard origins
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def health_check():
    """Health check endpoint."""
    return {"status": "TrustLens API is live", "version": "2.0.0"}


@app.get("/score")
async def get_score(platform: str):
    """
    Main scoring endpoint. Analyzes any platform using live data scrapers.

    Pipeline:
    1. Check cache
    2. Resolve platform identifiers
    3. Run all scrapers in parallel (Exodus, HIBP, Play Store, policy scraper, Observatory)
    4. Analyze scraped data with Gemini AI
    5. Compute composite score
    6. Cache and return
    """
    normalized = platform.strip().lower()

    if not normalized:
        raise HTTPException(status_code=422, detail="Platform name cannot be empty.")

    # 1. Check cache
    cached = get_cached_score(normalized)
    if cached:
        return cached

    # 2. Check demo data fast-path (disabled to force live data pipeline)
    # if normalized in DEMO_PLATFORMS:
    #     demo_entry = DEMO_PLATFORMS[normalized]
    #     result = calculate_score(
    #         sub_scores=_deep_copy_subscores(demo_entry["sub_scores"]),
    #         action_steps=list(demo_entry["action_steps"]),
    #         trend=list(demo_entry["trend"]),
    #         description=demo_entry.get("description", ""),
    #     )
    #     set_cached_score(normalized, result)
    #     return result

    # 3. Resolve platform identifiers
    platform_info = await resolve_platform(normalized, gemini)
    if not platform_info:
        raise HTTPException(
            status_code=404,
            detail=f"Platform '{platform}' not recognized. Try a popular app name like 'zomato', 'instagram', or 'paytm'.",
        )

    android_pkg = platform_info.get("android_package", "")
    domain = platform_info.get("domain", "")
    policy_url = platform_info.get("policy_url")
    display_name = platform_info.get("display_name", platform.title())

    # 4. Run all scrapers in parallel
    tracker_task = scan_trackers(android_pkg) if android_pkg else _empty_tracker()
    review_task = scrape_reviews(android_pkg) if android_pkg else _empty_reviews()
    breach_task = scan_breaches(domain) if domain else _empty_breach()
    security_task = scan_security_headers(domain) if domain else _empty_security()

    # Discover policy URL from Play Store if not known
    if not policy_url and android_pkg:
        policy_url = await discover_policy_url_from_playstore(android_pkg)

    policy_task = scrape_privacy_policy(normalized, policy_url) if policy_url else _no_policy()

    # Gather all results — don't let one failure kill the pipeline
    results = await asyncio.gather(
        tracker_task,
        review_task,
        breach_task,
        security_task,
        policy_task,
        return_exceptions=True,
    )

    tracker_data = results[0] if not isinstance(results[0], Exception) else _fallback("tracker", results[0])
    review_data = results[1] if not isinstance(results[1], Exception) else _fallback("review", results[1])
    breach_data = results[2] if not isinstance(results[2], Exception) else _fallback("breach", results[2])
    security_data = results[3] if not isinstance(results[3], Exception) else _fallback("security", results[3])
    policy_text = results[4] if not isinstance(results[4], Exception) else None

    # 5. AI analysis of scraped data
    # Policy analysis via Gemini
    if policy_text and isinstance(policy_text, str):
        policy_analysis = await gemini.analyze_policy(policy_text)
    else:
        policy_analysis = gemini._fallback_policy_score()

    # Complaint analysis via Gemini (using real reviews)
    reviews_list = review_data.get("reviews", []) if isinstance(review_data, dict) else []
    complaint_analysis = await gemini.analyze_complaints(reviews_list, display_name)

    # Derive DPDP compliance from policy analysis
    dpdp_compliant = policy_analysis.get("dpdp_compliant", False)
    dpdp_issues = policy_analysis.get("dpdp_issues", [])
    dpdp_score = 16 if dpdp_compliant else max(5, 20 - len(dpdp_issues) * 3)

    # 6. Assemble sub_scores
    sub_scores = {
        "breach": breach_data if isinstance(breach_data, dict) and "score" in breach_data else {
            "score": 15, "max": 30, "summary": "Breach data unavailable.", "source": "fallback", "verified": False,
        },
        "policy": {
            "score": policy_analysis.get("total_score", 10),
            "max": 20,
            "summary": policy_analysis.get("summary", "Policy analysis unavailable."),
            "red_flags": policy_analysis.get("red_flags", []),
            "source": policy_analysis.get("source", "gemini_ai"),
            "verified": policy_analysis.get("source") != "fallback",
        },
        "compliance": {
            "score": dpdp_score,
            "max": 20,
            "summary": "DPDP Act 2023 Compliant" if dpdp_compliant else f"DPDP Non-Compliant: {len(dpdp_issues)} issue(s) found",
            "compliant": dpdp_compliant,
            "issues": dpdp_issues,
            "source": "gemini_ai_policy_analysis",
            "verified": policy_analysis.get("source") != "fallback",
        },
        "complaint": complaint_analysis,
        "tracker": tracker_data if isinstance(tracker_data, dict) and "score" in tracker_data else {
            "score": 8, "max": 15, "summary": "Tracker data unavailable.", "source": "fallback", "verified": False,
        },
    }

    # Build the result
    description_text = (
        f"{display_name} — {platform_info.get('category', 'Digital Platform')}. "
        f"Live privacy audit powered by Exodus Privacy, Have I Been Pwned, "
        f"Google Play Store reviews, and Gemini AI."
    )

    result = calculate_score(
        sub_scores=sub_scores,
        action_steps=[],  # Auto-generated by scoring_engine
        trend=[],  # No historical data for live-analyzed platforms
        description=description_text,
        platform_info=platform_info,
    )

    # Add security scan as supplementary data (not part of the 100-point score)
    if isinstance(security_data, dict):
        result["security_headers"] = security_data

    # Cache for 6 hours
    set_cached_score(normalized, result, ttl=21600)
    return result


@app.get("/platforms")
def list_platforms():
    """Returns all pre-mapped platforms and their categories."""
    from backend.platform_resolver import PLATFORM_REGISTRY

    platforms = []
    seen = set()
    for key, info in PLATFORM_REGISTRY.items():
        display = info["display_name"]
        if display not in seen:
            seen.add(display)
            platforms.append({
                "id": key,
                "name": display,
                "category": info.get("category", ""),
            })

    return {
        "platforms": sorted(platforms, key=lambda p: p["name"]),
        "count": len(platforms),
        "note": "You can also search for any platform not in this list — TrustLens will analyze it live.",
    }


# ─── Fallback helpers ───────────────────────────────────────────────


async def _empty_tracker():
    return {"score": 8, "max": 15, "summary": "No Android package to scan.", "source": "no_data", "verified": False}


async def _empty_reviews():
    return {"reviews": [], "privacy_complaint_count": 0, "total_reviewed": 0, "avg_rating": 0, "source": "no_data", "verified": False}


async def _empty_breach():
    return {"score": 15, "max": 30, "summary": "No domain to check.", "source": "no_data", "verified": False}


async def _empty_security():
    return {"observatory_grade": "N/A", "security_score": 0, "source": "no_data", "verified": False}


async def _no_policy():
    return None


def _fallback(signal: str, error: Exception) -> dict:
    """Generate a fallback dict when a scraper raises an exception."""
    print(f"[main.py] {signal} scraper failed: {error}")
    defaults = {
        "tracker": {"score": 8, "max": 15, "summary": f"Tracker scan failed: {error}", "source": "error", "verified": False},
        "review": {"reviews": [], "privacy_complaint_count": 0, "total_reviewed": 0, "source": "error", "verified": False},
        "breach": {"score": 15, "max": 30, "summary": f"Breach scan failed: {error}", "source": "error", "verified": False},
        "security": {"observatory_grade": "N/A", "security_score": 0, "source": "error", "verified": False},
    }
    return defaults.get(signal, {"source": "error", "verified": False})


def _deep_copy_subscores(sub_scores: dict) -> dict:
    """Deep copy sub_scores dict to prevent mutating demo_data."""
    import copy
    return copy.deepcopy(sub_scores)
