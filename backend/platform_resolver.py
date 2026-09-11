"""
backend/platform_resolver.py

Maps platform names → app package handles, domains, policy URLs.
Combines a hardcoded registry of popular Indian platforms with
Gemini-powered dynamic discovery for unknown platforms.
"""

import asyncio
from typing import Optional

# Pre-mapped registry of popular Indian and global platforms
# Each entry has: display_name, android_package, domain, policy_url, category
PLATFORM_REGISTRY: dict[str, dict] = {
    "zomato": {
        "display_name": "Zomato",
        "android_package": "com.application.zomato",
        "domain": "zomato.com",
        "policy_url": "https://www.zomato.com/privacy",
        "category": "Food & Beverage",
        "description": "Zomato is an Indian multinational restaurant aggregator and food delivery company."
    },
    "swiggy": {
        "display_name": "Swiggy",
        "android_package": "in.swiggy.android",
        "domain": "swiggy.com",
        "policy_url": "https://www.swiggy.com/privacy-policy",
        "category": "Food Delivery",
        "description": "Swiggy is India's leading on-demand delivery platform for food, groceries, and dining."
    },
    "instagram": {
        "display_name": "Instagram",
        "android_package": "com.instagram.android",
        "domain": "instagram.com",
        "policy_url": "https://privacycenter.instagram.com/policy",
        "category": "Social Media",
        "description": "Instagram is a photo and video sharing social networking service owned by Meta Platforms."
    },
    "paytm": {
        "display_name": "Paytm",
        "android_package": "net.one97.paytm",
        "domain": "paytm.com",
        "policy_url": "https://paytm.com/about-us/privacy-policy",
        "category": "Fintech",
        "description": "Paytm is an Indian multinational financial technology company that specializes in digital payments and financial services."
    },
    "phonepe": {
        "display_name": "PhonePe",
        "android_package": "com.phonepe.app",
        "domain": "phonepe.com",
        "policy_url": "https://www.phonepe.com/privacy-policy/",
        "category": "Fintech",
        "description": "PhonePe is an Indian digital payments and financial services company headquartered in Bengaluru."
    },
    "flipkart": {
        "display_name": "Flipkart",
        "android_package": "com.flipkart.android",
        "domain": "flipkart.com",
        "policy_url": "https://www.flipkart.com/pages/privacypolicy",
        "category": "E-Commerce",
    },
    "ola": {
        "display_name": "Ola",
        "android_package": "com.olacabs.customer",
        "domain": "olacabs.com",
        "policy_url": "https://www.olacabs.com/privacy",
        "category": "Ride-hailing",
    },
    "uber": {
        "display_name": "Uber",
        "android_package": "com.ubercab",
        "domain": "uber.com",
        "policy_url": "https://www.uber.com/legal/en/document/?name=privacy-notice",
        "category": "Ride-hailing",
    },
    "bigbasket": {
        "display_name": "BigBasket",
        "android_package": "com.bigbasket.mobileapp",
        "domain": "bigbasket.com",
        "policy_url": "https://www.bigbasket.com/privacy-policy/",
        "category": "Grocery Delivery",
    },
    "cred": {
        "display_name": "CRED",
        "android_package": "com.dreamplug.androidapp",
        "domain": "cred.club",
        "policy_url": "https://cred.club/privacy",
        "category": "Fintech",
    },
    "myntra": {
        "display_name": "Myntra",
        "android_package": "com.myntra.android",
        "domain": "myntra.com",
        "policy_url": "https://www.myntra.com/privacypolicy",
        "category": "Fashion E-Commerce",
    },
    "nykaa": {
        "display_name": "Nykaa",
        "android_package": "com.fsn.nykaa",
        "domain": "nykaa.com",
        "policy_url": "https://www.nykaa.com/privacy-policy",
        "category": "Beauty E-Commerce",
    },
    "whatsapp": {
        "display_name": "WhatsApp",
        "android_package": "com.whatsapp",
        "domain": "whatsapp.com",
        "policy_url": "https://www.whatsapp.com/legal/privacy-policy",
        "category": "Messaging",
    },
    "telegram": {
        "display_name": "Telegram",
        "android_package": "org.telegram.messenger",
        "domain": "telegram.org",
        "policy_url": "https://telegram.org/privacy",
        "category": "Messaging",
    },
    "facebook": {
        "display_name": "Facebook",
        "android_package": "com.facebook.katana",
        "domain": "facebook.com",
        "policy_url": "https://www.facebook.com/privacy/policy/",
        "category": "Social Media",
    },
    "twitter": {
        "display_name": "X (Twitter)",
        "android_package": "com.twitter.android",
        "domain": "x.com",
        "policy_url": "https://twitter.com/en/privacy",
        "category": "Social Media",
    },
    "x": {  # Alias
        "display_name": "X (Twitter)",
        "android_package": "com.twitter.android",
        "domain": "x.com",
        "policy_url": "https://twitter.com/en/privacy",
        "category": "Social Media",
    },
    "snapchat": {
        "display_name": "Snapchat",
        "android_package": "com.snapchat.android",
        "domain": "snapchat.com",
        "policy_url": "https://values.snap.com/privacy/privacy-policy",
        "category": "Social Media",
    },
    "amazon": {
        "display_name": "Amazon India",
        "android_package": "in.amazon.mShop.android.shopping",
        "domain": "amazon.in",
        "policy_url": "https://www.amazon.in/gp/help/customer/display.html?nodeId=200534380",
        "category": "E-Commerce",
    },
    "gpay": {
        "display_name": "Google Pay",
        "android_package": "com.google.android.apps.nbu.paisa.user",
        "domain": "pay.google.com",
        "policy_url": "https://payments.google.com/payments/apis-secure/get_legal_document?ldo=0&ldt=privacynotice",
        "category": "Fintech",
    },
    "google pay": {  # Alias
        "display_name": "Google Pay",
        "android_package": "com.google.android.apps.nbu.paisa.user",
        "domain": "pay.google.com",
        "policy_url": "https://payments.google.com/payments/apis-secure/get_legal_document?ldo=0&ldt=privacynotice",
        "category": "Fintech",
    },
    "razorpay": {
        "display_name": "Razorpay",
        "android_package": "com.razorpay.payments.app",
        "domain": "razorpay.com",
        "policy_url": "https://razorpay.com/privacy/",
        "category": "Fintech",
    },
    "meesho": {
        "display_name": "Meesho",
        "android_package": "com.meesho.supply",
        "domain": "meesho.com",
        "policy_url": "https://meesho.com/privacy",
        "category": "Social Commerce",
    },
    "jiocinema": {
        "display_name": "JioCinema",
        "android_package": "com.jio.media.ondemand",
        "domain": "jiocinema.com",
        "policy_url": "https://www.jio.com/en-in/privacy-policy",
        "category": "Entertainment",
    },
    "hotstar": {
        "display_name": "Disney+ Hotstar",
        "android_package": "in.startv.hotstar",
        "domain": "hotstar.com",
        "policy_url": "https://www.hotstar.com/in/privacy-policy",
        "category": "Entertainment",
    },
    "spotify": {
        "display_name": "Spotify",
        "android_package": "com.spotify.music",
        "domain": "spotify.com",
        "policy_url": "https://www.spotify.com/legal/privacy-policy/",
        "category": "Music Streaming",
    },
    "zerodha": {
        "display_name": "Zerodha Kite",
        "android_package": "com.zerodha.kite3",
        "domain": "zerodha.com",
        "policy_url": "https://zerodha.com/privacy",
        "category": "Fintech",
    },
    "groww": {
        "display_name": "Groww",
        "android_package": "com.nextbillion.groww",
        "domain": "groww.in",
        "policy_url": "https://groww.in/privacy-policy",
        "category": "Fintech",
    },
    "dunzo": {
        "display_name": "Dunzo",
        "android_package": "com.dunzo.user",
        "domain": "dunzo.com",
        "policy_url": "https://www.dunzo.com/privacy",
        "category": "Delivery",
    },
    "blinkit": {
        "display_name": "Blinkit",
        "android_package": "com.grofers.customerapp",
        "domain": "blinkit.com",
        "policy_url": "https://blinkit.com/privacy",
        "category": "Quick Commerce",
    },
    "zepto": {
        "display_name": "Zepto",
        "android_package": "com.zeptonow.app",
        "domain": "zeptonow.com",
        "policy_url": "https://www.zeptonow.com/privacy-policy",
        "category": "Quick Commerce",
    },
    "linkedin": {
        "display_name": "LinkedIn",
        "android_package": "com.linkedin.android",
        "domain": "linkedin.com",
        "policy_url": "https://www.linkedin.com/legal/privacy-policy",
        "category": "Professional Network",
    },
    "tinder": {
        "display_name": "Tinder",
        "android_package": "com.tinder",
        "domain": "tinder.com",
        "policy_url": "https://policies.tinder.com/privacy",
        "category": "Dating",
    },
    "youtube": {
        "display_name": "YouTube",
        "android_package": "com.google.android.youtube",
        "domain": "youtube.com",
        "policy_url": "https://policies.google.com/privacy",
        "category": "Video Streaming",
    },
    # Legacy aliases from demo_data.py
    "byjus": {
        "display_name": "BYJU'S",
        "android_package": "com.byjus.thelearningapp",
        "domain": "byjus.com",
        "policy_url": "https://byjus.com/privacy-policy/",
        "category": "EdTech",
    },
    "truecaller": {
        "display_name": "Truecaller",
        "android_package": "com.truecaller",
        "domain": "truecaller.com",
        "policy_url": "https://www.truecaller.com/privacy-policy",
        "category": "Communication",
        "description": "Truecaller is a smartphone application that provides caller identification, call-blocking, flash-messaging, and call-recording functionality."
    },
    "aarogya setu": {
        "display_name": "Aarogya Setu",
        "android_package": "nic.goi.aarogyasetu",
        "domain": "aarogyasetu.gov.in",
        "policy_url": "https://www.mygov.in/aarogya-setu-app/",
        "category": "Government Health",
    },
}


