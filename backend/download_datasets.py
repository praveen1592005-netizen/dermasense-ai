import os
import subprocess
import sys
from pathlib import Path

# Path to kaggle config (kaggle.json). Expected to be placed at project root.
KAGGLE_CONFIG_PATH = Path.home() / ".kaggle" / "kaggle.json"

def ensure_kaggle_auth():
    """Ensure Kaggle CLI is authenticated.
    The user should place a valid kaggle.json file (containing "username" and "key")
    at the project root. This function copies it to the default location (~/.kaggle/kaggle.json).
    """
    if not KAGGLE_CONFIG_PATH.is_file():
        print(f"[download_datasets] kaggle.json not found at {KAGGLE_CONFIG_PATH}. Please add it.")
        sys.exit(1)
    kaggle_dir = Path.home() / ".kaggle"
    kaggle_dir.mkdir(parents=True, exist_ok=True)
    dest = kaggle_dir / "kaggle.json"
    dest.write_bytes(KAGGLE_CONFIG_PATH.read_bytes())
    dest.chmod(0o600)
    print(f"[download_datasets] kaggle.json copied to {dest}")

# List of Kaggle dataset identifiers. Only downloading HAM10000 as required by train_model.py.
DATASET_IDS = [
    "kmader/skin-cancer-mnist-ham10000",
]

def download_dataset(dataset_id: str, target_dir: Path):
    """Download and unzip a Kaggle dataset.
    Args:
        dataset_id: Kaggle dataset identifier (owner/name).
        target_dir: Directory where the dataset will be unpacked.
    """
    command = [sys.executable, "-m", "kaggle", "datasets", "download", "-d", dataset_id, "-p", str(target_dir), "--unzip"]
    try:
        subprocess.run(command, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        print(f"[download_datasets] Successfully downloaded {dataset_id} to {target_dir}")
    except subprocess.CalledProcessError as e:
        print(f"[download_datasets] Failed to download {dataset_id}: {e.stderr.decode()}")

def main():
    ensure_kaggle_auth()
    datasets_root = Path(__file__).parent / "datasets"
    datasets_root.mkdir(parents=True, exist_ok=True)
    for ds_id in DATASET_IDS:
        ds_name = ds_id.split('/')[-1]
        target = datasets_root / ds_name
        target.mkdir(parents=True, exist_ok=True)
        download_dataset(ds_id, target)

if __name__ == "__main__":
    main()
