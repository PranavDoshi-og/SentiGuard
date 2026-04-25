# 📱 SentiGuard Mobile Implementation Guide

This guide explains the mobile optimization changes made to SentiGuard for seamless phones and tablets experience, with a focus on real-time QR code scanning.

---

## 🎯 What's New

### 1. **Progressive Web App (PWA) Support**
- Added `manifest.json` - enables installation on home screen
- Added Service Worker (`sw.js`) - offline support and caching
- Users can "install" the app like native apps on Android/iOS

### 2. **Real-Time Camera QR Scanning**
- New `qr-scanner.js` module with live camera support
- Uses [jsQR](https://github.com/cozmo/jsQR) for QR decoding
- Automatically detects camera availability
- Falls back to file upload on unsupported devices

### 3. **Responsive Mobile UI**
- Touch-optimized buttons (44x44px minimum)
- Adaptive layouts for all screen sizes
- Landscape mode support
- PWA standalone display mode

---

## 🚀 Getting Started

### Prerequisites

```bash
# Ensure your backend is running
cd backend
pip install -r requirements.txt
python main.py
# Backend should be at http://localhost:8000
```

### Deployment

1. **Local Testing:**
   ```bash
   # Serve the website on localhost
   python -m http.server 8000 --directory website
   # Or use any static server
   ```

2. **Mobile Testing (Same Network):**
   - Find your computer's IP: `ipconfig getifaddr en0` (Mac) or `ipconfig` (Windows)
   - Open `http://YOUR_IP:8000` on your phone
   - The app is responsive and fully functional

3. **PWA Installation:**
   - **Android:** Tap menu (⋮) → "Install app"
   - **iOS:** Tap Share (↗) → "Add to Home Screen"
   - **Desktop:** Depending on browser support

---

## 📁 New Files Added

### `manifest.json`
PWA configuration that allows installation:
- App name, icons, and splash screens
- Start URL and display mode (standalone)
- Shortcuts for quick access
- Colors and theming

**To customize:**
- Update icons in `assets/` folder (48x48, 96x96, 192x192, 512x512)
- Create maskable icons for adaptive display
- Update theme colors

### `sw.js` (Service Worker)
Handles:
- **Network-first for API calls:** Try live, fallback to cache if offline
- **Cache-first for assets:** Use cached versions, keep fresh
- **Offline support:** Shows error if API unavailable offline
- **Cache cleanup:** Removes old cache versions on update

**To update:**
- Edit `CACHE_NAME` version when making changes
- Modify cache strategy in fetch handlers

### `js/qr-scanner.js`
Mobile QR camera scanner:
- Detects camera availability
- Manages camera permission requests
- Real-time frame scanning using jsQR
- Automatic QR detection and instant processing
- Can toggle between camera and file upload

**How it works:**
1. Checks for camera support
2. Creates camera UI with scanning overlay
3. Requests camera permission (once, user controls)
4. Scans frames at ~30fps
5. Detects QR codes instantly
6. Extracts URL and scans it
7. Displays results

---

## 🔧 Configuration

### Changing Backend API URL

Edit `website/js/app.js`:
```javascript
const API_BASE = "http://localhost:8000/api";
// Change to your deployed backend URL
```

### Customizing PWA Icons

1. Create icons in `website/assets/`:
   - `icon48.png` (48×48)
   - `icon96.png` (96×96)
   - `icon192.png` (192×192) - Home screen icon
   - `icon512.png` (512×512) - Splash screen

2. Optional: Create maskable variants for adaptive icons:
   - `icon192-maskable.png`
   - `icon512-maskable.png`

### Theme Customization

The app uses CSS variables defined in `style.css`:
```css
:root {
  --accent-blue: #58a6ff;
  --safe-text: #56d364;
  --phish-text: #ff7b72;
  /* ... change these as needed */
}
```

---

## 📱 Mobile Features

### Real-Time QR Camera Scanner
```
[Start Scanner] → Camera opens → Point at QR → Auto-detect 
→ URL extracted → API scan → Results displayed
```

**Features:**
- Auto-start scanning after permission
- Visual overlay with animated scan frame
- "Point camera at QR code" hint
- Instant detection (no manual snap needed)
- Toggle between camera and file upload
- Smooth animations and transitions

### URL Input on Mobile
- Touch-friendly large input field
- Keyboard-optimized for URLs
- Quick test buttons for common phishing URLs
- Clear error messages

### Responsive Design
- **Mobile (< 480px):** Stacked layout, full-width inputs
- **Tablet (480-768px):** Compact but readable layout
- **Desktop (> 768px):** Optimal multi-column layout
- **Landscape:** Adjusts height and hides less critical UI

---

## 🌐 Offline Support

The Service Worker enables offline functionality:

### What Works Offline
- ✅ View cached URLs and results from previous scans
- ✅ Load UI and navigation
- ✅ Access previously cached scan results

### What Requires Connection
- ❌ New URL scans (needs backend API)
- ❌ New QR scans (needs backend API)
- ❌ Camera access (requires browser)

### Testing Offline
1. Open DevTools (F12)
2. Go to Application → Service Workers
3. Check "Offline" to simulate offline mode
4. Try using the app

---

## 🎯 Browser Compatibility

### Full Support
- Chrome/Edge 60+
- Firefox 55+
- Safari 11.1+ (iOS 11.3+)
- Samsung Internet 8+

### Partial Support
- Camera API: Most modern browsers
- Service Worker: Most modern browsers
- Standalone PWA: Android (Chrome), iOS (Safari)

### Not Supported
- Internet Explorer (all versions)
- Very old Android devices (< 5.1)

---

## 🔐 Security Considerations

1. **Camera Permissions:**
   - User must grant permission
   - Permission only granted for this app
   - Can be revoked anytime in settings

2. **CORS Configuration:**
   - Backend should accept requests from your domain
   - Update backend CORS in `main.py` if needed:
   ```python
   origins = [
       "http://localhost:8000",
       "https://yourdomain.com",
   ]
   app.add_middleware(CORSMiddleware, allow_origins=origins)
   ```

3. **HTTPS for PWA:**
   - Production PWA requires HTTPS
   - Service Worker won't register over HTTP (except localhost)

---

## 📊 File Structure

```
website/
├── index.html              ← Updated with PWA meta tags
├── manifest.json           ← PWA configuration (NEW)
├── sw.js                   ← Service Worker (NEW)
├── css/
│   └── style.css          ← Added mobile & PWA styles
├── js/
│   ├── app.js             ← Core app logic
│   └── qr-scanner.js      ← Camera QR scanner (NEW)
└── assets/                ← Icons and images
    ├── icon48.png
    ├── icon96.png
    ├── icon192.png
    └── icon512.png
```

---

## 🚀 Deployment Guide

### Option 1: Netlify (Recommended)
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --dir website

# Publish
netlify deploy --prod --dir website
```

### Option 2: Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --dir website

# Production
vercel --prod --dir website
```

### Option 3: GitHub Pages
```bash
# Push the website folder to GitHub
# Go to Settings → GitHub Pages → Deploy from main/website

# Your app will be at: https://username.github.io/SentiGuard
```

### Option 4: Self-Hosted Server
```bash
# Copy website files to your server
scp -r website/* user@server.com:/var/www/sentiguard/

# Serve with nginx or Apache
# Ensure HTTPS is configured
```

---

## 🔧 Troubleshooting

### Camera Not Starting
1. Check browser permissions for camera
2. Ensure HTTPS is used (HTTP won't work except localhost)
3. Try different browser
4. Fallback: Use file upload instead

### Service Worker Not Registering
1. Check Console (F12 → Console)
2. Ensure running over HTTPS or localhost
3. Clear browser cache
4. Disable browser extensions

### QR Code Not Detecting
1. Ensure good lighting
2. Keep QR code in center of frame
3. Hold phone steady
4. Try file upload as alternative

### App Not Installing
1. Ensure HTTPS is enabled
2. Check manifest.json is valid
3. Ensure icons exist in assets folder
4. Try incognito/private window

### Backend Connection Error
1. Verify backend is running: `http://localhost:8000/docs`
2. Check API_BASE URL in `app.js`
3. Ensure CORS is enabled in backend
4. Check browser console for errors

---

## 📈 Performance Tips

1. **Image Optimization:**
   - Compress icons with TinyPNG
   - Use WebP format where possible
   - Serve appropriate sizes for devices

2. **Caching:**
   - Service Worker automatically handles caching
   - Use cache-busting by updating `CACHE_NAME`

3. **Network:**
   - Enable compression on server (gzip)
   - Use CDN for static files
   - Minimize API requests

4. **Device:**
   - Test on actual devices
   - Use throttling in DevTools to simulate slow networks
   - Monitor battery usage

---

## 🤝 Contributing

To improve mobile support:
1. Test on different devices
2. Report issues with device/browser info
3. Submit PRs for bug fixes or features

---

## 📞 Support

For issues or questions:
- Check troubleshooting section above
- Open an issue on GitHub
- Review browser console errors (F12)
- Test in different browser

---

**Last Updated:** April 2026  
**Mobile-Ready:** ✅ iOS, Android, Desktop  
**PWA Status:** ✅ Installable, Offline-capable
