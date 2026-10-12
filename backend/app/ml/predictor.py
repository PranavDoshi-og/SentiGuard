"""
SentiGuard - Advanced Phishing Predictor & SHAP Explainability Engine
───────────────────────────────────────────────────────────────────
Loads the trained ML classifier (LightGBM or Random Forest) and computes
both class probabilities and feature-level attribution explanations using SHAP.
"""

import json
import os
import pickle
import warnings
from pathlib import Path
from typing import Any

# Filter benign shap version notice for LightGBM/TreeExplainer
warnings.filterwarnings("ignore", category=UserWarning, module="shap")

import numpy as np

from app.ml.feature_extractor import features_to_vector, get_feature_names
from app.utils.logger import setup_logger

logger = setup_logger("sentiguard.ml.predictor")

MODEL_DIR = Path(__file__).parent.parent.parent / "models"
MODEL_PATH = MODEL_DIR / "phishing_model.pkl"
METADATA_PATH = MODEL_DIR / "model_metadata.json"

# Human-readable labels for explainable AI outputs
FEATURE_DISPLAY_NAMES = {
    "url_length": "URL Character Length",
    "domain_length": "Domain Name Length",
    "path_length": "Path String Length",
    "has_https": "HTTPS Encryption",
    "has_http": "Plain HTTP (Unencrypted)",
    "num_dots": "Dot Count in URL",
    "subdomain_count": "Subdomain Depth",
    "has_ip_address": "Raw IP Address as Hostname",
    "has_suspicious_tld": "Suspicious / Ephemeral TLD",
    "is_trusted_domain": "Verified Enterprise Domain",
    "has_at_symbol": "Embedded @ Authentication Delimiter",
    "has_double_slash": "Mid-URL Double Slash Redirection",
    "num_hyphens": "Hyphen Count in URL",
    "has_underscore": "Underscore in Domain Name",
    "num_digits_in_domain": "Numeric Digits in Domain",
    "has_hex_encoding": "Hexadecimal Encoding (%xx)",
    "has_unicode_escape": "Unicode Escape Characters",
    "num_encoded_chars": "Obfuscated Encoded Characters Count",
    "num_params": "Query Parameters Count",
    "query_length": "Query String Length",
    "has_login_keyword": "Authentication / Credential Keyword",
    "has_bank_keyword": "Financial / Payment Keyword",
    "has_free_keyword": "Reward / Clickbait Keyword",
    "path_depth": "Path Slash Depth",
    "has_exe_extension": "Executable / Script File Extension",
    "is_url_shortener": "Known URL Shortener Service",
    "has_brand_spoofing": "Deceptive Brand Impersonation",
    "has_digit_substitution": "Homoglyph / Digit Substitution",
    "domain_age_days": "WHOIS Registration Age (Days)",
    "time_to_expiry_days": "WHOIS Time to Expiry (Days)",
    "has_dns_a_record": "DNS A/AAAA Record Resolution",
    "has_dns_mx_record": "Mail Exchange (MX) Record Presence",
    "dns_resolved_ips_count": "Resolved IP Addresses Count",
    "has_valid_ssl": "Valid TLS/SSL Certificate",
    "ssl_days_to_expiry": "SSL Certificate Expiration Window",
    "is_free_ssl_issuer": "Automated / Free SSL Certificate Authority",
}


