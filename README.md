# 🛡️ SentiGuard — AI-Powered Phishing Detection

> Detect phishing URLs and QR codes in real time using Machine Learning.
> Includes a FastAPI backend, Chrome Extension, and a web frontend.

---

## 📁 Project Structure

```
SentiGuard/
│
├── backend/                        ← FastAPI Python backend
│   ├── main.py                     ← App entry point
│   ├── requirements.txt
│   ├── .env.example
│   ├── models/                     ← Trained ML model saved here
│   │   └── phishing_model.pkl      ← (generated after training)
│   ├── logs/
│   │   └── sentiguard.log
│   └── app/
│       ├── routes/
│       │   ├── scan.py             ← /api/scan/url  and  /api/scan/qr
│       │   └── health.py           ← /api/health
│       ├── services/
│       │   └── scan_service.py     ← Business logic
│       ├── ml/
│       │   ├── feature_extractor.py ← 25+ URL features
│       │   └── predictor.py        ← ML model loader + inference
│       └── utils/
│           ├── logger.py
│           └── validators.py
│
├── ml_training/
│   └── train.py                    ← Train & save the Random Forest model
│
├── extension/                      ← Chrome Extension (Manifest v3)
│   ├── manifest.json
│   ├── background.js               ← Service worker (handles API calls)
│   ├── content.js                  ← Injects warning banner into pages
│   ├── popup.html / popup.js       ← Extension popup UI
│   └── assets/                     ← icon16.png, icon48.png, icon128.png
│
├── website/                        ← Frontend web app
│   ├── index.html
│   ├── css/style.css
│   └── js/app.js
│
├── .vscode/
│   ├── launch.json                 ← Run configs for VS Code
│   └── settings.json
│
└── README.md
```

---

## ⚡ Quick Start (VS Code)

### Step 1 — Clone / Open the Project

```bash
# Open VS Code in the SentiGuard folder
code SentiGuard
```

---

### Step 2 — Set Up the Python Virtual Environment

Open the **VS Code integrated terminal** (`Ctrl + `` ` ``) and run:

```bash
# Navigate to the backend folder
cd backend

# Create a virtual environment
python -m venv venv

# Activate it
# On Windows:
venv\Scripts\activate
# On macOS / Linux:
source venv/bin/activate

# Install all dependencies
pip install -r requirements.txt
```

> **Note for Windows users:** If you see a `pyzbar` error, you also need to install the
> Visual C++ redistributable or use: `pip install pyzbar --find-links https://github.com/nicowillis/pyzbar/releases`

---

### Step 3 — Run the Backend

**Option A — VS Code Run Config (recommended)**
- Press `F5` or go to **Run → Start Debugging**
- Select **"🚀 Run SentiGuard API"**

**Option B — Terminal**
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

You should see:
```
INFO  | SentiGuard API starting up...
INFO  | Visit http://localhost:8000/docs for API documentation
INFO  | Uvicorn running on http://0.0.0.0:8000
```

✅ Open **http://localhost:8000/docs** to verify the API is working.

---

### Step 4 — Train the ML Model (Optional but Recommended)

Without a trained model, the API uses a rule-based heuristic fallback. To use the
Random Forest model:

```bash
# From project root (SentiGuard/)
python ml_training/train.py
```

This generates a **synthetic demo dataset** and saves:
```
backend/models/phishing_model.pkl
```

**For better accuracy**, use a real dataset:
```bash
# After downloading a dataset CSV
python ml_training/train.py --data path/to/dataset.csv --label label_column
```

> **Recommended datasets:**
> - UCI Phishing Dataset: https://archive.ics.uci.edu/dataset/327/phishing+websites
> - Kaggle Web Page Phishing: https://www.kaggle.com/datasets/shashwatwork/web-page-phishing-detection-dataset
> - PhishTank (live URLs): https://www.phishtank.com/developer_info.php

After training, **restart the API** — it will auto-load the new model.

---

### Step 5 — Open the Website

The website is plain HTML/CSS/JS — no build step needed.

