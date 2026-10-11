# 🛡️ SentiGuard — Comprehensive Enhancement Roadmap & Execution Plan

> A structured, engineering-grade execution plan for advancing SentiGuard into an enterprise cyber threat intelligence and zero-day phishing detection ecosystem.

---

## 📋 Table of Contents
1. [Executive Summary & Architecture Goals](#-executive-summary--architecture-goals)
2. [Git Workflow & Branching Strategy](#-git-workflow--branching-strategy)
3. [Phase 1: ML Intelligence & Live Network Features](#-phase-1-ml-intelligence--live-network-features-p0)
4. [Phase 2: Backend Resilience, Caching & Threat Feeds](#-phase-2-backend-resilience-caching--threat-feeds-p1)
5. [Phase 3: Browser Extension Active Navigation Shield](#-phase-3-browser-extension-active-navigation-shield-p2)
6. [Phase 4: Frontend Consolidation & Deep Inspector UI](#-phase-4-frontend-consolidation--deep-inspector-ui-p1)
7. [Phase 5: CI/CD Pipeline, Automated Benchmarking & Releases](#-phase-5-cicd-pipeline-automated-benchmarking--releases-p2)
8. [Master Git Commands Cheat Sheet](#-master-git-commands-cheat-sheet)

---

## 🎯 Executive Summary & Architecture Goals

SentiGuard combines fast client-side PWA heuristics with machine learning threat classification. The objective of this roadmap is to transition SentiGuard from a lexical prototype into an active, enterprise-ready security intelligence platform capable of sub-2ms cached reputations, live network profiling, explainable zero-day detection, and real-time browser protection.

```
                    ┌────────────────────────────────────────────────────────┐
                    │                   SentiGuard Client                    │
                    │  (Website PWA / Browser Extension / Optical Camera QR) │
                    └───────────────────────────┬────────────────────────────┘
                                                │ REST / WebSockets
                                                ▼
                    ┌────────────────────────────────────────────────────────┐
                    │               FastAPI API Gateway Layer                │
                    │   - SlowAPI Rate Limiter  - In-Memory / Redis LRU Cache│
                    └───────────────┬────────────────────────┬───────────────┘
                                    │                        │
         [Cache Hit: <2ms] ◄────────┘                        ▼ [Cache Miss]
                                            ┌────────────────────────────────┐
                                            │      Hybrid Scoring Engine     │
                                            └───────┬────────────────┬───────┘
                                                    │                │
                        ┌───────────────────────────┴────┐           └───────────────────────────┐
                        ▼                                ▼                                       ▼
        ┌───────────────────────────────┐ ┌───────────────────────────────┐     ┌─────────────────────────────────┐
        │    External Threat Feeds      │ │     Live Network Profiler     │     │     Ensemble ML Classifier      │
        │ - Google Safe Browsing API v4 │ │ - WHOIS Domain Registration   │     │ - LightGBM / Random Forest      │
        │ - Cloudflare Radar API        │ │ - DNS / MX Record Validation  │     │ - 30+ Lexical & Structural Feat │
        │ - OpenPhish / PhishTank Sync  │ │ - SSL/TLS Certificate Chains  │     │ - SHAP Feature Explainability   │
        └───────────────────────────────┘ └───────────────────────────────┘     └─────────────────────────────────┘
```

---

## 🌿 Git Workflow & Branching Strategy

To maintain codebase stability across development phases, follow the standard trunk-based feature branch workflow:

- `main`: Production-ready branch. Deployed automatically to Render, Vercel, and Netlify.
- `feature/<phase-name>`: Scoped feature branch for specific phase implementations.
- `hotfix/<fix-name>`: Immediate production patches.

---

## 🚀 Phase 1: ML Intelligence & Live Network Features (P0)

### Objective
Expand the feature extraction pipeline beyond static string properties to include live network characteristics (WHOIS age, DNS resolution, MX records, SSL certs), train on verified threat feeds, and integrate explainable AI (SHAP).

### Technical Tasks
1. **Live Domain Profiling**:
   - Add `python-whois` to extract `domain_age_days` and `time_to_expiry`.
   - Add `dnspython` to check valid A/AAAA records and MX record presence.
   - Inspect SSL/TLS issuer and expiration windows using standard `ssl` and `socket`.
2. **Dataset Expansion**:
   - Fetch verified malicious URLs from [OpenPhish](https://openphish.com/) and [PhishTank](https://phishtank.org/).
   - Fetch verified benign domains from [Tranco Top 1M](https://tranco-list.eu/).
3. **Model Upgrade & Explainability**:
   - Benchmark `LightGBM` vs `RandomForestClassifier` in [`ml_training/train.py`](file:///d:/OTHERS/2nd%20year/SentiGuard/ml_training/train.py).
   - Integrate `shap` tree explainer in [`backend/app/ml/predictor.py`](file:///d:/OTHERS/2nd%20year/SentiGuard/backend/app/ml/predictor.py) to return per-feature contribution percentages.

### Affected Files
- [`backend/app/ml/feature_extractor.py`](file:///d:/OTHERS/2nd%20year/SentiGuard/backend/app/ml/feature_extractor.py)
- [`backend/app/ml/predictor.py`](file:///d:/OTHERS/2nd%20year/SentiGuard/backend/app/ml/predictor.py)
- [`ml_training/train.py`](file:///d:/OTHERS/2nd%20year/SentiGuard/ml_training/train.py)
- [`backend/requirements.txt`](file:///d:/OTHERS/2nd%20year/SentiGuard/backend/requirements.txt)
- [`test_runner.py`](file:///d:/OTHERS/2nd%20year/SentiGuard/test_runner.py)

### Git Execution Commands
```bash
# 1. Ensure working directory is clean on main
git checkout main
git pull origin main

# 2. Create feature branch
git checkout -b feature/ml-network-intelligence

# 3. Install new dependencies and update requirements
pip install python-whois dnspython lightgbm shap
pip freeze > backend/requirements.txt

# 4. Implement code changes in feature_extractor.py, train.py, and predictor.py
# (Edit files, retrain model)
python ml_training/train.py
python test_runner.py

# 5. Stage, commit and push
git status
git add backend/ requirements.txt ml_training/ test_runner.py
git commit -m "feat(ml): integrate WHOIS domain age, DNS resolution, and LightGBM model"
git push -u origin feature/ml-network-intelligence

# 6. Merge into main after validation
git checkout main
git merge --no-ff feature/ml-network-intelligence -m "merge: incorporate Phase 1 ML network intelligence"
git push origin main
```

---

## ⚡ Phase 2: Backend Resilience, Caching & Threat Feeds (P1)

### Objective
Implement sub-2ms reputation caching, rate limiting, external intelligence feeds (Google Safe Browsing), scan persistence, and a false-positive reporting endpoint.

### Technical Tasks
1. **High-Speed Cache Layer**:
   - Add an in-memory TTL cache (`cachetools.TTLCache`) in [`backend/app/services/scan_service.py`](file:///d:/OTHERS/2nd%20year/SentiGuard/backend/app/services/scan_service.py) with fallback to optional Redis.
2. **API Abuse Protection**:
   - Add `slowapi` rate limiting to [`backend/app/routes/scan.py`](file:///d:/OTHERS/2nd%20year/SentiGuard/backend/app/routes/scan.py) (e.g., 60 scans/min per client IP).
3. **Multi-Engine Hybrid Scoring**:
   - Support optional external verification via Google Safe Browsing API v4 or Cloudflare Radar API when an API key is configured in `.env`.
4. **Telemetry & False-Positive Reporting**:
   - Add SQLite / SQLAlchemy storage for logging scan verdicts.
   - Implement `POST /api/scan/report` for community dispute and retraining loop.

### Affected Files
- [`backend/app/services/scan_service.py`](file:///d:/OTHERS/2nd%20year/SentiGuard/backend/app/services/scan_service.py)
- [`backend/app/routes/scan.py`](file:///d:/OTHERS/2nd%20year/SentiGuard/backend/app/routes/scan.py)
- [`backend/main.py`](file:///d:/OTHERS/2nd%20year/SentiGuard/backend/main.py)
- [`backend/requirements.txt`](file:///d:/OTHERS/2nd%20year/SentiGuard/backend/requirements.txt)

### Git Execution Commands
```bash
# 1. Create feature branch
git checkout -b feature/backend-caching-feeds

# 2. Add dependencies (cachetools, slowapi, aiohttp)
pip install cachetools slowapi aiohttp
pip freeze > backend/requirements.txt

# 3. Implement caching, rate limiting, and report endpoint
# (Edit scan_service.py, scan.py, main.py)

# 4. Verify local server & test scan speed
python -m uvicorn main:app --app-dir backend --port 8000 &
curl -X POST http://localhost:8000/api/scan/url -H "Content-Type: application/json" -d "{\"url\":\"https://google.com\"}"

# 5. Stage, commit and push
git add backend/
git commit -m "feat(backend): add reputation TTL cache, SlowAPI rate limiting, and feedback endpoint"
git push -u origin feature/backend-caching-feeds

# 6. Merge into main
git checkout main
git merge --no-ff feature/backend-caching-feeds -m "merge: incorporate Phase 2 backend caching & threat feeds"
git push origin main
```

---

## 🛡️ Phase 3: Browser Extension Active Navigation Shield (P2)

### Objective
Transform the passive Chrome extension ([`extension/`](file:///d:/OTHERS/2nd%20year/SentiGuard/extension)) into an active real-time shield that checks URLs before page load and displays an interstitial warning on malicious sites.

### Technical Tasks
1. **Active Interceptor**:
   - Listen to `chrome.webNavigation.onBeforeNavigate` in [`extension/background.js`](file:///d:/OTHERS/2nd%20year/SentiGuard/extension/background.js).
   - Check local cache and heuristic flags before the browser resolves untrusted links.
2. **Warning Interstitial**:
   - Create `extension/blocked.html` to display a security warning screen when `trust_score < 40%`, offering options to *Go Back to Safety* or *Proceed at Own Risk*.
3. **UI Modernization**:
   - Update [`extension/popup.html`](file:///d:/OTHERS/2nd%20year/SentiGuard/extension/popup.html) to use the dark tactical theme and SVG icon set.
4. **Allowlist Manager**:
   - Add domain whitelist functionality stored in `chrome.storage.local`.

### Affected Files
- [`extension/background.js`](file:///d:/OTHERS/2nd%20year/SentiGuard/extension/background.js)
- [`extension/manifest.json`](file:///d:/OTHERS/2nd%20year/SentiGuard/extension/manifest.json)
- [`extension/popup.html`](file:///d:/OTHERS/2nd%20year/SentiGuard/extension/popup.html)
- [`extension/popup.js`](file:///d:/OTHERS/2nd%20year/SentiGuard/extension/popup.js)
- `extension/blocked.html` (New)

### Git Execution Commands
```bash
# 1. Create feature branch
git checkout -b feature/extension-active-shield

# 2. Implement background navigation listeners and warning page
# (Edit background.js, popup.html, popup.js, manifest.json)

# 3. Stage, commit and push
git add extension/
git commit -m "feat(extension): implement active webNavigation interceptor and tactical popup UI"
git push -u origin feature/extension-active-shield

# 4. Merge into main
git checkout main
git merge --no-ff feature/extension-active-shield -m "merge: incorporate Phase 3 active extension shield"
git push origin main
```

---

## 💻 Phase 4: Frontend Consolidation & Deep Inspector UI (P1)

### Objective
Consolidate the dual frontends ([`website/`](file:///d:/OTHERS/2nd%20year/SentiGuard/website) vs [`frontend/`](file:///d:/OTHERS/2nd%20year/SentiGuard/frontend)), eliminate duplicate code maintenance, and add deep domain inspection cards (WHOIS, GeoIP, ASN, redirect trace).

### Technical Tasks
1. **Frontend Architecture Unification**:
   - **Strategy**: Keep [`website/`](file:///d:/OTHERS/2nd%20year/SentiGuard/website) as the static source of truth (zero build step, instant deployment on Vercel/Netlify/FastAPI), and archive the separate React prototype in [`frontend/`](file:///d:/OTHERS/2nd%20year/SentiGuard/frontend).
2. **Deep Domain Inspector Component**:
   - Add dedicated sections to [`website/index.html`](file:///d:/OTHERS/2nd%20year/SentiGuard/website/index.html) and [`website/js/app.js`](file:///d:/OTHERS/2nd%20year/SentiGuard/website/js/app.js):
     - **WHOIS Card**: Registrar, registration date, expiry date.
     - **Hosting & ASN Card**: Resolved IP address and autonomous system name.
     - **Redirect Tracer**: Show full path expansion for shortened links (`bit.ly`, `tinyurl.com`).
3. **Dispute / Report Action**:
   - Add a *"Report False Positive / Submit Threat"* button in the report utility bar connected to the Phase 2 backend endpoint.

### Affected Files
- [`website/index.html`](file:///d:/OTHERS/2nd%20year/SentiGuard/website/index.html)
- [`website/css/style.css`](file:///d:/OTHERS/2nd%20year/SentiGuard/website/css/style.css)
- [`website/js/app.js`](file:///d:/OTHERS/2nd%20year/SentiGuard/website/js/app.js)
- [`website/sw.js`](file:///d:/OTHERS/2nd%20year/SentiGuard/website/sw.js)

### Git Execution Commands
```bash
# 1. Create feature branch
git checkout -b feature/frontend-deep-inspector

# 2. Implement deep inspection cards and report modal in website/
# (Edit index.html, style.css, app.js, sw.js)

# 3. Stage, commit and push
git add website/
git commit -m "feat(ui): add WHOIS metadata cards, redirect tracer, and dispute action"
git push -u origin feature/frontend-deep-inspector

# 4. Merge into main
git checkout main
git merge --no-ff feature/frontend-deep-inspector -m "merge: incorporate Phase 4 deep inspector UI"
git push origin main
```

---

## ⚙️ Phase 5: CI/CD Pipeline, Automated Benchmarking & Releases (P2)

### Objective
Establish automated GitHub Actions workflows for continuous integration, code formatting, security linting, test suite execution, and model release tagging.

### Technical Tasks
1. **GitHub Actions CI Workflow**:
   - Create `.github/workflows/ci.yml` to run:
     - Python syntax and security linting (`ruff` / `flake8`).
     - Pytest test execution.
     - Accuracy verification via [`test_runner.py`](file:///d:/OTHERS/2nd%20year/SentiGuard/test_runner.py).
2. **Automated Release Packaging**:
   - Create `.github/workflows/release.yml` triggered on version tags (`v*.*.*`) to bundle the Chrome extension ZIP artifact and model weights.

### Affected Files
- `.github/workflows/ci.yml` (New)
- `.github/workflows/release.yml` (New)
- [`test_runner.py`](file:///d:/OTHERS/2nd%20year/SentiGuard/test_runner.py)

### Git Execution Commands
```bash
# 1. Create feature branch
git checkout -b feature/ci-cd-automation

# 2. Create GitHub Actions workflow directory and file
mkdir -p .github/workflows

# 3. Create .github/workflows/ci.yml
# (Define GitHub Actions steps for Python testing and linting)

# 4. Stage, commit and push
git add .github/
git commit -m "ci: add GitHub Actions workflow for linting, testing, and benchmark regression"
git push -u origin feature/ci-cd-automation

# 5. Merge into main
git checkout main
git merge --no-ff feature/ci-cd-automation -m "merge: incorporate Phase 5 CI/CD automation"
git push origin main

# 6. Tag the release
git tag -a v2.0.0 -m "Release v2.0.0: Enterprise Threat Intelligence Engine"
git push origin v2.0.0
```

---

## 🛠️ Master Git Commands Cheat Sheet

### Common Development Cycle
```bash
# Check current repository status
git status

# Inspect unstaged diffs
git diff

# Create and switch to a new branch
git checkout -b feature/<feature-name>

# Stage specific files
git add <path/to/file>

# Commit with conventional commit message format
git commit -m "feat(scope): concise description of changes"

# Push feature branch to remote origin
git push -u origin feature/<feature-name>

# Switch back to main and pull latest upstream updates
git checkout main
git pull origin main

# Merge feature branch with explicit merge commit
git merge --no-ff feature/<feature-name> -m "merge: incorporate <feature-name>"

# Push updated main to remote (triggers automatic deployment)
git push origin main

# Delete local feature branch after successful merge
git branch -d feature/<feature-name>

# Delete remote feature branch
git push origin --delete feature/<feature-name>
```

### Undoing & Stashing
```bash
# Discard local unstaged modifications in a file
git checkout -- <path/to/file>

# Temporarily stash uncommitted working state
git stash push -m "WIP: uncommitted changes"

# Restore stashed changes
git stash pop

# View concise git commit log
git log --oneline --graph -n 15
```

---

*Document generated and maintained for SentiGuard v2.0+ roadmap execution.*
