import os
import urllib.request

urls = {
    "Landing_Page.html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzNhOTgwODk1ODczMzRmYThiMWQxNjM0ZWNkMjZiZTAwEgsSBxCKpN2toh0YAZIBIwoKcHJvamVjdF9pZBIVQhM2MDc1MDU0MjY4MzA3MTQwMTMy&filename=&opi=89354086",
    "Search_Results.html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzFjYjVlZDRmYjczYzQxYjc5ZmY2OTI3NTZkOWQwNGJhEgsSBxCKpN2toh0YAZIBIwoKcHJvamVjdF9pZBIVQhM2MDc1MDU0MjY4MzA3MTQwMTMy&filename=&opi=89354086",
    "Compare_Mode.html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzhiNzdkZGJhMDlhYzRlMWY4MWVmYmY2MDhmZWM1MzdmEgsSBxCKpN2toh0YAZIBIwoKcHJvamVjdF9pZBIVQhM2MDc1MDU0MjY4MzA3MTQwMTMy&filename=&opi=89354086",
    "Chrome_Extension.html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzk3Y2NmYzc0NTI4ZjRiYmI5OWUzYmIzZTc5ZmIwOWM0EgsSBxCKpN2toh0YAZIBIwoKcHJvamVjdF9pZBIVQhM2MDc1MDU0MjY4MzA3MTQwMTMy&filename=&opi=89354086"
}

export_dir = r"c:\Users\ypiyu\Desktop\Trustlens\frontend"
os.makedirs(export_dir, exist_ok=True)

for filename, url in urls.items():
    filepath = os.path.join(export_dir, filename)
    print(f"Downloading {filename}...")
    try:
        urllib.request.urlretrieve(url, filepath)
        print(f"Saved {filepath}")
    except Exception as e:
        print(f"Error downloading {filename}: {e}")
