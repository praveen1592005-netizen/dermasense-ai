import os
import numpy as np
import tensorflow as tf
from PIL import Image

# Path configurations
BASE_DIR = r"C:\Users\Praveenkumar S\Documents\pdd\kingrat\derma_sense_ai"
MODEL_PATH = os.path.join(BASE_DIR, "model", "dermasense_model.keras")
CLASSES_PATH = os.path.join(BASE_DIR, "backend", "model_classes.txt")
PROCESSED_DIR = os.path.join(BASE_DIR, "backend", "datasets", "processed")

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
        'Melanocytic Nevi',
        'Melanoma', 
        'Vascular Lesion'
    ]

print(f"Loaded Class names: {CLASS_NAMES}")

if not os.path.exists(MODEL_PATH):
    print("Model file not found!")
    exit(1)

print("Loading model...")
model = tf.keras.models.load_model(MODEL_PATH)
print("Model loaded successfully!")

def preprocess_image(image_path):
    # Match exactly what is done in train_model.py and predict.py
    img = Image.open(image_path).convert("RGB")
    img = img.resize((224, 224))
    arr = np.array(img).astype(np.float32)
    # MobileNetV2 preprocessing: scale to [-1, 1]
    from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
    arr = preprocess_input(arr)
    arr = np.expand_dims(arr, axis=0)
    return arr

# Test one image from each processed class directory
print("\n--- Testing predictions on real dataset images ---")
for class_name in CLASS_NAMES:
    class_dir = os.path.join(PROCESSED_DIR, class_name)
    if not os.path.exists(class_dir):
        print(f"Directory {class_dir} does not exist.")
        continue
    
    files = [f for f in os.listdir(class_dir) if f.endswith(".jpg")]
    if not files:
        print(f"No JPG images in {class_name}")
        continue
        
    # Take the first image
    test_img = os.path.join(class_dir, files[0])
    print(f"\nClass: {class_name} | Image: {files[0]}")
    
    processed = preprocess_image(test_img)
    preds = model.predict(processed)[0]
    idx = np.argmax(preds)
    pred_class = CLASS_NAMES[idx]
    
    print(f"  Predicted: {pred_class} (index {idx}) | Confidence: {preds[idx]:.4f}")
    print(f"  Top 3 classes:")
    top_indices = np.argsort(preds)[::-1][:3]
    for rank, t_idx in enumerate(top_indices):
        print(f"    {rank+1}. {CLASS_NAMES[t_idx]} ({preds[t_idx]:.4f})")
