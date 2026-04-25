# 📱 Quick Start: Mobile QR Scanning

Get SentiGuard running on mobile **in 2 minutes**.

## Step 1: Start Backend

```bash
cd backend
pip install -r requirements.txt
python main.py
```

✅ Backend running at `http://localhost:8000/api`

## Step 2: Start Website

In a new terminal:

```bash
cd website
python -m http.server 8000
```

✅ Website running at `http://localhost:8000`

## Step 3: Open on Mobile

### Same Network (Recommended)

1. Find your computer's IP:
   ```bash
   # macOS/Linux
   ifconfig | grep "inet "
   
   # Windows  
   ipconfig
   ```

2. On your phone, open:
   ```
   http://192.168.X.X:8000
   ```
   *(Replace X.X with your actual IP)*

3. Go to **QR Scanner** tab
4. Tap **"Start Scanner"**
5. Grant camera permission
6. Point at QR code → Auto-scan!

### Local Testing

Open `http://localhost:8000` on your desktop (not mobile).

---

## 🎥 Camera QR Scanning Features

✅ **Real-time scanning** - No manual shutter needed  
✅ **Auto detection** - Instant QR code recognition  
✅ **File fallback** - Upload QR images if camera unavailable  
✅ **Mobile optimized** - Touch-friendly large buttons  
✅ **Offline cache** - Results saved locally  

---

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| Camera won't start | Check permissions in phone settings |
| QR not detecting | Ensure good lighting, hold steady |
| Backend connection error | Verify `http://localhost:8000/docs` loads |
| Appears blurry | Clean camera lens, adjust distance |
| "Network error" | Phone must be on same WiFi as computer |

---

## 📦 What You Get

- ✨ **Fast camera scanning** - No manual uploads
- 🎯 **ML-powered detection** - Phishing URL analysis
- 📊 **Detailed results** - Trust score, risk factors, features
- 🔒 **Secure** - Runs locally, no data stored
- 📱 **PWA compatible** - Install on home screen (Android)

---

## 🚀 Next Steps

1. **Customize:** Edit backend URL in `website/js/app.js` if deploying
2. **Deploy:** Use `netlify.toml` or `vercel.json` for cloud deployment
3. **Improve:** Add more QR test cases, refine ML model

See `MOBILE_SETUP.md` for detailed configuration and deployment options.
