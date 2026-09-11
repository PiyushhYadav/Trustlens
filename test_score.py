import asyncio
from backend.main import get_score
async def test():
    try:
        score = await get_score("zomato")
        print(f"Compliance source: {score['signals']['compliance'].get('source')}")
        print(f"Compliance is_fallback: {score['signals']['compliance'].get('is_fallback')}")
        print(f"Compliance summary: {score['signals']['compliance'].get('summary')}")
    except Exception as e:
        print(e)
asyncio.run(test())
