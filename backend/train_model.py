"""
DermaSense AI — EfficientNetV2 Training Script for HAM10000
============================================================
This script trains an EfficientNetV2-S model on the HAM10000 skin lesion dataset.

Dataset: HAM10000 (Human Against Machine with 10000 training images)
Source: https://www.kaggle.com/datasets/kmader/skin-lesion-analysis-toward-melanoma-detection

SETUP:
1. Download the HAM10000 dataset from Kaggle
2. Extract to: training_data/HAM10000/
   Expected structure:
     training_data/HAM10000/HAM10000_images_part_1/
     training_data/HAM10000/HAM10000_images_part_2/
     training_data/HAM10000/HAM10000_metadata.csv
3. Run: python train_model.py
4. The trained model will be saved to: models/skin_model.keras

IMPORTANT: The class label order in skin_ai_service.py MUST match the
training class order exactly. This script prints the class mapping after training.

Expected training time: ~2-6 hours on GPU, ~8-24 hours on CPU.
"""

import os
import sys
import json
import shutil
import random
import numpy as np
import pandas as pd
from pathlib import Path

try:
    import tensorflow as tf
    from tensorflow.keras.applications import EfficientNetV2S
    from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout, BatchNormalization
    from tensorflow.keras.models import Model
    from tensorflow.keras.optimizers import Adam
    from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, ReduceLROnPlateau
    from tensorflow.keras.preprocessing.image import ImageDataGenerator
except ImportError:
    print("ERROR: TensorFlow not installed. Run: pip install tensorflow")
    sys.exit(1)

# ── Configuration ──────────────────────────────────────────────────────────────
IMG_SIZE = 224
BATCH_SIZE = 32
EPOCHS = 30
LEARNING_RATE = 1e-4
VAL_SPLIT = 0.15
TEST_SPLIT = 0.10
SEED = 42

# HAM10000 class mapping — MUST match skin_ai_service.py CLASS_LABELS exactly
# Format: HAM10000_label → display_name
LABEL_MAPPING = {
    "akiec": "Actinic Keratosis",
    "bcc":   "Basal Cell Carcinoma",
    "bkl":   "Benign Keratosis",
    "df":    "Dermatofibroma",
    "mel":   "Melanoma",
    "nv":    "Melanocytic Nevi",
    "vasc":  "Vascular Lesion",
}

# Sorted alphabetically to maintain consistent index order (matches CLASS_LABELS)
CLASS_NAMES = sorted(LABEL_MAPPING.values())
NUM_CLASSES = len(CLASS_NAMES)

print(f"\n{'='*60}")
print(f"DermaSense AI — EfficientNetV2 Training")
print(f"{'='*60}")
print(f"Classes ({NUM_CLASSES}):")
for i, name in enumerate(CLASS_NAMES):
    print(f"  [{i}] {name}")
print(f"{'='*60}\n")

# ── Data Directories ───────────────────────────────────────────────────────────
DATASET_DIR = Path("training_data/HAM10000")
METADATA_CSV = DATASET_DIR / "HAM10000_metadata.csv"
IMG_DIRS = [
    DATASET_DIR / "HAM10000_images_part_1",
    DATASET_DIR / "HAM10000_images_part_2",
]
PREPARED_DIR = Path("training_data/prepared")
MODEL_SAVE_PATH = Path("models/skin_model.keras")


def prepare_dataset():
    """
    Organize HAM10000 images into train/val/test subdirectories by class.
    Creates:
      training_data/prepared/train/<class_name>/
      training_data/prepared/val/<class_name>/
      training_data/prepared/test/<class_name>/
    """
    if not METADATA_CSV.exists():
        print(f"ERROR: Metadata CSV not found at {METADATA_CSV}")
        print("Please download HAM10000 from Kaggle and extract to training_data/HAM10000/")
        sys.exit(1)

    print("Preparing dataset structure...")
    df = pd.read_csv(METADATA_CSV)
    df["class_name"] = df["dx"].map(LABEL_MAPPING)
    df = df.dropna(subset=["class_name"])

    # Build image path lookup
    img_lookup = {}
    for img_dir in IMG_DIRS:
        if img_dir.exists():
            for img_file in img_dir.glob("*.jpg"):
                img_lookup[img_file.stem] = img_file

    print(f"Found {len(img_lookup)} images across {len(IMG_DIRS)} directories")
    print(f"Metadata records: {len(df)}")

    # Create split directories
    for split in ["train", "val", "test"]:
        for class_name in CLASS_NAMES:
            (PREPARED_DIR / split / class_name).mkdir(parents=True, exist_ok=True)

    # Split and copy images
    random.seed(SEED)
    stats = {cls: {"train": 0, "val": 0, "test": 0} for cls in CLASS_NAMES}

    for class_name in CLASS_NAMES:
        class_rows = df[df["class_name"] == class_name]
        image_ids = class_rows["image_id"].tolist()
        random.shuffle(image_ids)

        n = len(image_ids)
        n_test = max(1, int(n * TEST_SPLIT))
        n_val = max(1, int(n * VAL_SPLIT))
        n_train = n - n_test - n_val

        splits = {
            "test": image_ids[:n_test],
            "val": image_ids[n_test:n_test + n_val],
            "train": image_ids[n_test + n_val:],
        }

        for split, ids in splits.items():
            for img_id in ids:
                if img_id in img_lookup:
                    src = img_lookup[img_id]
                    dst = PREPARED_DIR / split / class_name / src.name
                    if not dst.exists():
                        shutil.copy2(src, dst)
                    stats[class_name][split] += 1

    print("\nDataset split summary:")
    for cls, counts in stats.items():
        total = sum(counts.values())
        print(f"  {cls}: train={counts['train']}, val={counts['val']}, test={counts['test']} (total={total})")

    return stats