def get_known_platforms() -> list[str]:
    """Returns list of all pre-mapped platform names (for the /platforms endpoint)."""
    # Filter out aliases (entries whose display_name matches another entry)
    seen_displays = set()
    unique = []
    for name, info in PLATFORM_REGISTRY.items():
        display = info["display_name"]
        if display not in seen_displays:
            seen_displays.add(display)
            unique.append(name)
    return sorted(unique)


async def resolve_platform(query: str, gemini_client=None) -> Optional[dict]:
    """
    Resolves a platform name to its technical identifiers.
    
    1. Check hardcoded registry (instant)
    2. If unknown and gemini_client provided, use Gemini to discover identifiers
    3. Validate and return
    
    Returns None if the platform cannot be resolved.
    """
    normalized = query.strip().lower()
    
    # Direct lookup
    if normalized in PLATFORM_REGISTRY:
        return {"query": normalized, **PLATFORM_REGISTRY[normalized]}
    
    # Try partial matching (e.g., "google pay" for "gpay")
    for key, info in PLATFORM_REGISTRY.items():
        if normalized in key or key in normalized:
            return {"query": normalized, **info}
        if normalized in info["display_name"].lower():
            return {"query": normalized, **info}
    
    # Dynamic discovery via Gemini
    if gemini_client:
        prompt = f"""For the mobile app or platform \"{query}\", provide these details.
If this is not a real app/platform, return {{"error": "not_found"}}.

Return a JSON object with:
- android_package (string): The exact Google Play Store package name (e.g., com.example.app)
- domain (string): The main website domain without www (e.g., example.com)
- display_name (string): The proper capitalized name
- category (string): Category like "Food Delivery", "Social Media", "Fintech", etc.
- policy_url (string): URL of the privacy policy page, or null if unknown
- description (string): A short 1-sentence bio or description of what the platform is.

Return ONLY valid JSON."""
        
        try:
            result = await gemini_client.analyze(prompt)
            if result and "error" not in result and result.get("android_package"):
                result["query"] = normalized
                return result
        except Exception as e:
            print(f"[PlatformResolver] Gemini discovery failed for '{query}': {e}")
    
    return None
