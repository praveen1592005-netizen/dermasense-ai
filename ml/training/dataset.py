import pandas as pd
import numpy as np
from sklearn.model_selection import GroupShuffleSplit
import os

def load_and_split_data(metadata_path: str, test_size: float = 0.2, val_size: float = 0.1):
    """
    Loads HAM10000 metadata and splits into Train/Val/Test.
    CRITICAL: Uses GroupShuffleSplit on 'lesion_id' to prevent data leakage.
    Multiple images of the same lesion must stay in the same split.
    """
    if not os.path.exists(metadata_path):
        raise FileNotFoundError(f"Metadata file not found at {metadata_path}")
        
    df = pd.read_csv(metadata_path)
    
    # Clean up and ensure required columns exist
    required_cols = ['image_id', 'lesion_id', 'dx']
    for col in required_cols:
        if col not in df.columns:
            raise ValueError(f"Metadata missing required column: {col}")
            
    # Step 1: Split into Train+Val and Test
    gss_test = GroupShuffleSplit(n_splits=1, test_size=test_size, random_state=42)
    train_val_idx, test_idx = next(gss_test.split(df, groups=df['lesion_id']))
    
    train_val_df = df.iloc[train_val_idx].copy()
    test_df = df.iloc[test_idx].copy()
    
    # Step 2: Split Train+Val into Train and Val
    gss_val = GroupShuffleSplit(n_splits=1, test_size=val_size/(1-test_size), random_state=42)
    train_idx, val_idx = next(gss_val.split(train_val_df, groups=train_val_df['lesion_id']))
    
    train_df = train_val_df.iloc[train_idx].copy()
    val_df = train_val_df.iloc[val_idx].copy()
    
    print(f"Total dataset size: {len(df)}")
    print(f"Training set: {len(train_df)} images ({len(train_df['lesion_id'].unique())} unique lesions)")
    print(f"Validation set: {len(val_df)} images ({len(val_df['lesion_id'].unique())} unique lesions)")
    print(f"Test set: {len(test_df)} images ({len(test_df['lesion_id'].unique())} unique lesions)")
    
    # Verify no leakage
    train_lesions = set(train_df['lesion_id'])
    val_lesions = set(val_df['lesion_id'])
    test_lesions = set(test_df['lesion_id'])
    
    assert len(train_lesions.intersection(test_lesions)) == 0, "Leakage between train and test!"
    assert len(val_lesions.intersection(test_lesions)) == 0, "Leakage between val and test!"
    assert len(train_lesions.intersection(val_lesions)) == 0, "Leakage between train and val!"
    
    return train_df, val_df, test_df
