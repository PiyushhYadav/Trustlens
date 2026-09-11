import urllib.request
import json
req = urllib.request.urlopen('https://api.github.com/repos/PiyushhYadav/Trustlens/pulls')
data = json.load(req)
for pr in data:
    print(f"#{pr['number']}: {pr['title']} (by {pr['user']['login']}) - {pr['html_url']}")
