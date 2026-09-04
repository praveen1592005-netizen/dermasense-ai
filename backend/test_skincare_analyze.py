import requests
import json
import io
import sys

# Create a small dummy image
dummy_image = io.BytesIO(b"dummy image data")
dummy_image.name = "test.jpg"

metadata = {
    "skinType": "combination",
    "concerns": ["Hyperpigmentation"],
    "routine": {"hasNoRoutine": True},
    "lifestyle": {"waterIntakeLiters": "2.0"}
}

url = "http://localhost:8000/api/v1/skincare/analyze"
print(f"POSTing to {url}...")

try:
    response = requests.post(
        url,
        data={"metadata": json.dumps(metadata)},
        files={"image": ("test.jpg", dummy_image, "image/jpeg")},
        # we don't have a valid auth token right now, so we expect a 401 Unauthorized or 403
    )
    print("Status:", response.status_code)
    print("Response:", response.text)
except Exception as e:
    print("Error:", str(e))
