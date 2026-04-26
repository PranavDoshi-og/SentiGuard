import sys
import re
import os
from pathlib import Path

# Add backend to path so we can import the predictor
sys.path.insert(0, str(Path(__file__).parent / "backend"))
from app.ml.predictor import PhishingPredictor

def run_tests():
    predictor = PhishingPredictor()
    
    # Check if model exists, if not, wait for it or inform user
    # predictor.load_model() runs automatically but we can check if it's initialized
    
    md_path = Path(__file__).parent / "TEST_URLS.md"
    if not md_path.exists():
        print("TEST_URLS.md not found!")
        return
        
    with open(md_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Extract URLs from markdown format: "1. `https://...`"
    # Regex looks for lines starting with a number, period, space, backtick, then capturing the URL, then backtick
    pattern = re.compile(r'\d+\.\s+`([^`]+)`')
    matches = pattern.findall(content)
    
    if not matches:
        print("No URLs found in TEST_URLS.md!")
        return
        
    print(f"Found {len(matches)} URLs to test. Running predictions...\n")
    
    results_md = "# 🛡️ SentiGuard Model Evaluation Report\n\n"
    results_md += f"Evaluated **{len(matches)}** curated URLs against the Random Forest classifier.\n\n"
    
    results_md += "| No. | URL | Expected | Predicted | Confidence | Result |\n"
    results_md += "|-----|-----|----------|-----------|------------|--------|\n"
    
    correct_count = 0
    total = len(matches)
    
    for i, url in enumerate(matches, 1):
        # We know from TEST_URLS.md that 1-25 are safe, 26-50 are phishing
        expected = "SAFE" if i <= 25 else "PHISHING"
        
        # Run prediction
        try:
            from app.ml.feature_extractor import extract_features
            features = extract_features(url)
            result = predictor.predict(features)
            predicted = "PHISHING" if result["is_phishing"] else "SAFE"
            confidence = result["confidence"]
        except Exception as e:
            predicted = "ERROR"
            confidence = 0.0
            print(f"Error evaluating {url}: {e}")
            
        is_correct = (expected == predicted)
        if is_correct:
            correct_count += 1
            icon = "✅"
        else:
            icon = "❌"
            
        results_md += f"| {i} | `{url}` | {expected} | **{predicted}** | {confidence:.2%} | {icon} |\n"
        
    accuracy = correct_count / total
    print(f"\nEvaluation complete. Accuracy: {accuracy:.2%} ({correct_count}/{total})\n")
    
    results_md += f"\n## 📊 Summary\n"
    results_md += f"- **Total Tested:** {total}\n"
    results_md += f"- **Correct Predictions:** {correct_count}\n"
    results_md += f"- **Overall Accuracy:** {accuracy:.2%}\n"
    
    # Save the report
    report_path = Path(__file__).parent / "TEST_REPORT.md"
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(results_md)
        
    print(f"Detailed report saved to {report_path.name}")

if __name__ == "__main__":
    run_tests()
