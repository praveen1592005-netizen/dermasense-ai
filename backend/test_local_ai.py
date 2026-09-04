import httpx
import sys

API_URL = "http://localhost:8000/api/v1/predict"
IMAGE_PATH = r"C:\Users\Praveenkumar S\.gemini\antigravity-ide\brain\bee3a0ba-4731-4e72-95ad-4856ad87c096\test_skin_mole_1788411280832.jpg"

print(f"Testing local AI endpoint: {API_URL}")
try:
    with open(IMAGE_PATH, "rb") as f:
        files = {"file": ("test_skin_mole.jpg", f, "image/jpeg")}
        response = httpx.post(API_URL, files=files, timeout=30.0)
    
    print(f"Status Code: {response.status_code}")
    print("Response JSON:")
    print(response.json())
except Exception as e:
    print(f"Failed to test AI endpoint: {e}")
    sys.exit(1)
