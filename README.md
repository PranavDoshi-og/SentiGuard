# 🛡️ SentiGuard — AI-Powered Phishing Detection

> Detect phishing URLs and QR codes in real time using Machine Learning.
> Includes a FastAPI backend, mobile QR camera scanning, and a PWA-enabled frontend.

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

**Option A — Backend-hosted site (recommended)**
1. Run the backend: `uvicorn main:app --reload --host 0.0.0.0 --port 8000`
2. Open `http://localhost:8000`

This is the preferred flow for mobile QR scanning because the site and API share the same origin.

**Option B — VS Code Live Server**
1. Install the **Live Server** extension in VS Code
2. Right-click `website/index.html` → **"Open with Live Server"**
3. Opens at `http://localhost:5500`

> For mobile camera scanning, use `http://localhost:8000` or HTTPS via ngrok.

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

## ✅ What Changed in This Version

- Mobile QR camera scanner now works on phones
- Backend serves the website statically and exposes `/api`
- Frontend now uses `API_BASE = "/api"` for same-origin requests
- Service worker cache version was bumped, and scripts are cache-busted using `?v=3`
- Secure mobile access is now supported through HTTPS ngrok tunnels
- QR scanner logic now handles mobile video ready-state and displays camera status

---

## 📱 Mobile Phone Access

### Secure HTTPS with ngrok
Mobile camera scanning requires a secure context.
Use ngrok to expose `localhost:8000` over HTTPS.

```bash
# Authenticate ngrok once
./ngrok.exe config add-authtoken YOUR_TOKEN

# Start the tunnel for the backend + website
./ngrok.exe http 8000
```

Open the generated HTTPS URL on your phone.
The website and API share the same origin, so the app can camera-scan QR codes correctly.

### Local LAN access (testing only)
If you prefer local network access:
1. Run backend on `0.0.0.0:8000`
2. Open `http://<laptop-ip>:8000` on the phone

This is okay for testing, but HTTPS is recommended for camera scanning.

---

## 📲 QR Camera Scanner

The phone QR scanner now includes:
- camera start / stop controls
- live scan status messages
- overlay framing for QR alignment
- fallback upload mode

### Use the scanner
1. Open **QR Scanner**
2. Tap **Start Scanner**
3. Point the camera at the QR code
4. If detected, the QR data or URL is processed instantly

If the QR value is a URL, it will be scanned using the phishing API.
If it is raw text, the app shows the content directly.

---

## ⚡ Service Worker / Cache Refresh

The PWA service worker now:
- caches the site and static assets
- serves static files from the backend-hosted site
- updates to the new version automatically when a new SW is installed

If the phone still shows an old UI, refresh fully or clear browser site data.

---

## 🔌 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Check API status |
| POST | `/api/scan/url` | Scan a URL for phishing |
| POST | `/api/scan/qr` | Upload QR image and scan extracted URL |

### POST `/api/scan/url`

**Request:**
```json
{ "url": "https://example.com/login" }
```

**Response:**
```json
{
  "url": "https://example.com/login",
  "verdict": "SAFE",
  "trust_score": 84.3,
  "risk_factors": [],
  "features": {
    "has_https": true,
    "url_length": 32,
    "num_dots": 2
  }
}
```

### POST `/api/scan/qr`

Send a `multipart/form-data` request with `file` set to the QR image.

---

## 🧠 ML Features

The model extracts URL signals such as:
- `has_https`, `has_http`
- `num_dots`, `subdomain_count`, `has_ip_address`
- `path_depth`, `num_params`, `query_length`
- `has_at_symbol`, `num_hyphens`, `has_hex_encoding`
- `has_login_keyword`, `has_bank_keyword`

---

## 💻 Development Notes

- Run backend with `uvicorn --reload` for hot reloading
- API docs are available at `http://localhost:8000/docs`
- Frontend uses same-origin API calls to `/api`

---

## 📦 Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | FastAPI, Uvicorn, Pydantic |
| ML | scikit-learn, NumPy, Pandas |
| QR | jsQR (frontend), pyzbar/Pillow (backend) |
| Frontend | HTML, CSS, JavaScript |
| PWA | Service Worker, cache versioning |

---

## 🤝 Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feature/your-improvement`
3. Commit: `git commit -m "Add feature"`
4. Push and open a PR

---

*Built with ❤️ — SentiGuard v1.0*
