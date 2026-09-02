import requests
import json
import os
import io
from PIL import Image, ImageDraw
import numpy as np

BASE_URL = "http://localhost:8000"
PREDICT_URL = f"{BASE_URL}/api/v1/predict"
ANALYZE_URL = f"{BASE_URL}/api/skin/analyze"

def create_test_image(color="white", size=(260, 260), noisy=False, too_small=False):
    """Creates a temporary image in memory and returns its bytes."""
    if too_small:
        size = (32, 32)
        
    if noisy:
        # Create a noisy image
        img_array = np.random.randint(0, 256, (size[1], size[0], 3), dtype=np.uint8)
        img = Image.fromarray(img_array)
    else:
        # Create a solid color image
        img = Image.new("RGB", size, color)
    
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='JPEG')
    img_byte_arr.seek(0)
    return img_byte_arr

def test_health():
    print("Testing /health endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print(json.dumps(data, indent=2))
        return data.get("status") == "ok" and data.get("model_loaded")
    except Exception as e:
        print(f"Health check failed: {e}")
        return False

def test_invalid_file_type():
    print("\nTesting Invalid File Type...")
    # Send a text file
    files = {"image": ("test.txt", io.BytesIO(b"Hello world"), "text/plain")}
    response = requests.post(PREDICT_URL, files=files, headers={"Authorization": "Bearer dummy_token"})
    print(f"Status Code: {response.status_code}")
    print(response.json())
    return response.status_code == 400

def test_too_small_image():
    print("\nTesting Too Small Image...")
    img_bytes = create_test_image(too_small=True)
    files = {"image": ("small.jpg", img_bytes, "image/jpeg")}
    response = requests.post(PREDICT_URL, files=files, headers={"Authorization": "Bearer dummy_token"})
    print(f"Status Code: {response.status_code}")
    print(response.json())
    return response.status_code in [400, 422]

def test_valid_image(color="pink"):
    print(f"\nTesting Valid Image ({color})...")
    img_bytes = create_test_image(color=color)
    files = {"image": ("test.jpg", img_bytes, "image/jpeg")}
    response = requests.post(PREDICT_URL, files=files, headers={"Authorization": "Bearer dummy_token"})
    print(f"Status Code: {response.status_code}")
    try:
        data = response.json()
        print(json.dumps(data, indent=2))
        
        # Verify schema
        required_fields = ["possible_condition", "confidence", "class_probabilities", "risk_level", "status", "model_name", "model_version"]
        for field in required_fields:
            if field not in data:
                print(f"Missing field: {field}")
                return False
        return True
    except Exception as e:
        print(f"Error parsing response: {e}")
        return False

def test_noisy_image():
    print("\nTesting Noisy (Uncertain) Image...")
    img_bytes = create_test_image(noisy=True)
    files = {"image": ("noisy.jpg", img_bytes, "image/jpeg")}
    response = requests.post(PREDICT_URL, files=files, headers={"Authorization": "Bearer dummy_token"})
    print(f"Status Code: {response.status_code}")
    try:
        data = response.json()
        print(json.dumps(data, indent=2))
        return data.get("risk_level") == "UNCERTAIN" or data.get("status") == "IMAGE_QUALITY_INSUFFICIENT"
    except Exception as e:
        print(f"Error parsing response: {e}")
        return False

def main():
    if not test_health():
        print("Health check failed. Ensure the backend is running.")
        return

    test_invalid_file_type()
    test_too_small_image()
    test_valid_image(color="brown")  
    test_valid_image(color="white")  
    test_noisy_image()
    
    print("\nTests completed.")

if __name__ == "__main__":
    main()
