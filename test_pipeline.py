import asyncio
import json
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from backend.main import get_score

async def test_endpoint():
    print("--- Running Full Pipeline for 'zomato' ---")
    try:
        res = await get_score("zomato")
        print(json.dumps(res, indent=2))
        
        # Verify no fallbacks
        signals = res.get("signals", {})
        for name, data in signals.items():
            if data.get("source") == "fallback":
                print(f"WARNING: {name} fell back to default data!")
            else:
                print(f"SUCCESS: {name} used real data ({data.get('source')})")
                
        sec = res.get("security_headers", {})
        if sec.get("source") == "fallback":
             print(f"WARNING: Security Headers fell back to default data!")
        else:
             print(f"SUCCESS: Security Headers used real data ({sec.get('source')})")
             
    except Exception as e:
        print(f"Error running pipeline: {e}")

if __name__ == "__main__":
    asyncio.run(test_endpoint())
