import requests

url = "http://localhost:8000/api/v1/auth/signup"
data = {
    "email": "testuser_real@example.com",
    "password": "TestPassword123!",
    "full_name": "Test User"
}
try:
    response = requests.post(url, json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
