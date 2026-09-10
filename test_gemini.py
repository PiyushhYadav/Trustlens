import asyncio
from backend.gemini_client import GeminiClient
async def test():
    c = GeminiClient()
    r = await c.analyze('For truecaller return JSON with android_package, domain, display_name, category, policy_url, description. ONLY valid JSON.')
    print(r)
asyncio.run(test())
