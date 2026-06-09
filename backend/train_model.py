import os
import shutil
import pandas as pd
import numpy as np
import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tensorflow.keras.models import Model
from tensorflow.keras.preprocessing.image import ImageDataGenerator

# Paths configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
HAM_DIR = os.path.join(BASE_DIR, "datasets", "skin-cancer-mnist-ham10000")
METADATA_CSV = os.path.join(HAM_DIR, "HAM10000_metadata.csv")
IMAGES_PART1 = os.path.join(HAM_DIR, "HAM10000_images_part_1")
IMAGES_PART2 = os.path.join(HAM_DIR, "HAM10000_images_part_2")
PROCESSED_DIR = os.path.join(BASE_DIR, "datasets", "processed")

# Model configuration
MODEL_OUTPUT = os.path.join(os.path.dirname(BASE_DIR), "model", "dermasense_model.keras")
IMG_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 8

# Map HAM10000 diagnosis codes to premium user-facing class names
DX_MAPPING = {
    'nv': 'Melanocytic Nevi',
    'mel': 'Melanoma',
    'bkl': 'Benign Keratosis',
    'bcc': 'Basal Cell Carcinoma',
    'akiec': 'Actinic Keratosis',
    'vasc': 'Vascular Lesion',
    'df': 'Dermatofibroma'
}

def organize_dataset():
    """
    Reads HAM10000 metadata and copies images into subfolders organized by class.
    To ensure quick training on ordinary machines, it extracts a balanced subset
    of up to 200 images per class.
    """
    print("\n--- Organizing HAM10000 dataset into class directories ---")
    if not os.path.exists(METADATA_CSV):
        print(f"Error: Metadata file not found at {METADATA_CSV}")
        return False
        
    df = pd.read_csv(METADATA_CSV)
    
    # Create directory for each class
    for label in DX_MAPPING.values():
        os.makedirs(os.path.join(PROCESSED_DIR, label), exist_ok=True)
        
    # Find all images
    all_images = {}
    for folder in [IMAGES_PART1, IMAGES_PART2]:
        if os.path.exists(folder):
            for filename in os.listdir(folder):
                if filename.endswith(".jpg"):
                    img_id = os.path.splitext(filename)[0]
                    all_images[img_id] = os.path.join(folder, filename)
                    
    print(f"Found {len(all_images)} raw images.")
    
    # Balance and copy a subset to speed up local training
    max_images_per_class = 250
    counts = {label: 0 for label in DX_MAPPING.values()}
    
    for idx, row in df.iterrows():
        img_id = row['image_id']
        dx = row['dx']
        
        if dx in DX_MAPPING:
            label = DX_MAPPING[dx]
            if counts[label] < max_images_per_class:
                if img_id in all_images:
                    src_path = all_images[img_id]
                    dest_path = os.path.join(PROCESSED_DIR, label, f"{img_id}.jpg")
                    if not os.path.exists(dest_path):
                        shutil.copy(src_path, dest_path)
                    counts[label] += 1

    print("Organized image count per class:")
    for k, v in counts.items():
        print(f" - {k}: {v} images")
    print("----------------------------------------------------------\n")
    return True

def get_data_generators():
    train_datagen = ImageDataGenerator(
        preprocessing_function=preprocess_input,
        rotation_range=15,
        width_shift_range=0.1,
        height_shift_range=0.1,
        shear_range=0.1,
        zoom_range=0.1,
        horizontal_flip=True,
        validation_split=0.2,
    )
    
    train_generator = train_datagen.flow_from_directory(
        PROCESSED_DIR,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='training',
    )
    
    val_generator = train_datagen.flow_from_directory(
        PROCESSED_DIR,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='validation',
    )
    
    return train_generator, val_generator

def build_model(num_classes: int) -> Model:
    base_model = MobileNetV2(weights='imagenet', include_top=False, input_shape=IMG_SIZE + (3,))
    
    # Unfreeze top layers for fine-tuning on dermatological features
    base_model.trainable = True
    for layer in base_model.layers[:100]:
        layer.trainable = False
    
    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = Dropout(0.3)(x)
    predictions = Dense(num_classes, activation='softmax')(x)
    
    model = Model(inputs=base_model.input, outputs=predictions)
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-4),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    return model

def main():
    if not organize_dataset():
        print("Skipping training because dataset organization failed.")
        return
        
    train_gen, val_gen = get_data_generators()
    num_classes = train_gen.num_classes
    
    # Store class names ordered by indices
    class_indices = train_gen.class_indices
    ordered_classes = sorted(class_indices.items(), key=lambda item: item[1])
    class_names = [name for name, idx in ordered_classes]
    print(f"Class mapping detected: {class_names}")
    
    # Save the class name list to backend/app/routes/predict.py or similar
    class_mapping_path = os.path.join(BASE_DIR, "model_classes.txt")
    with open(class_mapping_path, "w") as f:
        f.write("\n".join(class_names))
    print(f"Saved class names mapping to: {class_mapping_path}")

    model = build_model(num_classes)
    
    # Callbacks
    callbacks = [
        tf.keras.callbacks.ReduceLROnPlateau(patience=2, factor=0.5, verbose=1),
        tf.keras.callbacks.EarlyStopping(patience=3, restore_best_weights=True, verbose=1)
    ]
    
    print("\n--- Starting Model Training ---")
    model.fit(
        train_gen,
        epochs=EPOCHS,
        validation_data=val_gen,
        callbacks=callbacks,
    )
    print("--- Training Completed ---")
    
    # Save the final model in Keras 3.x native format
    os.makedirs(os.path.dirname(MODEL_OUTPUT), exist_ok=True)
    model.save(MODEL_OUTPUT)
    print(f"\nSuccess: Real TensorFlow Model saved to {MODEL_OUTPUT}")

if __name__ == '__main__':
    main()
