"""
DermaSense AI – Hybrid Training Pipeline v2.0
==============================================
Architecture : EfficientNetV2-B3 (Transfer Learning)
Datasets     : HAM10000 + PAD-UFES-20 + Fitzpatrick17K (auto-merged)
Input Size   : 300×300
Targets      : Accuracy > 90 %, F1 > 0.90

Usage:
    python train_model.py              # full training
    python train_model.py --quick      # fast debug (100 imgs/class, 3 epochs)
"""

import os, sys, shutil, argparse, json
import numpy as np
import pandas as pd
import tensorflow as tf

from sklearn.model_selection import StratifiedKFold
from sklearn.utils.class_weight import compute_class_weight
from sklearn.metrics import classification_report, f1_score

from tensorflow.keras import mixed_precision
from tensorflow.keras.applications import EfficientNetV2B3
from tensorflow.keras.applications.efficientnet_v2 import preprocess_input
from tensorflow.keras.layers import (
    Dense, GlobalAveragePooling2D, Dropout, BatchNormalization, Input
)
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import AdamW
from tensorflow.keras.callbacks import (
    EarlyStopping, ReduceLROnPlateau, ModelCheckpoint, TensorBoard
)
from tensorflow.keras.preprocessing.image import ImageDataGenerator

# ─── Paths ────────────────────────────────────────────────────────────────────
BASE_DIR      = os.path.dirname(os.path.abspath(__file__))
DATASETS_DIR  = os.path.join(BASE_DIR, "datasets")
PROCESSED_DIR = os.path.join(DATASETS_DIR, "merged_processed")
MODEL_DIR     = os.path.join(os.path.dirname(BASE_DIR), "model")
MODEL_OUTPUT  = os.path.join(MODEL_DIR, "dermasense_model.keras")
BEST_CKPT     = os.path.join(MODEL_DIR, "best_checkpoint.keras")
LOGS_DIR      = os.path.join(BASE_DIR, "logs")

os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(LOGS_DIR, exist_ok=True)

# ─── Hyperparameters ──────────────────────────────────────────────────────────
IMG_SIZE        = (300, 300)
BATCH_SIZE      = 16          # reduce if OOM; increase for A100/4090
EPOCHS_FROZEN   = 10          # warm-up with base frozen
EPOCHS_FINE     = 30          # fine-tune last 60 layers
LEARNING_RATE   = 1e-3
FINE_TUNE_LR    = 1e-5
VALIDATION_SPLIT= 0.20
MAX_PER_CLASS   = 2000        # cap per class to balance memory; None = all

# ─── Unified label map (all datasets → these canonical names) ─────────────────
LABEL_MAP = {
    # HAM10000 codes
    "nv":     "Melanocytic Nevi",
    "mel":    "Melanoma",
    "bkl":    "Benign Keratosis",
    "bcc":    "Basal Cell Carcinoma",
    "akiec":  "Actinic Keratosis",
    "vasc":   "Vascular Lesion",
    "df":     "Dermatofibroma",
    # PAD-UFES-20 labels
    "ACK":    "Actinic Keratosis",
    "BCC":    "Basal Cell Carcinoma",
    "MEL":    "Melanoma",
    "NEV":    "Melanocytic Nevi",
    "SCC":    "Squamous Cell Carcinoma",
    "SEK":    "Benign Keratosis",
    # Fitzpatrick17K categories
    "malignant": "Melanoma",
    "non-neoplastic": "Clear Skin",
    "benign": "Melanocytic Nevi",
}

CLASSES = sorted(set(LABEL_MAP.values()))

# ─── Argument parser ─────────────────────────────────────────────────────────
parser = argparse.ArgumentParser()
parser.add_argument("--quick", action="store_true",
                    help="Quick debug run: 100 imgs/class, 3 epochs")
args, _ = parser.parse_known_args()

if args.quick:
    MAX_PER_CLASS   = 100
    EPOCHS_FROZEN   = 2
    EPOCHS_FINE     = 1
    print("⚡ QUICK MODE — reduced dataset and epochs for fast debugging")


# ══════════════════════════════════════════════════════════════════════════════
# STEP 1 — DATASET FUSION
# ══════════════════════════════════════════════════════════════════════════════

