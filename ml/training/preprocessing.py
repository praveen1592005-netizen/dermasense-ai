import tensorflow as tf
import pandas as pd
import os

def create_tf_dataset(df: pd.DataFrame, image_dir: str, batch_size: int = 32, is_training: bool = False, input_size: int = 224):
    """
    Creates a tf.data.Dataset from a DataFrame.
    """
    # Assuming CLASS_LABELS index maps directly to the class label
    CLASS_LABELS = ['akiec', 'bcc', 'bkl', 'df', 'mel', 'nv', 'vasc']
    class_to_idx = {c: i for i, c in enumerate(CLASS_LABELS)}
    
    # Map dx to integers
    if 'dx' in df.columns:
        labels = df['dx'].map(class_to_idx).values
    else:
        labels = [0] * len(df) # Dummy labels if not present
        
    image_paths = df['image_id'].apply(lambda x: os.path.join(image_dir, f"{x}.jpg")).values
    
    dataset = tf.data.Dataset.from_tensor_slices((image_paths, labels))
    
    def parse_image(file_path, label):
        img = tf.io.read_file(file_path)
        img = tf.image.decode_jpeg(img, channels=3)
        img = tf.image.resize(img, [input_size, input_size])
        
        # EfficientNetV2 expects inputs in [0, 255] for its internal preprocessing,
        # OR we scale it to [0,1] manually if using standard models. 
        # For our backend we scale to [0,1], so let's match that here.
        img = tf.cast(img, tf.float32) / 255.0
        
        return img, label
        
    def augment(img, label):
        # Random augmentations for robust training
        img = tf.image.random_flip_left_right(img)
        img = tf.image.random_flip_up_down(img)
        img = tf.image.random_brightness(img, max_delta=0.1)
        img = tf.image.random_contrast(img, lower=0.9, upper=1.1)
        # Random rotation could be added via tf.keras.layers.RandomRotation in the model, 
        # but basic flips handle a lot of dermoscopic invariances.
        return img, label

    dataset = dataset.map(parse_image, num_parallel_calls=tf.data.AUTOTUNE)
    
    if is_training:
        dataset = dataset.cache() # Cache after reading to speed up epochs
        dataset = dataset.shuffle(buffer_size=1000)
        dataset = dataset.map(augment, num_parallel_calls=tf.data.AUTOTUNE)
    else:
        dataset = dataset.cache()
        
    dataset = dataset.batch(batch_size)
    dataset = dataset.prefetch(buffer_size=tf.data.AUTOTUNE)
    
    return dataset
