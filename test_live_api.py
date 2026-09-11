import requests
import json

platforms = ["zomato", "swiggy", "paytm", "flipkart", "aarogya setu"]
for p in platforms:
    try:
        url = f"https://trustlens-qtex.onrender.com/score?platform={p}"
        r = requests.get(url)
        data = r.json()
        print(f"--- {p.upper()} ---")
        print("Score:", data.get("score"))
        print("Trend:", json.dumps(data.get("trend")))
    except Exception as e:
        print(f"Error for {p}: {e}")
