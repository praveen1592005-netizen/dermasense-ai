import requests
import io
import time
from PIL import Image

def make_test_image(mode="good"):
    img = Image.new("RGB", (260, 260))
    if mode == "good":
        import random
        # random noisy image to pass blur and contrast checks
        pixels = [(random.randint(50, 200), random.randint(50, 200), random.randint(50, 200)) for _ in range(260*260)]
        img.putdata(pixels)
    elif mode == "dark":
        img = Image.new("RGB", (260, 260), color=(5, 5, 5))
    elif mode == "bright":
        img = Image.new("RGB", (260, 260), color=(250, 250, 250))
    elif mode == "blurry":
        img = Image.new("RGB", (260, 260), color=(128, 128, 128))
    elif mode == "small":
        img = Image.new("RGB", (10, 10), color=(128, 128, 128))
        
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()

def run_tests():
    BASE_URL = "http://localhost:8000"
    print("Testing backend health...")
    try:
        resp = requests.get(f"{BASE_URL}/health")
        resp.raise_for_status()
        health = resp.json()
        print(f"Health: {health}")
        if not health.get("model_loaded"):
            print("ERROR: Model is not loaded according to health endpoint!")
            return
    except Exception as e:
        print(f"Failed to connect to backend: {e}")
        return

    print("\n--- Running Live Verification Tests ---")
    
    cases = [
        ("Good/Noisy Image", "good", 200, "success"),
        ("Dark Image", "dark", 422, "IMAGE_QUALITY_INSUFFICIENT"),
        ("Bright Image", "bright", 422, "IMAGE_QUALITY_INSUFFICIENT"),
        ("Blurry/Uniform Image", "blurry", 422, "IMAGE_QUALITY_INSUFFICIENT"),
        ("Too Small Image", "small", 400, None)
    ]
    
    headers = {"Authorization": "Bearer TEST_TOKEN"}
    
    for name, mode, expected_status, expected_state in cases:
        print(f"Testing {name}...")
        img_bytes = make_test_image(mode)
        files = {"image": ("test.jpg", img_bytes, "image/jpeg")}
        resp = requests.post(f"{BASE_URL}/api/v1/predict", files=files, headers=headers)
        
        if resp.status_code != expected_status:
            print(f"  FAILED: Expected status {expected_status}, got {resp.status_code}")
            print(f"  Response: {resp.text}")
        else:
            print(f"  PASSED status code {expected_status}")
            if expected_state:
                res_json = resp.json()
                if res_json.get("status") == expected_state:
                    print(f"  PASSED response status '{expected_state}'")
                    if expected_state == "success":
                        print(f"     Risk Level: {res_json.get('risk_level')}")
                        print(f"     Condition: {res_json.get('possible_condition')}")
                        print(f"     Confidence: {res_json.get('confidence')}")
                else:
                    print(f"  FAILED: Expected response status '{expected_state}', got '{res_json.get('status')}'")
    print("\n--- Verification Complete ---")

if __name__ == "__main__":
    # Wait for server to be up
    for _ in range(10):
        try:
            requests.get("http://localhost:8000/health")
            break
        except:
            print("Waiting for server to start...")
            time.sleep(2)
    
    run_tests()
