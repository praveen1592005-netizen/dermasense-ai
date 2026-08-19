import os
import numpy as np
import tensorflow as tf
from PIL import Image

# Path configurations
BASE_DIR = r"C:\Users\Praveenkumar S\Documents\pdd\kingrat\derma_sense_ai"
MODEL_PATH = os.path.join(BASE_DIR, "model", "dermasense_model.keras")
CLASSES_PATH = os.path.join(BASE_DIR, "backend", "model_classes.txt")

# Load classes
if os.path.exists(CLASSES_PATH):
    with open(CLASSES_PATH, "r") as f:
        CLASS_NAMES = [line.strip() for line in f if line.strip()]
else:
    CLASS_NAMES = [
        'Actinic Keratosis', 
        'Basal Cell Carcinoma', 
        'Benign Keratosis', 
        'Dermatofibroma', 
        'Melanoma', 
        'Melanocytic Nevi', 
        'Vascular Lesion'
    ]

print(f"Loaded Class names: {CLASS_NAMES}")

if not os.path.exists(MODEL_PATH):
    print("Model file not found!")
    exit(1)

print("Loading model...")
model = tf.keras.models.load_model(MODEL_PATH)
print("Model loaded successfully!")

# Let's create some dummy images (noise, shapes, etc.) and see if the prediction changes
print("\n--- Testing predictions on dummy inputs ---")
for i in range(5):
    # Try different values to see if the predictions change
    if i == 0:
        # Uniform noise
        arr = np.random.rand(1, 224, 224, 3).astype(np.float32)
    elif i == 1:
        # Zero image (black)
        arr = np.zeros((1, 224, 224, 3), dtype=np.float32)
    elif i == 2:
        # One image (white)
        arr = np.ones((1, 224, 224, 3), dtype=np.float32)
    elif i == 3:
        # Constant medium values
        arr = np.ones((1, 224, 224, 3), dtype=np.float32) * 0.5
    else:
        # Sinusoidal pattern
        x = np.linspace(0, 10, 224)
        y = np.linspace(0, 10, 224)
        xv, yv = np.meshgrid(x, y)
        z = np.sin(xv) + np.cos(yv)
        z = (z - z.min()) / (z.max() - z.min())
        arr = np.stack([z, z, z], axis=-1)
        arr = np.expand_dims(arr, axis=0).astype(np.float32)
        
    preds = model.predict(arr)[0]
    idx = np.argmax(preds)
    print(f"Test {i}: argmax={idx} ({CLASS_NAMES[idx]}), confidence={preds[idx]:.4f}")
    print(f"Raw predictions: {preds}")
