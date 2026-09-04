import os
import argparse
import tensorflow as tf
from dataset import load_and_split_data
from preprocessing import create_tf_dataset
from sklearn.utils.class_weight import compute_class_weight
import numpy as np

def build_model(num_classes: int, input_size: int = 224):
    """
    Builds the EfficientNetV2 model architecture.
    """
    # Load EfficientNetV2 pre-trained on ImageNet
    base_model = tf.keras.applications.EfficientNetV2B0(
        include_top=False,
        weights='imagenet',
        input_shape=(input_size, input_size, 3),
        include_preprocessing=False # We handle our own preprocessing
    )
    
    # Freeze the base model initially
    base_model.trainable = False
    
    # Add classification head
    inputs = tf.keras.Input(shape=(input_size, input_size, 3))
    x = base_model(inputs, training=False)
    x = tf.keras.layers.GlobalAveragePooling2D()(x)
    x = tf.keras.layers.Dropout(0.3)(x)
    outputs = tf.keras.layers.Dense(num_classes, activation='softmax')(x)
    
    model = tf.keras.Model(inputs, outputs)
    
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy']
    )
    
    return model, base_model

def train():
    parser = argparse.ArgumentParser()
    parser.add_argument('--metadata', type=str, default='../datasets/metadata/HAM10000_metadata.csv')
    parser.add_argument('--images', type=str, default='../datasets/raw/')
    parser.add_argument('--epochs', type=int, default=20)
    parser.add_argument('--batch_size', type=int, default=32)
    parser.add_argument('--output_dir', type=str, default='../models/')
    args = parser.parse_args()
    
    print("Loading and splitting dataset...")
    train_df, val_df, test_df = load_and_split_data(args.metadata)
    
    # Save test set for later evaluation to avoid leakage
    test_df.to_csv(os.path.join(args.output_dir, "test_split.csv"), index=False)
    
    print("Creating tf.data pipelines...")
    train_ds = create_tf_dataset(train_df, args.images, batch_size=args.batch_size, is_training=True)
    val_ds = create_tf_dataset(val_df, args.images, batch_size=args.batch_size, is_training=False)
    
    # Compute class weights (HAM10000 is highly imbalanced)
    labels = train_df['dx'].values
    classes = np.unique(labels)
    weights = compute_class_weight('balanced', classes=classes, y=labels)
    class_weight = {i: weight for i, weight in enumerate(weights)}
    print(f"Computed class weights to handle imbalance: {class_weight}")
    
    print("Building model...")
    model, base_model = build_model(num_classes=7)
    
    callbacks = [
        tf.keras.callbacks.ModelCheckpoint(
            filepath=os.path.join(args.output_dir, 'skin_model_best.keras'),
            save_best_only=True,
            monitor='val_accuracy'
        ),
        tf.keras.callbacks.EarlyStopping(patience=5, restore_best_weights=True)
    ]
    
    print("Phase 1: Training top layers...")
    model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=args.epochs // 2,
        class_weight=class_weight,
        callbacks=callbacks
    )
    
    print("Phase 2: Fine-tuning entire model...")
    base_model.trainable = True
    model.compile(
        optimizer=tf.keras.optimizers.Adam(1e-5), # Lower learning rate
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy']
    )
    
    model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=args.epochs,
        class_weight=class_weight,
        callbacks=callbacks
    )
    
    # Save the final model
    final_model_path = os.path.join(args.output_dir, 'skin_model_final.keras')
    model.save(final_model_path)
    print(f"Training complete. Model saved to {final_model_path}")

if __name__ == "__main__":
    train()