def merge_ham10000():
    """Index all HAM10000 images; return dict of {img_id: (path, label)}"""
    entries = {}
    ham_dir = os.path.join(DATASETS_DIR, "skin-cancer-mnist-ham10000")
    meta_csv = os.path.join(ham_dir, "HAM10000_metadata.csv")

    if not os.path.exists(meta_csv):
        print(f"  [SKIP] HAM10000 metadata not found at {meta_csv}")
        return entries

    df = pd.read_csv(meta_csv)
    img_dirs = [
        os.path.join(ham_dir, "HAM10000_images_part_1"),
        os.path.join(ham_dir, "HAM10000_images_part_2"),
    ]
    img_index = {}
    for d in img_dirs:
        if os.path.exists(d):
            for f in os.listdir(d):
                if f.lower().endswith(".jpg"):
                    img_index[os.path.splitext(f)[0]] = os.path.join(d, f)

    for _, row in df.iterrows():
        img_id = row["image_id"]
        dx     = row["dx"]
        label  = LABEL_MAP.get(dx)
        if label and img_id in img_index:
            entries[img_id] = (img_index[img_id], label)

    print(f"  HAM10000: {len(entries)} images indexed")
    return entries


def merge_pad_ufes():
    """Index PAD-UFES-20 images."""
    entries = {}
    pad_dir = os.path.join(DATASETS_DIR, "pad-ufes-20")
    meta_csv = os.path.join(pad_dir, "metadata.csv")

    if not os.path.exists(meta_csv):
        print(f"  [SKIP] PAD-UFES-20 metadata not found at {meta_csv}")
        return entries

    df = pd.read_csv(meta_csv)
    imgs_dir = os.path.join(pad_dir, "images")

    for _, row in df.iterrows():
        img_file  = str(row.get("img_id", "")) + ".png"
        dx        = str(row.get("diagnostic", ""))
        label     = LABEL_MAP.get(dx)
        img_path  = os.path.join(imgs_dir, img_file)
        if label and os.path.exists(img_path):
            entries[img_file] = (img_path, label)

    print(f"  PAD-UFES-20: {len(entries)} images indexed")
    return entries


def merge_fitzpatrick():
    """Index Fitzpatrick17k images."""
    entries = {}
    fitz_dir = os.path.join(DATASETS_DIR, "fitzpatrick17k")
    meta_csv  = os.path.join(fitz_dir, "fitzpatrick17k.csv")

    if not os.path.exists(meta_csv):
        print(f"  [SKIP] Fitzpatrick17k metadata not found at {meta_csv}")
        return entries

    df = pd.read_csv(meta_csv)
    imgs_dir = os.path.join(fitz_dir, "images")

    for _, row in df.iterrows():
        img_file = str(row.get("md5hash", "")) + ".jpg"
        category = str(row.get("three_partition_label", "")).lower()
        label    = LABEL_MAP.get(category)
        img_path = os.path.join(imgs_dir, img_file)
        if label and os.path.exists(img_path):
            entries[img_file] = (img_path, label)

    print(f"  Fitzpatrick17k: {len(entries)} images indexed")
    return entries


