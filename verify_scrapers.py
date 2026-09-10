import asyncio
import json
import sys
import os

# Add the root project directory to the path so 'backend' can be imported
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from backend.gemini_client import GeminiClient
from backend.scrapers.security_scanner import scan_security_headers
from backend.scrapers.breach_scanner import scan_breaches

async def test_all():
    print("--- 1. Testing Gemini Client ---")
    gemini = GeminiClient()
    sample_policy = "We collect your data and sell it to third parties. We do not delete data."
    res = await gemini.analyze_policy(sample_policy)
    print("Gemini Policy Analysis:", json.dumps(res, indent=2))
    
    print("\n--- 2. Testing Security Scanner ---")
    sec_res = await scan_security_headers("google.com")
    print("Security Scanner (google.com):", json.dumps(sec_res, indent=2))
    
    print("\n--- 3. Testing Breach Scanner (adobe.com - breached) ---")
    breach_adobe = await scan_breaches("adobe.com")
    print("Breach (adobe.com) Score:", breach_adobe.get("score"), "Count:", breach_adobe.get("breach_count"))
    
    print("\n--- 3b. Testing Breach Scanner (example.com - clean) ---")
    breach_clean = await scan_breaches("example.com")
    print("Breach (example.com) Score:", breach_clean.get("score"), "Count:", breach_clean.get("breach_count"))

if __name__ == "__main__":
    asyncio.run(test_all())
