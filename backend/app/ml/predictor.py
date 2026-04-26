"""
SentiGuard - Phishing Predictor
Loads the trained Random Forest model and makes predictions.
"""

import os
import pickle
import numpy as np
from pathlib import Path

from app.ml.feature_extractor import features_to_vector
from app.utils.logger import setup_logger

logger = setup_logger("sentiguard.ml.predictor")

# Default model path relative to project root
MODEL_PATH = Path(__file__).parent.parent.parent / "models" / "phishing_model.pkl"


class PhishingPredictor:
    """
    Loads a trained scikit-learn model and provides predict() method.
    Falls back to a rule-based heuristic if no model file is found.
    """

    def __init__(self, model_path: Path = MODEL_PATH):
        self.model = None
        self.model_path = model_path
        self._load_model()

    def _load_model(self):
        if self.model_path.exists():
            try:
                with open(self.model_path, "rb") as f:
                    self.model = pickle.load(f)
                logger.info(f"Model loaded from {self.model_path}")
            except Exception as e:
                logger.warning(f"Failed to load model: {e}. Using heuristic fallback.")
                self.model = None
        else:
            logger.warning(
                f"No model found at {self.model_path}. "
                "Run ml_training/train.py to train and save a model. "
                "Using heuristic fallback for now."
            )

    def predict(self, features: dict) -> dict:
        """
        Returns: {"is_phishing": bool, "confidence": float}
        """
        if self.model is not None:
            return self._ml_predict(features)
        else:
            return self._heuristic_predict(features)

    def _ml_predict(self, features: dict) -> dict:
        """Use the trained Random Forest model."""
        try:
            vector = np.array(features_to_vector(features)).reshape(1, -1)
            prediction = self.model.predict(vector)[0]
            proba = self.model.predict_proba(vector)[0]
            confidence = float(max(proba))
            return {
                "is_phishing": bool(prediction == 1),
                "confidence": confidence,
            }
        except Exception as e:
            logger.error(f"ML prediction failed: {e}. Falling back to heuristic.")
            return self._heuristic_predict(features)

    def _heuristic_predict(self, features: dict) -> dict:
        """
        Rule-based fallback when no ML model is available.
        Counts risk signals and computes a simple phishing score.
        """
        score = 0

        if not features.get("has_https"):        score += 20
        if features.get("has_ip_address"):        score += 30
        if features.get("has_at_symbol"):         score += 25
        if features.get("has_suspicious_tld"):    score += 20
        if features.get("has_double_slash"):      score += 15
        if features.get("url_length", 0) > 75:    score += 10
        if features.get("num_dots", 0) > 4:       score += 10
        if features.get("num_hyphens", 0) > 3:    score += 10
        if features.get("has_login_keyword"):     score += 15
        if features.get("has_bank_keyword"):      score += 10
        if features.get("has_hex_encoding"):      score += 15
        if features.get("is_trusted_domain"):     score -= 40

        score = max(0, min(100, score))
        is_phishing = score >= 40
        confidence = score / 100 if is_phishing else (100 - score) / 100

        return {
            "is_phishing": is_phishing,
            "confidence": round(confidence, 4),
        }

    def reload(self):
        """Hot-reload the model (useful after retraining)."""
        self._load_model()
