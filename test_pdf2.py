import asyncio
from backend.main import app
from fastapi.testclient import TestClient

client = TestClient(app)
response = client.get("/report/aarogya setu")
print(response.status_code)
if response.status_code != 200:
    print(response.text)
