"""
SentiGuard - ML Training Script
────────────────────────────────────────────────────────────
Trains a Random Forest classifier on URL features for phishing detection.

DATASET OPTIONS (free, public):
  1. UCI Phishing Websites Dataset:
     https://archive.ics.uci.edu/dataset/327/phishing+websites

  2. Kaggle - Web Page Phishing Detection Dataset:
     https://www.kaggle.com/datasets/shashwatwork/web-page-phishing-detection-dataset

  3. PhishTank (live phishing URLs):
     https://www.phishtank.com/developer_info.php

  4. Tranco List (legitimate URLs):
     https://tranco-list.eu/

HOW TO RUN:
  cd SentiGuard
  python ml_training/train.py

  Or with a custom CSV:
  python ml_training/train.py --data your_dataset.csv --label label_column
"""

import sys
import pickle
import argparse
import numpy as np
import pandas as pd
from pathlib import Path
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score
from sklearn.preprocessing import LabelEncoder

# Add backend to path so we can import feature extractor
sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))
from app.ml.feature_extractor import extract_features, get_feature_names

MODEL_SAVE_PATH = Path(__file__).parent.parent / "backend" / "models" / "phishing_model.pkl"
MODEL_SAVE_PATH.parent.mkdir(exist_ok=True)


def generate_demo_dataset(n_samples: int = 2000) -> pd.DataFrame:
    """
    Generates a small synthetic dataset for testing.
    NOT suitable for production – replace with a real dataset.
    """
    print("⚠️  No dataset provided. Generating synthetic demo data...")
    print("   For real training, download a dataset from the sources in the docstring.\n")

    phishing_urls = [
        "http://192.168.1.1/login/paypal/verify",
        "http://paypa1-secure.tk/update-account",
        "http://secure-login-amazon.ml/signin",
        "http://free-prize-winner.xyz/claim?id=12345&token=abc",
        "http://bank-of-america-update.cf/verify@user",
        "http://login-apple-id-suspended.top/",
        "http://microsoft-security-alert.gq/download.exe",
        "http://paypal.com.phishing-test.tk/login",
    ] * (n_samples // 16)

    safe_urls = [
        "https://www.google.com/search?q=python",
        "https://github.com/sentiguard/project",
        "https://www.microsoft.com/en-us/",
        "https://stackoverflow.com/questions/tagged/python",
        "https://www.amazon.com/products",
        "https://linkedin.com/in/user",
        "https://docs.python.org/3/library/",
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    ] * (n_samples // 16)

    rows = []
    for url in phishing_urls[:n_samples // 2]:
        f = extract_features(url)
        f["label"] = 1
        rows.append(f)
    for url in safe_urls[:n_samples // 2]:
        f = extract_features(url)
        f["label"] = 0
        rows.append(f)

    return pd.DataFrame(rows)


def load_dataset(csv_path: str, label_col: str) -> pd.DataFrame:
    """Load a real CSV dataset."""
    print(f"Loading dataset: {csv_path}")
    df = pd.read_csv(csv_path)
    print(f"  Shape: {df.shape}")
    print(f"  Label distribution:\n{df[label_col].value_counts()}\n")

    # Rename label column to 'label'
    df = df.rename(columns={label_col: "label"})

    # If URLs are in the CSV, extract features
    if "url" in df.columns:
        print("  Extracting URL features...")
        features = df["url"].apply(extract_features)
        feature_df = pd.DataFrame(features.tolist())
        df = pd.concat([feature_df, df[["label"]]], axis=1)

    return df


def train(df: pd.DataFrame):
    """Train and evaluate the Random Forest model."""
    feature_names = get_feature_names()

    # ── Prepare Data ──────────────────────────────────────
    X = df[feature_names].astype(float).values
    y = df["label"].astype(int).values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print(f"Training samples: {len(X_train)} | Test samples: {len(X_test)}\n")

    # ── Train Model ───────────────────────────────────────
    print("Training Random Forest...")
    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=15,
        min_samples_split=5,
        min_samples_leaf=2,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)

    # ── Evaluate ──────────────────────────────────────────
    y_pred = model.predict(X_test)
    y_proba = model.predict_proba(X_test)[:, 1]

    print("\n─── Classification Report ────────────────────────")
    print(classification_report(y_test, y_pred, target_names=["SAFE", "PHISHING"]))

    print("─── Confusion Matrix ─────────────────────────────")
    cm = confusion_matrix(y_test, y_pred)
    print(f"  True Negative (correct SAFE):     {cm[0][0]}")
    print(f"  False Positive (flagged as phish): {cm[0][1]}")
    print(f"  False Negative (missed phish):     {cm[1][0]}")
    print(f"  True Positive (caught phish):      {cm[1][1]}")

    print(f"\n─── ROC-AUC Score: {roc_auc_score(y_test, y_proba):.4f} ────────────────")

    # Cross-validation
    cv_scores = cross_val_score(model, X, y, cv=5, scoring="f1")
    print(f"  5-Fold CV F1 Scores: {cv_scores.round(3)}")
    print(f"  Mean F1: {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")

    # Feature importance
    print("\n─── Top 10 Important Features ────────────────────")
    importances = model.feature_importances_
    indices = np.argsort(importances)[::-1][:10]
    for i, idx in enumerate(indices, 1):
        print(f"  {i:2d}. {feature_names[idx]:<30} {importances[idx]:.4f}")

    return model


def save_model(model):
    with open(MODEL_SAVE_PATH, "wb") as f:
        pickle.dump(model, f)
    print(f"\n✅ Model saved to: {MODEL_SAVE_PATH}")
    print("   The API will automatically load this model on next startup.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train SentiGuard phishing detection model")
    parser.add_argument("--data",  type=str, default=None, help="Path to CSV dataset")
    parser.add_argument("--label", type=str, default="label", help="Name of label column in CSV")
    args = parser.parse_args()

    if args.data:
        df = load_dataset(args.data, args.label)
    else:
        df = generate_demo_dataset(n_samples=2000)

    model = train(df)
    save_model(model)
