import asyncio
from backend.main import get_score
from backend.gemini_client import GeminiClient

async def test():
    # Force fallback
    from unittest.mock import patch
    with patch.object(GeminiClient, 'analyze', return_value=None):
        try:
            score = await get_score("zomato")
            print("IS FALLBACK:", score['signals']['compliance'].get('is_fallback'))
            print("SUMMARY:", score['signals']['compliance'].get('summary'))
        except Exception as e:
            print(e)

asyncio.run(test())
