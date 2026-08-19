"""
DermaSense AI — Dataset Downloader v2.0
=======================================
Downloads all training datasets:
  - HAM10000    (via Kaggle API)
  - PAD-UFES-20 (via Kaggle API)
  - Fitzpatrick17k (via Kaggle API)

Usage:
    python download_datasets.py --all
    python download_datasets.py --ham10000
    python download_datasets.py --pad
    python download_datasets.py --fitzpatrick
"""

import os, sys, argparse, subprocess, zipfile, shutil

BASE_DIR     = os.path.dirname(os.path.abspath(__file__))
DATASETS_DIR = os.path.join(BASE_DIR, "datasets")
os.makedirs(DATASETS_DIR, exist_ok=True)

# ─── Dataset configurations ──────────────────────────────────────────────────
DATASETS = {
    "ham10000": {
        "name":    "HAM10000",
        "slug":    "kmader/skin-cancer-mnist-ham10000",
        "dest":    "skin-cancer-mnist-ham10000",
        "desc":    "10,000 dermatoscopy images — 7 skin disease classes",
    },
    "pad": {
        "name":    "PAD-UFES-20",
        "slug":    "mahdavi1986/pad-ufes-20",
        "dest":    "pad-ufes-20",
        "desc":    "Clinical images from Brazilian patients — 6 disease classes",
    },
    "fitzpatrick": {
        "name":    "Fitzpatrick17k",
        "slug":    "easonnie/fitzpatrick17k",
        "dest":    "fitzpatrick17k",
        "desc":    "17,000 images across all Fitzpatrick skin tones",
    },
}


def check_kaggle():
    """Verify Kaggle CLI is installed and API token exists."""
    # Try importing kaggle
    try:
        import kaggle  # noqa: F401
        return True
    except ImportError:
        pass

    # Try subprocess
    try:
        result = subprocess.run(["kaggle", "--version"], capture_output=True, text=True)
        if result.returncode == 0:
            return True
    except FileNotFoundError:
        pass

    print("❌ Kaggle CLI not found.")
    print("   Install it:  pip install kaggle")
    print("   Then place your kaggle.json at ~/.kaggle/kaggle.json")
    print("   (Get API token at https://www.kaggle.com/account)")
    return False


def download_dataset(key: str):
    """Download and unzip a single Kaggle dataset."""
    cfg  = DATASETS[key]
    dest = os.path.join(DATASETS_DIR, cfg["dest"])

    print(f"\n{'─'*55}")
    print(f"  📥 {cfg['name']}")
    print(f"  {cfg['desc']}")
    print(f"  Destination: {dest}")
    print(f"{'─'*55}")

    if os.path.exists(dest) and len(os.listdir(dest)) > 2:
        print(f"  ✅ Already downloaded — skipping (delete '{dest}' to re-download)")
        return True

    os.makedirs(dest, exist_ok=True)

    cmd = [
        "kaggle", "datasets", "download",
        "-d", cfg["slug"],
        "-p", dest,
        "--unzip",
    ]

    print(f"  Running: {' '.join(cmd)}")
    result = subprocess.run(cmd, capture_output=False, text=True)

    if result.returncode != 0:
        print(f"  ❌ Download failed for {cfg['name']}")
        return False

    print(f"  ✅ {cfg['name']} downloaded and extracted successfully!")
    return True


def verify_datasets():
    """Print a summary of what exists."""
    print(f"\n{'═'*55}")
    print("  Dataset Verification Summary")
    print(f"{'═'*55}")
    for key, cfg in DATASETS.items():
        dest = os.path.join(DATASETS_DIR, cfg["dest"])
        if os.path.exists(dest):
            count = sum(len(files) for _, _, files in os.walk(dest))
            print(f"  ✅ {cfg['name']:<20} {count:>7} files in {dest}")
        else:
            print(f"  ❌ {cfg['name']:<20} NOT FOUND")
    print()


def main():
    parser = argparse.ArgumentParser(description="DermaSense Dataset Downloader v2.0")
    parser.add_argument("--all",         action="store_true", help="Download all datasets")
    parser.add_argument("--ham10000",    action="store_true", help="Download HAM10000")
    parser.add_argument("--pad",         action="store_true", help="Download PAD-UFES-20")
    parser.add_argument("--fitzpatrick", action="store_true", help="Download Fitzpatrick17k")
    parser.add_argument("--verify",      action="store_true", help="Verify downloaded datasets")
    args = parser.parse_args()

    if args.verify:
        verify_datasets()
        return

    if not any([args.all, args.ham10000, args.pad, args.fitzpatrick]):
        parser.print_help()
        sys.exit(0)

    if not check_kaggle():
        sys.exit(1)

    print("\n" + "═"*55)
    print("  DermaSense AI — Dataset Downloader v2.0")
    print("═"*55)

    to_download = []
    if args.all or args.ham10000:    to_download.append("ham10000")
    if args.all or args.pad:         to_download.append("pad")
    if args.all or args.fitzpatrick: to_download.append("fitzpatrick")

    results = {}
    for key in to_download:
        results[key] = download_dataset(key)

    verify_datasets()

    all_ok = all(results.values())
    if all_ok:
        print("  🎉 All datasets ready! Run 'python train_model.py' to start training.\n")
    else:
        failed = [DATASETS[k]["name"] for k, v in results.items() if not v]
        print(f"  ⚠️ Some datasets failed: {failed}\n")


if __name__ == "__main__":
    main()
