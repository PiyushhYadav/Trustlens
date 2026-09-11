import asyncio
from backend.main import get_score
async def test():
    try:
        score = await get_score("zomato")
        print("POLICY:", score['signals']['policy'])
        print("COMPLIANCE:", score['signals']['compliance'])
        print("COMPLAINT:", score['signals']['complaint'])
    except Exception as e:
        print(e)
asyncio.run(test())
