# TrustLens Phase 1 — Build Tasks

## Fix Outdated APIs
- [x] `backend/gemini_client.py` — gemini-2.5-flash, configurable model, 429/404 handling
- [x] `backend/scrapers/security_scanner.py` — MDN Observatory v2
- [x] `backend/scrapers/breach_scanner.py` — HIBP with `Domain=` (capital D)
- [x] `backend/.env.example` — GEMINI_MODEL var

## New Scraper Files
- [x] `backend/scrapers/__init__.py`
- [x] `backend/scrapers/tracker_scanner.py` — Exodus Privacy API
- [x] `backend/scrapers/review_scraper.py` — google-play-scraper
- [x] `backend/scrapers/policy_scraper.py` — BeautifulSoup + Trafilatura

## Core Backend Files
- [x] `backend/platform_resolver.py` — Platform name → identifiers
- [x] `backend/scoring_engine.py` — Rewrite with real data support
- [x] `backend/cache_manager.py` — Add TTL, absolute path, WAL mode
- [x] `backend/main.py` — Async pipeline with parallel scrapers
- [x] `backend/requirements.txt` — Pinned versions

## Cleanup
- [x] Delete `backend/complaint_analyzer.py`
- [x] Delete `backend/fallback_policies.py`
- [x] Delete `backend/policy_analyzer.py`