class PhishingPredictor:
    """
    Production-grade ML predictor supporting LightGBM, Random Forest,
    and SHAP (SHapley Additive exPlanations) for zero-day threat transparency.
    """

    def __init__(self, model_path: Path = MODEL_PATH):
        self.model = None
        self.explainer = None
        self.model_type = "None"
        self.model_path = model_path
        self.metadata = {}
        self._load_model()

    def _load_model(self):
        """Loads trained weights, metadata, and initializes the SHAP TreeExplainer."""
        if self.model_path.exists():
            try:
                with open(self.model_path, "rb") as f:
                    self.model = pickle.load(f)

                # Determine model architecture
                cls_name = type(self.model).__name__
                if "LGBM" in cls_name:
                    self.model_type = "LightGBM"
                elif "RandomForest" in cls_name:
                    self.model_type = "RandomForest"
                else:
                    self.model_type = cls_name

                # Load metadata if present
                if METADATA_PATH.exists():
                    try:
                        with open(METADATA_PATH, "r", encoding="utf-8") as mf:
                            self.metadata = json.load(mf)
                    except Exception as e:
                        logger.warning(f"Failed to read model metadata: {e}")

                logger.info(f"Loaded {self.model_type} model from {self.model_path}")

                # Initialize SHAP TreeExplainer
                self._init_shap_explainer()

            except Exception as e:
                logger.warning(f"Failed to load model from {self.model_path}: {e}. Using heuristic fallback.")
                self.model = None
                self.explainer = None
                self.model_type = "Heuristic Rule-Engine"
        else:
            logger.warning(
                f"No model found at {self.model_path}. "
                "Run ml_training/train.py to train and save a model. "
                "Using heuristic fallback."
            )
            self.model = None
            self.explainer = None
            self.model_type = "Heuristic Rule-Engine"

    def _init_shap_explainer(self):
        """Precomputes SHAP TreeExplainer for fast per-request inference explanations."""
        if self.model is None:
            self.explainer = None
            return

        try:
            import shap
            # TreeExplainer is heavily optimized for LightGBM and RandomForest
            self.explainer = shap.TreeExplainer(self.model)
            logger.info("SHAP TreeExplainer initialized successfully.")
        except Exception as e:
            logger.warning(f"Could not initialize SHAP explainer: {e}. Explanations will use feature importances.")
            self.explainer = None

    def predict(self, features: dict[str, Any], include_shap: bool = True) -> dict[str, Any]:
        """
        Infers phishing probability and provides per-feature SHAP explainability.
        Returns:
            {
                "is_phishing": bool,
                "confidence": float,
                "model_type": str,
                "shap_explanations": list[dict]
            }
        """
        if self.model is not None:
            return self._ml_predict(features, include_shap=include_shap)
        else:
            return self._heuristic_predict(features)

    def _ml_predict(self, features: dict[str, Any], include_shap: bool = True) -> dict[str, Any]:
        """ML inference with SHAP feature attribution."""
        try:
            vec = features_to_vector(features)
            vector = np.array(vec, dtype=np.float64).reshape(1, -1)

            prediction = int(self.model.predict(vector)[0])
            proba = self.model.predict_proba(vector)[0]
            confidence = float(proba[1] if prediction == 1 else proba[0])

            is_phishing = bool(prediction == 1)
            explanations = []

            if include_shap:
                explanations = self._compute_shap_explanations(vector, features, is_phishing)

            return {
                "is_phishing": is_phishing,
                "confidence": round(confidence, 4),
                "model_type": self.model_type,
                "shap_explanations": explanations,
            }
        except Exception as e:
            logger.error(f"ML prediction error: {e}. Falling back to heuristic engine.")
            return self._heuristic_predict(features)

    def _compute_shap_explanations(
        self, vector: np.ndarray, features: dict[str, Any], is_phishing: bool
    ) -> list[dict[str, Any]]:
        """
        Calculates exact per-feature contributions towards the verdict using SHAP.
        """
        feature_names = get_feature_names()
        contributions = []

        if self.explainer is not None:
            try:
                raw_shap = self.explainer.shap_values(vector)

                # Extract positive class (phishing) SHAP values
                if isinstance(raw_shap, list):
                    # Multi-class list format [class_0, class_1]
                    vals = raw_shap[1][0] if len(raw_shap) > 1 else raw_shap[0][0]
                elif isinstance(raw_shap, np.ndarray):
                    if raw_shap.ndim == 3:  # (samples, features, classes)
                        vals = raw_shap[0, :, 1]
                    elif raw_shap.ndim == 2:  # (samples, features)
                        vals = raw_shap[0]
                    else:
                        vals = raw_shap.flatten()
                else:
                    vals = np.array(raw_shap).flatten()

                for name, val in zip(feature_names, vals):
                    val_float = float(val)
                    if abs(val_float) < 1e-4:
                        continue
                    direction = "phishing" if val_float > 0 else "safe"
                    contributions.append({
                        "feature": name,
                        "label": FEATURE_DISPLAY_NAMES.get(name, name.replace("_", " ").title()),
                        "impact": round(val_float, 4),
                        "direction": direction,
                        "abs_impact": abs(val_float),
                    })

                # Sort by absolute influence and return top contributors
                contributions.sort(key=lambda x: x["abs_impact"], reverse=True)
                for item in contributions:
                    del item["abs_impact"]

                return contributions[:7]

            except Exception as e:
                logger.warning(f"SHAP explanation calculation failed: {e}")

        # Fallback if SHAP calculation was unavailable: use feature importances if present
        if hasattr(self.model, "feature_importances_"):
            importances = self.model.feature_importances_
            sorted_indices = np.argsort(importances)[::-1][:7]
            for idx in sorted_indices:
                fname = feature_names[idx]
                feat_val = features.get(fname, 0.0)
                if feat_val > 0 or fname in ("domain_age_days", "has_dns_a_record", "has_valid_ssl"):
                    contributions.append({
                        "feature": fname,
                        "label": FEATURE_DISPLAY_NAMES.get(fname, fname.replace("_", " ").title()),
                        "impact": round(float(importances[idx]), 4),
                        "direction": "phishing" if is_phishing else "safe",
                    })

        return contributions

    def _heuristic_predict(self, features: dict[str, Any]) -> dict[str, Any]:
        """
        Robust heuristic fallback when no ML weights are present.
        Evaluates both lexical indicators and live network telemetry.
        """
        score = 0
        signals = []

        # Network risk checks
        if features.get("has_dns_a_record", 1.0) == 0.0:
            score += 35
            signals.append(("has_dns_a_record", 0.35, "phishing"))

        if not features.get("has_https"):
            score += 20
            signals.append(("has_https", 0.20, "phishing"))

        if features.get("has_valid_ssl", 1.0) == 0.0 and features.get("has_https"):
            score += 25
            signals.append(("has_valid_ssl", 0.25, "phishing"))

        if features.get("is_free_ssl_issuer"):
            score += 15
            signals.append(("is_free_ssl_issuer", 0.15, "phishing"))

        domain_age = features.get("domain_age_days", -1.0)
        if 0 <= domain_age < 30:
            score += 30
            signals.append(("domain_age_days", 0.30, "phishing"))
        elif domain_age > 365:
            score -= 25
            signals.append(("domain_age_days", -0.25, "safe"))

        if features.get("has_brand_spoofing"):
            score += 35
            signals.append(("has_brand_spoofing", 0.35, "phishing"))

        if features.get("has_digit_substitution"):
            score += 30
            signals.append(("has_digit_substitution", 0.30, "phishing"))

        if features.get("is_url_shortener"):
            score += 25
            signals.append(("is_url_shortener", 0.25, "phishing"))

        if features.get("has_ip_address"):
            score += 30
            signals.append(("has_ip_address", 0.30, "phishing"))

        if features.get("has_at_symbol"):
            score += 25
            signals.append(("has_at_symbol", 0.25, "phishing"))

        if features.get("has_suspicious_tld"):
            score += 25
            signals.append(("has_suspicious_tld", 0.25, "phishing"))

        if features.get("has_double_slash"):
            score += 15
            signals.append(("has_double_slash", 0.15, "phishing"))

        if features.get("url_length", 0) > 75:
            score += 10
            signals.append(("url_length", 0.10, "phishing"))

        if features.get("num_dots", 0) > 4:
            score += 10
            signals.append(("num_dots", 0.10, "phishing"))

        if features.get("num_hyphens", 0) > 3:
            score += 10
            signals.append(("num_hyphens", 0.10, "phishing"))

        if features.get("has_login_keyword"):
            score += 15
            signals.append(("has_login_keyword", 0.15, "phishing"))

        if features.get("has_bank_keyword"):
            score += 15
            signals.append(("has_bank_keyword", 0.15, "phishing"))

        if features.get("has_free_keyword"):
            score += 15
            signals.append(("has_free_keyword", 0.15, "phishing"))

        if features.get("has_hex_encoding"):
            score += 15
            signals.append(("has_hex_encoding", 0.15, "phishing"))

        if features.get("is_trusted_domain"):
            score -= 50
            signals.append(("is_trusted_domain", -0.50, "safe"))

        score = max(0, min(100, score))
        is_phishing = score >= 40
        confidence = score / 100.0 if is_phishing else (100.0 - score) / 100.0

        explanations = [
            {
                "feature": k,
                "label": FEATURE_DISPLAY_NAMES.get(k, k.replace("_", " ").title()),
                "impact": round(v, 4),
                "direction": direction,
            }
            for k, v, direction in signals
        ]
        explanations.sort(key=lambda x: abs(x["impact"]), reverse=True)

        return {
            "is_phishing": is_phishing,
            "confidence": round(confidence, 4),
            "model_type": "Heuristic Rule-Engine",
            "shap_explanations": explanations[:7],
        }

    def reload(self):
        """Hot-reloads model weights and explainers after retraining."""
        self._load_model()
