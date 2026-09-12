"""
backend/gemini_client.py

Unified Gemini AI client for TrustLens — all AI analysis (policy scoring,
complaint analysis) goes through this one client.
"""

import asyncio
import httpx
import json
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

DEFAULT_MODEL = "gemini-3-flash-preview"  # updated default for live demo


class GeminiClient:
    # Use a class-level semaphore to strictly prevent concurrent Gemini API calls,
    # which immediately trigger 429 Rate Limited errors on the free tier.
    _semaphore = asyncio.Semaphore(1)

    def __init__(self, model: str | None = None):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.model = model or os.getenv("GEMINI_MODEL", DEFAULT_MODEL)
        self.base_url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent"

    async def analyze(self, prompt: str, max_retries: int = 2) -> dict | None:
        if not self.api_key:
            print("[GeminiClient] GEMINI_API_KEY not set")
            return None

        url = f"{self.base_url}?key={self.api_key}"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "responseMimeType": "application/json",
                "temperature": 0.1,
            },
        }

        last_error = None
        async with self._semaphore:
            for attempt in range(max_retries + 1):
                try:
                    async with httpx.AsyncClient(timeout=30) as client:
                        resp = await client.post(url, json=payload)

                    if resp.status_code == 429:
                        last_error = "429 rate limited"
                        if attempt < max_retries:
                            await asyncio.sleep(2.0 * (attempt + 1))
                        continue

                    if resp.status_code == 404:
                        raise RuntimeError(
                            f"Gemini model '{self.model}' returned 404 - it may "
                            f"have been deprecated. Check "
                            f"ai.google.dev/gemini-api/docs/models and set "
                            f"GEMINI_MODEL to a current model."
                        )

                    if resp.status_code != 200:
                        last_error = f"HTTP {resp.status_code}: {resp.text[:200]}"
                        continue

                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if not candidates:
                        last_error = f"No candidates in response: {data}"
                        continue

                    text = candidates[0]["content"]["parts"][0]["text"]
                    return json.loads(text)

                except json.JSONDecodeError as e:
                    last_error = f"JSON parse error: {e}"
                    continue
                except RuntimeError:
                    raise
                except Exception as e:
                    last_error = f"API error: {e}"
                    continue

        print(f"[GeminiClient] analyze() failed after {max_retries + 1} attempts: {last_error}")
        return None

    async def analyze_policy(self, policy_text: str) -> dict:
        prompt = f"""Analyze this privacy policy text and score it on four dimensions.
Each score should be an integer.

Dimensions:
- clarity_score (0-5): How clear and understandable is the language?
- data_retention_score (0-5): Are there clear data retention limits?
- third_party_score (0-5): How limited is third-party data sharing?
- user_rights_score (0-5): How well are user rights (access, delete, port) supported?

Also provide:
- total_score (0-20): Sum of all dimensions
- summary (string): 1-2 sentence summary of key findings
- red_flags (array of strings): Specific concerning clauses found
- dpdp_compliant (boolean): Whether the policy appears compliant with India's DPDP Act 2023
- dpdp_issues (array of strings): Specific DPDP compliance gaps

Privacy Policy Text:
{policy_text[:6000]}

Return ONLY valid JSON."""

        result = await self.analyze(prompt)
        if not result:
            return self._fallback_policy_score()

        required = ["total_score", "summary", "dpdp_compliant"]
        if not all(k in result for k in required):
            return self._fallback_policy_score()

        try:
            result["total_score"] = max(0, min(20, int(result.get("total_score", 0))))
        except (TypeError, ValueError):
            result["total_score"] = 10

        return result

    async def analyze_complaints(self, reviews: list, platform_name: str) -> dict:
        if not reviews:
            return {
                "score": 10, "max": 15,
                "summary": "No privacy-related reviews found to analyze.",
                "source": "no_data", "verified": False,
            }

        review_text = "\n".join(f"- [{r['score']}★] {r['text']}" for r in reviews[:15])

        prompt = f"""Analyze these REAL user reviews for {platform_name} from the Google Play Store.
Focus on privacy-related complaints.

Reviews:
{review_text}

Return JSON with:
- score (0-15): Privacy complaint score (15 = very few complaints, 0 = severe complaints)
- summary (string): 1-2 sentence analysis of privacy complaint patterns
- complaint_categories (array of strings): Types of complaints found
- severity (string): "low", "medium", "high", or "critical"
- sample_complaints (array of strings): 2-3 representative complaint excerpts

Return ONLY valid JSON."""

        result = await self.analyze(prompt)
        if not result or "score" not in result:
            return {
                "score": 8, "max": 15,
                "summary": "Analysis unavailable — midpoint score shown, not a verified result.",
                "source": "fallback", "verified": False,
            }

        try:
            result["score"] = max(0, min(15, int(result["score"])))
        except (TypeError, ValueError):
            result["score"] = 8

        result["max"] = 15
        result["source"] = "play_store_reviews"
        result["verified"] = True
        return result

    def _fallback_policy_score(self):
        return {
            "total_score": 10,
            "summary": "Analysis unavailable — midpoint score shown, not a verified result.",
            "dpdp_compliant": False,
            "source": "fallback",
            "verified": False,
        }
