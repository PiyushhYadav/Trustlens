import asyncio
import httpx
from bs4 import BeautifulSoup
import re

async def test_scrape(app_handle: str):
    url = f"https://reports.exodus-privacy.eu.org/en/reports/{app_handle}/latest/"
    print(f"Fetching {url}...")
    async with httpx.AsyncClient(timeout=10, follow_redirects=True) as client:
        resp = await client.get(url, headers={"User-Agent": "TrustLens-Privacy-Auditor/1.0"})
        
    if resp.status_code == 404:
        print(f"[{app_handle}] 404 Not Found in Exodus database.")
        return
        
    soup = BeautifulSoup(resp.text, 'html.parser')
    
    # Extract trackers
    trackers = [a.text.strip() for a in soup.find_all('a', href=re.compile(r'/trackers/\d+/'))]
    
    # Deduplicate trackers while preserving order
    seen = set()
    unique_trackers = []
    for t in trackers:
        if t not in seen:
            seen.add(t)
            unique_trackers.append(t)
            
    # Extract permissions
    perm_count = 0
    perm_nodes = soup.find_all(string=re.compile(r'^\s*permissions\s*$', re.I))
    for node in perm_nodes:
        parent_text = node.parent.parent.text.strip()
        match = re.match(r'^(\d+)', parent_text)
        if match:
            perm_count = int(match.group(1))
            break
            
    print(f"[{app_handle}] Trackers ({len(unique_trackers)}): {unique_trackers}")
    print(f"[{app_handle}] Permissions: {perm_count}")

async def main():
    await test_scrape("com.instagram.android")
    print("-" * 40)
    await test_scrape("com.fakemakeup.app.notreal123")
    print("-" * 40)
    await test_scrape("org.privacywall.browser")
    print("-" * 40)
    await test_scrape("com.whatsapp")

if __name__ == "__main__":
    asyncio.run(main())
