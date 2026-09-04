# DermaSense AI — Dermatology Datasets Documentation

This document records the datasets used for training the DermaSense AI model, including their licenses, intended uses, and citations. 
**IMPORTANT**: Raw training datasets MUST be stored here in `ml/datasets/raw/` and should NEVER be uploaded to the production Supabase database.

## 1. HAM10000 Dataset

- **Name**: HAM10000 ("Human Against Machine with 10000 training images")
- **Source**: [ISIC Archive / Harvard Dataverse](https://dataverse.harvard.edu/dataset.xhtml?persistentId=doi:10.7910/DVN/DBW86T)
- **License**: CC-BY-NC 4.0 (Creative Commons Attribution-NonCommercial 4.0 International). This means it can be used for research and development but cannot be commercialized without explicit permission.
- **Citation**: Tschandl, P., Rosendahl, C. & Kittler, H. The HAM10000 dataset, a large collection of multi-source dermatoscopic images of common pigmented skin lesions. *Sci. Data* 5, 180161 (2018). https://doi.org/10.1038/sdata.2018.161
- **Number of Images**: 10,015 dermatoscopic images.
- **Classes**:
  1. `akiec` - Actinic keratoses and intraepithelial carcinoma / Bowen's disease
  2. `bcc` - Basal cell carcinoma
  3. `bkl` - Benign keratosis-like lesions (solar lentigines / seborrheic keratoses)
  4. `df` - Dermatofibroma
  5. `mel` - Melanoma
  6. `nv` - Melanocytic nevi
  7. `vasc` - Vascular lesions (angiomas, pyogenic granulomas)
- **Intended Use**: Initial base training for multi-class pigmented skin lesion classification.
- **Limitations**: The dataset is heavily imbalanced towards melanocytic nevi (`nv`). We use class weighting during training to penalize minority class misclassifications.
- **Preprocessing Strategy**: RGB conversion, normalization to [0,1], center-crop, and resizing to 224x224 (EfficientNetV2 standard).

## 2. ISIC 2019 / 2020 (Supplementary)

- **Name**: ISIC 2019 / ISIC 2020 Challenge Datasets
- **Source**: [ISIC Archive](https://www.isic-archive.com/)
- **License**: Varies. CC-BY-NC for most subsets.
- **Intended Use**: Additional negative samples (e.g. unknown class) and validation of melanoma detection to improve sensitivity.
- **Train/Test Strategy**: We perform **Patient-Aware Splitting**. Since multiple lesions or images can belong to the same patient (`lesion_id`), a standard random split will cause severe data leakage. `ml/training/dataset.py` explicitly groups data by `lesion_id` to ensure no patient overlaps between the TRAIN and TEST splits.
