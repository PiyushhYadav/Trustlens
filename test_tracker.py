import asyncio
import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from backend.scrapers.tracker_scanner import scan_trackers

async def test_all():
    print("\n--- Testing: com.instagram.android (Popular) ---")
    res1 = await scan_trackers("com.instagram.android")
    print("Result:", res1)
    
    print("\n--- Testing: com.fakemakeup.app.notreal123 (Not in DB) ---")
    res2 = await scan_trackers("com.fakemakeup.app.notreal123")
    print("Result:", res2)
    
    print("\n--- Testing: org.privacywall.browser (Edge Case/Smaller) ---")
    res3 = await scan_trackers("org.privacywall.browser")
    print("Result:", res3)

if __name__ == "__main__":
    import logging
    logging.basicConfig(level=logging.INFO)
    asyncio.run(test_all())
