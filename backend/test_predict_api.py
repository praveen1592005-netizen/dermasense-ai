import base64
import requests
import numpy as np
from PIL import Image
import io

def test_prediction():
    # Create a simple red image
    img = Image.new('RGB', (224, 224), color = 'red')
    buffered = io.BytesIO()
    img.save(buffered, format="JPEG")
    img_str = base64.b64encode(buffered.getvalue()).decode('utf-8')

    url = 'http://127.0.0.1:8000/predict'
    print(f"Sending POST request to {url}...")
    try:
        response = requests.post(url, json={'image_base64': img_str}, timeout=5)
        print("Status Code:", response.status_code)
        print("Response JSON:", response.json())
    except Exception as e:
        print("Error connecting to local server:", e)

    # Let's also check a blue image
    img2 = Image.new('RGB', (224, 224), color = 'blue')
    buffered2 = io.BytesIO()
    img2.save(buffered2, format="JPEG")
    img_str2 = base64.b64encode(buffered2.getvalue()).decode('utf-8')
    print("\nSending POST request for blue image...")
    try:
        response = requests.post(url, json={'image_base64': img_str2}, timeout=5)
        print("Status Code:", response.status_code)
        print("Response JSON:", response.json())
    except Exception as e:
        print("Error connecting to local server:", e)

if __name__ == '__main__':
    test_prediction()
