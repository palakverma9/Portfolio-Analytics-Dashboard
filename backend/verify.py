import urllib.request
import json

endpoints = [
    "http://127.0.0.1:8000/api/health",
    "http://127.0.0.1:8000/api/portfolios",
    "http://127.0.0.1:8000/api/portfolio/summary?portfolio=core",
    "http://127.0.0.1:8000/api/portfolio/holdings?portfolio=core",
    "http://127.0.0.1:8000/api/portfolio/allocation?portfolio=core",
    "http://127.0.0.1:8000/api/portfolio/performance?portfolio=core&timeframe=1Y"
]

print("--- VERIFYING FASTAPI ENDPOINTS ---")
for ep in endpoints:
    try:
        req = urllib.request.Request(ep)
        with urllib.request.urlopen(req) as response:
            status = response.getcode()
            content = json.loads(response.read().decode('utf-8'))
            print(f"PASS: {ep} -> Status {status}")
            # print a tiny snippet of the response content
            if "status" in content:
                print(f"      Body: {content}")
            elif isinstance(content, list) and len(content) > 0:
                print(f"      Body (first item): {content[0]}")
            else:
                print(f"      Keys in response: {list(content.keys())}")
    except Exception as e:
        print(f"FAIL: {ep} -> Error: {e}")
