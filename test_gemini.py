import urllib.request
import json

url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key='
data = json.dumps({"contents":[{"parts":[{"text":"Hello"}]}]}).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})

try:
    with urllib.request.urlopen(req) as response:
        print(response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print(f'HTTP Error {e.code}: {e.reason}')
    print(e.read().decode('utf-8'))
except Exception as e:
    print(f'Error: {e}')
