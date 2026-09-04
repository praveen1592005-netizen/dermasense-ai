import os
import argparse
import tensorflow as tf
import pandas as pd
from preprocessing import create_tf_dataset
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np

def evaluate():
    parser = argparse.ArgumentParser()
    parser.add_argument('--model', type=str, default='../models/skin_model_best.keras')
    parser.add_argument('--test_csv', type=str, default='../models/test_split.csv')
    parser.add_argument('--images', type=str, default='../datasets/raw/')
    parser.add_argument('--batch_size', type=int, default=32)
    args = parser.parse_args()
    
    print(f"Loading model from {args.model}...")
    model = tf.keras.models.load_model(args.model)
    
    print(f"Loading test split from {args.test_csv}...")
    test_df = pd.read_csv(args.test_csv)
    test_ds = create_tf_dataset(test_df, args.images, batch_size=args.batch_size, is_training=False)
    
    print("Running evaluation...")
    loss, accuracy = model.evaluate(test_ds)
    print(f"Test Accuracy: {accuracy:.4f}")
    
    print("Generating predictions...")
    predictions = model.predict(test_ds)
    y_pred = np.argmax(predictions, axis=1)
    
    # Map back to classes
    CLASS_LABELS = ['akiec', 'bcc', 'bkl', 'df', 'mel', 'nv', 'vasc']
    class_to_idx = {c: i for i, c in enumerate(CLASS_LABELS)}
    y_true = test_df['dx'].map(class_to_idx).values
    
    print("\nClassification Report:")
    print(classification_report(y_true, y_pred, target_names=CLASS_LABELS))
    
    print("Generating Confusion Matrix...")
    cm = confusion_matrix(y_true, y_pred)
    
    plt.figure(figsize=(10, 8))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=CLASS_LABELS, yticklabels=CLASS_LABELS)
    plt.title('Confusion Matrix')
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    
    # Save the confusion matrix plot
    output_plot = os.path.join(os.path.dirname(args.model), '../evaluation/confusion_matrix.png')
    plt.savefig(output_plot)
    print(f"Saved confusion matrix to {output_plot}")

if __name__ == "__main__":
    evaluate()