def build_model():
    """Build EfficientNetV2-S with classification head for NUM_CLASSES."""
    base_model = EfficientNetV2S(
        include_top=False,
        weights="imagenet",   # Use ImageNet pretrained weights for transfer learning
        input_shape=(IMG_SIZE, IMG_SIZE, 3),
    )
    base_model.trainable = False  # Freeze base initially

    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = BatchNormalization()(x)
    x = Dropout(0.3)(x)
    x = Dense(512, activation="relu")(x)
    x = BatchNormalization()(x)
    x = Dropout(0.2)(x)
    outputs = Dense(NUM_CLASSES, activation="softmax")(x)

    model = Model(inputs=base_model.input, outputs=outputs)
    return model, base_model


def train():
    """Full training pipeline."""
    # Prepare data
    if not (PREPARED_DIR / "train").exists():
        prepare_dataset()
    else:
        print("Prepared dataset found, skipping preparation.")

    # Data augmentation for training
    train_datagen = ImageDataGenerator(
        rescale=1.0 / 255.0,
        rotation_range=20,
        width_shift_range=0.1,
        height_shift_range=0.1,
        shear_range=0.1,
        zoom_range=0.1,
        horizontal_flip=True,
        vertical_flip=False,
        brightness_range=[0.9, 1.1],
        fill_mode="nearest",
    )

    val_datagen = ImageDataGenerator(rescale=1.0 / 255.0)

    train_gen = train_datagen.flow_from_directory(
        PREPARED_DIR / "train",
        target_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        class_mode="categorical",
        shuffle=True,
        seed=SEED,
    )

    val_gen = val_datagen.flow_from_directory(
        PREPARED_DIR / "val",
        target_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        class_mode="categorical",
        shuffle=False,
    )

    # Verify class indices match expected order
    print(f"\nTensorFlow class index mapping (from directory scan):")
    for name, idx in sorted(train_gen.class_indices.items(), key=lambda x: x[1]):
        print(f"  [{idx}] {name}")

    print(f"\nExpected CLASS_LABELS order in skin_ai_service.py:")
    for idx, name in enumerate(CLASS_NAMES):
        print(f"  [{idx}] {name}")

    # Verify ordering matches
    tf_classes = [k for k, v in sorted(train_gen.class_indices.items(), key=lambda x: x[1])]
    if tf_classes != CLASS_NAMES:
        print("\nWARNING: Class order mismatch detected!")
        print("TF order:", tf_classes)
        print("Expected:", CLASS_NAMES)
        print("Update CLASS_LABELS in skin_ai_service.py to match TF order:")
        print("CLASS_LABELS =", json.dumps(tf_classes, indent=4))

    # Build and compile model
    print("\nBuilding EfficientNetV2-S model...")
    model, base_model = build_model()

    model.compile(
        optimizer=Adam(learning_rate=LEARNING_RATE),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )

    print(f"\nModel summary:")
    model.summary(print_fn=lambda x: print(x) if "Total" in x or "Trainable" in x else None)

    # Callbacks
    MODEL_SAVE_PATH.parent.mkdir(parents=True, exist_ok=True)
    callbacks = [
        ModelCheckpoint(
            str(MODEL_SAVE_PATH),
            monitor="val_accuracy",
            save_best_only=True,
            verbose=1,
        ),
        EarlyStopping(monitor="val_accuracy", patience=8, restore_best_weights=True, verbose=1),
        ReduceLROnPlateau(monitor="val_loss", factor=0.5, patience=4, min_lr=1e-7, verbose=1),
    ]

    # Phase 1: Train classification head only
    print("\n" + "="*60)
    print("PHASE 1: Training classification head (frozen base)")
    print("="*60)
    history1 = model.fit(
        train_gen,
        validation_data=val_gen,
        epochs=10,
        callbacks=callbacks,
        verbose=1,
    )

    # Phase 2: Fine-tune top layers of base model
    print("\n" + "="*60)
    print("PHASE 2: Fine-tuning top 50 layers of EfficientNetV2-S")
    print("="*60)
    base_model.trainable = True
    for layer in base_model.layers[:-50]:
        layer.trainable = False

    model.compile(
        optimizer=Adam(learning_rate=LEARNING_RATE / 10),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )

    history2 = model.fit(
        train_gen,
        validation_data=val_gen,
        epochs=EPOCHS,
        initial_epoch=len(history1.history["loss"]),
        callbacks=callbacks,
        verbose=1,
    )

    print(f"\nTraining complete. Best model saved to: {MODEL_SAVE_PATH.resolve()}")

    # Evaluate on test set
    print("\nEvaluating on test set...")
    test_datagen = ImageDataGenerator(rescale=1.0 / 255.0)
    test_gen = test_datagen.flow_from_directory(
        PREPARED_DIR / "test",
        target_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        class_mode="categorical",
        shuffle=False,
    )

    test_loss, test_acc = model.evaluate(test_gen, verbose=1)
    print(f"\nTest Accuracy: {test_acc:.4f} ({test_acc * 100:.1f}%)")
    print(f"Test Loss: {test_loss:.4f}")
    print("\nNOTE: Test accuracy on HAM10000 does NOT guarantee real-world clinical performance.")
    print("This model requires clinical validation before medical use.")

    # Save final class mapping
    class_mapping = {idx: name for idx, name in enumerate(CLASS_NAMES)}
    mapping_path = MODEL_SAVE_PATH.parent / "class_mapping.json"
    with open(mapping_path, "w") as f:
        json.dump(class_mapping, f, indent=2)
    print(f"\nClass mapping saved to: {mapping_path}")
    print("Verify this matches CLASS_LABELS in backend/services/skin_ai_service.py")


if __name__ == "__main__":
    train()