def organize_merged_dataset():
    """Merge all datasets → PROCESSED_DIR/<ClassName>/<img>.jpg, balanced."""
    print("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print("  STEP 1 — Merging & Organizing Datasets")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

    # Create output dirs
    for cls in CLASSES:
        os.makedirs(os.path.join(PROCESSED_DIR, cls), exist_ok=True)

    # Collect all sources
    all_entries = {}
    all_entries.update(merge_ham10000())
    all_entries.update(merge_pad_ufes())
    all_entries.update(merge_fitzpatrick())

    total_sources = len(all_entries)
    print(f"\n  Total images from all sources: {total_sources}")

    # Track per-class counts for balancing
    per_class = {c: [] for c in CLASSES}
    for uid, (src, label) in all_entries.items():
        if label in per_class:
            per_class[label].append((uid, src))

    # Copy balanced subset; skip duplicates by filename
    counts = {c: 0 for c in CLASSES}
    for cls, items in per_class.items():
        limit = MAX_PER_CLASS if MAX_PER_CLASS else len(items)
        for uid, src in items[:limit]:
            ext  = os.path.splitext(src)[1] or ".jpg"
            dest = os.path.join(PROCESSED_DIR, cls, f"{uid}{ext}")
            if not os.path.exists(dest):
                try:
                    shutil.copy2(src, dest)
                except Exception:
                    continue
            counts[cls] += 1

    print("\n  Images per class after balancing:")
    for cls, cnt in sorted(counts.items()):
        print(f"    {cls:<30} {cnt:>5}")

    # Save class list
    classes_with_data = sorted([c for c, n in counts.items() if n > 0])
    with open(os.path.join(MODEL_DIR, "model_classes.txt"), "w") as f:
        f.write("\n".join(classes_with_data))

    # Copy to backend classes file too
    shutil.copy(
        os.path.join(MODEL_DIR, "model_classes.txt"),
        os.path.join(BASE_DIR, "model_classes.txt")
    )

    print(f"\n  Active classes: {classes_with_data}")
    return classes_with_data


# ══════════════════════════════════════════════════════════════════════════════
# STEP 2 — DATA GENERATORS
# ══════════════════════════════════════════════════════════════════════════════

def build_generators(active_classes):
    print("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print("  STEP 2 — Building Data Generators")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

    train_aug = ImageDataGenerator(
        preprocessing_function=preprocess_input,
        rotation_range=40,
        width_shift_range=0.15,
        height_shift_range=0.15,
        shear_range=0.15,
        zoom_range=0.20,
        brightness_range=[0.75, 1.25],
        horizontal_flip=True,
        vertical_flip=True,
        fill_mode="reflect",
        validation_split=VALIDATION_SPLIT,
    )

    train_gen = train_aug.flow_from_directory(
        PROCESSED_DIR,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode="categorical",
        subset="training",
        shuffle=True,
        classes=active_classes,
    )

    val_gen = train_aug.flow_from_directory(
        PROCESSED_DIR,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode="categorical",
        subset="validation",
        shuffle=False,
        classes=active_classes,
    )

    print(f"  Train samples : {train_gen.samples}")
    print(f"  Val samples   : {val_gen.samples}")
    print(f"  Classes       : {list(train_gen.class_indices.keys())}")
    return train_gen, val_gen


# ══════════════════════════════════════════════════════════════════════════════
# STEP 3 — MODEL CONSTRUCTION
# ══════════════════════════════════════════════════════════════════════════════

def build_efficientnetv2b3(num_classes: int) -> Model:
    print("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print("  STEP 3 — Building EfficientNetV2-B3 Model")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

    base = EfficientNetV2B3(
        include_top=False,
        weights="imagenet",
        input_shape=(*IMG_SIZE, 3),
    )
    base.trainable = False  # freeze for warm-up

    inputs = Input(shape=(*IMG_SIZE, 3))
    x = base(inputs, training=False)
    x = GlobalAveragePooling2D()(x)
    x = BatchNormalization()(x)
    x = Dropout(0.4)(x)
    x = Dense(512, activation="relu")(x)
    x = BatchNormalization()(x)
    x = Dropout(0.3)(x)
    outputs = Dense(num_classes, activation="softmax")(x)

    model = Model(inputs, outputs)
    print(f"  Base parameters : {base.count_params():,}")
    print(f"  Total parameters: {model.count_params():,}")
    return model, base


# ══════════════════════════════════════════════════════════════════════════════
# STEP 4 — TRAINING
# ══════════════════════════════════════════════════════════════════════════════

def compute_weights(train_gen):
    labels = train_gen.classes
    cw = compute_class_weight("balanced", classes=np.unique(labels), y=labels)
    return dict(enumerate(cw))


def train(model, base, train_gen, val_gen, class_weights):
    callbacks_base = [
        EarlyStopping(monitor="val_accuracy", patience=5, restore_best_weights=True, verbose=1),
        ReduceLROnPlateau(monitor="val_loss", factor=0.5, patience=3, min_lr=1e-7, verbose=1),
        ModelCheckpoint(BEST_CKPT, monitor="val_accuracy", save_best_only=True, verbose=1),
        TensorBoard(log_dir=LOGS_DIR),
    ]

    # ── Phase 1: Warm-up (head only) ─────────────────────────────────────────
    print("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print("  PHASE 1 — Warm-up (frozen base)")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    model.compile(
        optimizer=AdamW(learning_rate=LEARNING_RATE, weight_decay=1e-4),
        loss="categorical_crossentropy",
        metrics=["accuracy", tf.keras.metrics.AUC(name="auc")],
    )
    model.fit(
        train_gen,
        validation_data=val_gen,
        epochs=EPOCHS_FROZEN,
        class_weight=class_weights,
        callbacks=callbacks_base,
        verbose=1,
    )

    # ── Phase 2: Fine-tune last 60 layers ────────────────────────────────────
    print("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print("  PHASE 2 — Fine-tuning (last 60 layers)")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    base.trainable = True
    for layer in base.layers[:-60]:
        layer.trainable = False

    model.compile(
        optimizer=AdamW(learning_rate=FINE_TUNE_LR, weight_decay=1e-5),
        loss="categorical_crossentropy",
        metrics=["accuracy", tf.keras.metrics.AUC(name="auc")],
    )
    model.fit(
        train_gen,
        validation_data=val_gen,
        epochs=EPOCHS_FINE,
        class_weight=class_weights,
        callbacks=callbacks_base,
        verbose=1,
    )

    return model


# ══════════════════════════════════════════════════════════════════════════════
# STEP 5 — EVALUATION
# ══════════════════════════════════════════════════════════════════════════════

def evaluate(model, val_gen, active_classes):
    print("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print("  STEP 5 — Evaluation")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

    val_gen.reset()
    preds_proba = model.predict(val_gen, verbose=1)
    y_pred = np.argmax(preds_proba, axis=1)
    y_true = val_gen.classes[:len(y_pred)]

    report = classification_report(
        y_true, y_pred,
        target_names=active_classes,
        digits=4,
        zero_division=0
    )
    print(report)

    macro_f1 = f1_score(y_true, y_pred, average="macro", zero_division=0)
    print(f"  Macro F1 Score: {macro_f1:.4f}")

    # Save metrics
    metrics = {
        "macro_f1": float(macro_f1),
        "num_classes": len(active_classes),
        "classes": active_classes,
    }
    with open(os.path.join(MODEL_DIR, "metrics.json"), "w") as f:
        json.dump(metrics, f, indent=2)

    return macro_f1


# ══════════════════════════════════════════════════════════════════════════════
# MAIN
# ══════════════════════════════════════════════════════════════════════════════

def main():
    print("\n" + "═"*55)
    print("  DermaSense AI — Hybrid Training Pipeline v2.0")
    print("  EfficientNetV2-B3 | Multi-Dataset | Top-5 Ready")
    print("═"*55)

    # GPU config
    gpus = tf.config.list_physical_devices("GPU")
    if gpus:
        print(f"\n  🟢 GPU Detected: {[g.name for g in gpus]}")
        for gpu in gpus:
            tf.config.experimental.set_memory_growth(gpu, True)
        # Enable mixed precision for faster training
        mixed_precision.set_global_policy("mixed_float16")
        print("  Mixed Precision: enabled (float16)")
    else:
        print("\n  🟡 No GPU detected — training on CPU (will be slow)")

    # Step 1 — Merge datasets
    active_classes = organize_merged_dataset()
    if not active_classes:
        print("\n❌ No dataset images found. Run download_datasets.py first.")
        sys.exit(1)

    # Step 2 — Generators
    train_gen, val_gen = build_generators(active_classes)

    # Step 3 — Model
    model, base = build_efficientnetv2b3(len(active_classes))

    # Class weights for imbalanced datasets
    class_weights = compute_weights(train_gen)
    print("\n  Class weights computed:")
    idx_map = {v: k for k, v in train_gen.class_indices.items()}
    for i, w in class_weights.items():
        print(f"    {idx_map.get(i, i):<30} weight={w:.3f}")

    # Step 4 — Training
    model = train(model, base, train_gen, val_gen, class_weights)

    # Step 5 — Evaluate
    evaluate(model, val_gen, active_classes)

    # Step 6 — Save
    print("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print("  STEP 6 — Saving Final Model")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    model.save(MODEL_OUTPUT)
    print(f"\n  ✅ Model saved → {MODEL_OUTPUT}")
    print(f"  ✅ Classes saved → {os.path.join(MODEL_DIR, 'model_classes.txt')}")
    print("\n  Training complete! 🎉\n")


if __name__ == "__main__":
    main()