**Option A — VS Code Live Server (recommended)**
1. Install the **Live Server** extension in VS Code
2. Right-click `website/index.html` → **"Open with Live Server"**
3. Opens at `http://localhost:5500`

**Option B — Open directly**
- Double-click `website/index.html` in your file explorer

---

### Step 6 — Load the Chrome Extension

1. Open Chrome and go to: `chrome://extensions/`
2. Enable **Developer Mode** (toggle in the top right)
3. Click **"Load unpacked"**
4. Select the `SentiGuard/extension/` folder
5. The SentiGuard icon 🛡️ appears in your toolbar

> **Extension icons:** The extension expects PNG icons at `extension/assets/icon16.png`,
> `icon48.png`, `icon128.png`. Create simple placeholder icons or use any PNG images
> for development.

---

## 🔌 API Reference

| Method | Endpoint          | Description                         |
|--------|-------------------|-------------------------------------|
| GET    | `/api/health`     | Check API status                    |
| POST   | `/api/scan/url`   | Scan a URL for phishing             |
| POST   | `/api/scan/qr`    | Upload a QR image, scan extracted URL |

### POST `/api/scan/url`

**Request:**
```json
{ "url": "https://suspicious-site.tk/login" }
```

**Response:**
```json
{
  "url": "https://suspicious-site.tk/login",
  "verdict": "PHISHING",
  "trust_score": 12.5,
  "confidence": 0.875,
  "risk_factors": [
    "Suspicious top-level domain",
    "Has login keyword in URL"
  ],
  "features": {
    "has_https": true,
    "url_length": 35,
    "has_suspicious_tld": true,
    ...
  }
}
```

---

## 🧠 ML Features Extracted

The model analyzes **25+ features** from each URL:

| Category         | Features |
|------------------|----------|
| Structure        | `url_length`, `domain_length`, `path_length`, `path_depth` |
| Protocol         | `has_https`, `has_http` |
| Domain           | `num_dots`, `subdomain_count`, `has_ip_address`, `has_suspicious_tld`, `is_trusted_domain` |
| Special chars    | `has_at_symbol`, `has_double_slash`, `num_hyphens`, `has_underscore` |
| Obfuscation      | `has_hex_encoding`, `has_unicode_escape`, `num_encoded_chars` |
| Query string     | `num_params`, `query_length` |
| Keywords         | `has_login_keyword`, `has_bank_keyword`, `has_free_keyword` |
| File type        | `has_exe_extension` |

---

## 🚀 Deployment (Optional)

### Backend → Render (Free Tier)

1. Push your project to GitHub
2. Go to https://render.com → New → Web Service
3. Connect your repo, set:
   - **Root directory:** `backend`
   - **Build command:** `pip install -r requirements.txt`
   - **Start command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. After deploy, update `API_BASE` in:
   - `website/js/app.js`
   - `extension/background.js`
   - `extension/popup.js`

### Frontend → Netlify (Free)

1. Go to https://netlify.com → Add new site → Deploy manually
2. Drag & drop the `website/` folder
3. Your site is live instantly

### Frontend → Vercel (Free)

```bash
npm install -g vercel
cd website
vercel
```

---

## 🛠️ Development Tips

### Backend hot-reload
The `--reload` flag in uvicorn means the server auto-restarts when you save Python files.

### Checking logs
```bash
# Live log output
tail -f backend/logs/sentiguard.log
```

### Testing the API manually
```bash
curl -X POST http://localhost:8000/api/scan/url \
  -H "Content-Type: application/json" \
  -d '{"url": "http://free-prize.xyz/claim@user"}'
```

### Viewing API docs
FastAPI auto-generates interactive docs:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

## 📦 Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Backend     | FastAPI, Uvicorn, Pydantic          |
| ML          | scikit-learn (Random Forest), NumPy, Pandas |
| QR Decoding | pyzbar, Pillow                      |
| Frontend    | Vanilla HTML, CSS, JavaScript       |
| Extension   | Chrome Manifest v3 (Service Worker) |

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m "Add my feature"`
4. Push and open a Pull Request

---

*Built with ❤️ — SentiGuard v1.0*
