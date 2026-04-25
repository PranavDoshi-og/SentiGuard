# 📋 Deployment Checklist

Complete this checklist before deploying SentiGuard to production.

---

## ✅ Pre-Deployment Testing (Local)

### Backend API
- [ ] Backend runs without errors: `python main.py`
- [ ] API docs accessible: `http://localhost:8000/docs`
- [ ] URL scan endpoint works: POST `/api/scan/url`
- [ ] QR scan endpoint works: POST `/api/scan/qr`
- [ ] Health check works: GET `/api/health`
- [ ] No console errors or warnings
- [ ] Model loads correctly (`phishing_model.pkl`)

### Frontend Website
- [ ] Website loads: `python -m http.server 8000`
- [ ] Desktop layout responsive (resize browser)
- [ ] Mobile layout works on DevTools (F12 → Toggle device toolbar)
- [ ] Dark theme applies correctly
- [ ] All tabs switch properly (URL, QR)
- [ ] URL input accepts text
- [ ] QR upload works (drag & drop + file button)

### Mobile Testing (on same WiFi)
- [ ] Access from mobile: `http://192.168.X.X:8000`
- [ ] Layout is responsive (not squeezed)
- [ ] QR Scanner tab loads
- [ ] Camera scanner UI appears
- [ ] "Start Scanner" button works
- [ ] Camera permission dialog appears
- [ ] Camera feed displays live
- [ ] "Point camera at QR code" message visible
- [ ] Point at test QR → Auto-detects
- [ ] Results display correctly
- [ ] API status indicator shows online/offline
- [ ] File upload fallback works
- [ ] URL tab works on mobile

### PWA Features
- [ ] Service Worker registers (DevTools → Application → Service Workers)
- [ ] manifest.json loads (DevTools → Application → Manifest)
- [ ] Install banner appears (or option to install in menu)
- [ ] Offline mode works (DevTools → Application → Service Workers → Offline)
- [ ] Cached responses load offline
- [ ] App shortcuts appear when installed

---

## 🔧 Pre-Deployment Configuration

### Icons & Assets
- [ ] Create/place icons in `website/assets/`:
  - [ ] `icon48.png` (48×48)
  - [ ] `icon96.png` (96×96)
  - [ ] `icon192.png` (192×192) - Home screen icon
  - [ ] `icon512.png` (512×512) - Splash screen
  - [ ] `icon192-maskable.png` (optional - for adaptive icons)
  - [ ] `icon512-maskable.png` (optional - for adaptive icons)

### Update API URLs
- [ ] Check `website/js/app.js` → `const API_BASE`
- [ ] If backend will be separate, prepare URL
- [ ] Update manifest shortcuts URLs if needed

### Backend Configuration
- [ ] Update CORS in `backend/main.py`:
  ```python
  allowed_origins = [
      "https://yourdomain.com",
      "https://yourdomain.com:443",
  ]
  ```
- [ ] Add error logging for production
- [ ] Enable request logging if needed
- [ ] Set production debug mode to `False`
- [ ] Review environment variables (`.env`)

### Frontend Configuration
- [ ] Review cache strategy in `website/sw.js`
- [ ] Update `CACHE_NAME` version if needed
- [ ] Check manifest.json themeColor, backgroundColor
- [ ] Verify all relative paths work correctly

---

## 🌐 Choose Deployment Platform

### Option 1: Frontend on Netlify
- [ ] Create Netlify account: `netlify.com`
- [ ] Install Netlify CLI: `npm install -g netlify-cli`
- [ ] Login: `netlify login`
- [ ] Deploy: `netlify deploy --prod --dir website`
- [ ] Configure custom domain (optional)
- [ ] Enable HTTPS (automatic)
- [ ] Test deployment: Open URL on mobile

### Option 2: Frontend on Vercel
- [ ] Create Vercel account: `vercel.com`
- [ ] Install Vercel CLI: `npm install -g vercel`
- [ ] Deploy: `vercel --prod --dir website`
- [ ] Configure domain
- [ ] Test HTTPS and PWA

### Option 3: Frontend on GitHub Pages
- [ ] Create GitHub repo
- [ ] Push website folder
- [ ] Settings → Pages → Deploy from main/website branch
- [ ] GitHub Pages URL generated automatically
- [ ] Test on mobile

### Option 4: Self-Hosted VPS
- [ ] Rent VPS (DigitalOcean, Linode, AWS, etc.)
- [ ] SSH into server
- [ ] Install web server (nginx recommended)
- [ ] Copy website files
- [ ] Configure SSL certificate (Let's Encrypt)
- [ ] Point domain to server IP

---

## 🚀 Backend Deployment

### Option 1: Heroku (Easiest)
- [ ] Create Heroku account: `heroku.com`
- [ ] Install Heroku CLI
- [ ] Create Procfile in backend:
  ```
  web: gunicorn main:app
  ```
- [ ] Deploy: `git push heroku main`
- [ ] Test API: `https://your-app.herokuapp.com/docs`
- [ ] Update frontend API URL

### Option 2: Railway
- [ ] Create Railway account: `railway.app`
- [ ] Connect GitHub repo
- [ ] Select backend folder
- [ ] Deploy automatically
- [ ] Get deployed URL
- [ ] Update frontend API URL

### Option 3: Self-Hosted (VPS/Docker)
- [ ] Connect to VPS server
- [ ] Install Python and dependencies
- [ ] Setup systemd service for auto-start
- [ ] Configure nginx as reverse proxy
- [ ] Setup SSL certificate
- [ ] Test API endpoint

### Verify Backend Deployment
- [ ] API accessible from frontend domain
- [ ] CORS headers present in responses
- [ ] API docs available at `/docs`
- [ ] Health check responds 200
- [ ] Scan endpoints working
- [ ] Logging configured

---

## 🔒 Security Checklist

### HTTPS & Certificates
- [ ] Frontend served over HTTPS
- [ ] Backend served over HTTPS
- [ ] SSL certificate valid (not self-signed)
- [ ] Certificate auto-renewal configured
- [ ] Force HTTPS (redirect HTTP → HTTPS)

### Environment Variables
- [ ] No API keys in code
- [ ] No secrets committed to git
- [ ] `.env` file in `.gitignore`
- [ ] Environment variables set on server
- [ ] Database credentials protected

### CORS Security
- [ ] Allow specific origins only (not `*`)
- [ ] Set appropriate max-age
- [ ] Limit allowed methods
- [ ] Review exposed headers

### Headers Security
- [ ] X-Content-Type-Options: nosniff
- [ ] X-Frame-Options: DENY
- [ ] X-XSS-Protection enabled
- [ ] Referrer-Policy set correctly

---

## 📊 Performance Checklist

### Frontend Optimization
- [ ] Images optimized (compressed)
- [ ] CSS minified (production build)
- [ ] JavaScript minified
- [ ] Lazy loading enabled (if applicable)
- [ ] Cache headers set correctly
- [ ] Gzip compression enabled
- [ ] Service Worker caching working
- [ ] Load time < 3 seconds on 4G

### Backend Optimization
- [ ] Database queries optimized
- [ ] Connection pooling configured
- [ ] Request timeouts set
- [ ] Error handling graceful
- [ ] Logging not excessive
- [ ] Response times < 500ms typical

---

## 📱 Mobile & PWA Validation

### PWA Checklist
- [ ] Manifest.json valid (DevTools Lighthouse)
- [ ] Icons display correctly
- [ ] Install prompt appears
- [ ] App installable on Android
- [ ] App installable on iOS
- [ ] Offline page works
- [ ] Service Worker status: activated

### Mobile Compatibility
- [ ] Responsive on 375px width (iPhone)
- [ ] Responsive on 1024px width (iPad)
- [ ] Touch targets >= 44px
- [ ] Camera API works on mobile
- [ ] Orientation changes handled
- [ ] Landscape mode works

### Browser Compatibility
- [ ] Chrome 60+ ✓
- [ ] Firefox 55+ ✓
- [ ] Safari 11.1+ ✓
- [ ] Edge 79+ ✓
- [ ] Mobile Chrome ✓
- [ ] Mobile Safari ✓

---

## 📊 Monitoring & Analytics (Optional)

- [ ] Error tracking setup (Sentry, etc.)
- [ ] Analytics configured
- [ ] Uptime monitoring enabled
- [ ] Performance monitoring setup
- [ ] Logs centralized
- [ ] Alerts configured for errors

---

## 🧪 Final Testing Before Launch

### Complete End-to-End Test
- [ ] Deploy all services
- [ ] Open app on desktop
- [ ] Open app on mobile (same WiFi)
- [ ] Test URL scanning (URL tab)
- [ ] Test QR scanning (camera)
- [ ] Test QR upload (fallback)
- [ ] Test offline mode
- [ ] Check all results load
- [ ] Verify no console errors
- [ ] Test on different mobile phone
- [ ] Test on tablet
- [ ] Test API error handling

### User Acceptance Testing
- [ ] Non-technical user can upload QR
- [ ] Non-technical user can scan with camera
- [ ] Results are clear and understandable
- [ ] UI is responsive and fast
- [ ] No crashes or hangs
- [ ] Clear error messages for failures

---

## 🎯 Launch! 🚀

- [ ] All tests passing
- [ ] Monitoring/alerts configured
- [ ] Team notified of launch
- [ ] Documentation updated
- [ ] Social media post ready
- [ ] Support contact info visible
- [ ] Gather user feedback

---

## 📈 Post-Launch Monitoring (First Week)

- [ ] Check error logs daily
- [ ] Monitor API response times
- [ ] Track user feedback
- [ ] Monitor uptime
- [ ] Check mobile compatibility reports
- [ ] Review performance metrics
- [ ] Fix critical bugs immediately
- [ ] Plan improvements for next sprint

---

## 📝 Rollback Plan

If major issues discovered:
- [ ] Have previous version ready
- [ ] Database backup procedure documented
- [ ] Branching strategy clear
- [ ] Quick rollback process documented
- [ ] Communication plan if needed

---

## ✨ Success Criteria

Your mobile deployment is ready when:
- ✅ All tests pass
- ✅ Zero console errors
- ✅ HTTPS on both frontend and backend
- ✅ CORS configured
- ✅ PWA working (installable)
- ✅ Camera QR scanning working on real phone
- ✅ Offline mode partially functional
- ✅ < 3 second load time on 4G
- ✅ Responsive on all tested devices
- ✅ Security checklist completed

---

**When you're ready:** Run the deployment! 🎉

For help, refer to:
- `MOBILE_SETUP.md` - Detailed reference
- `BACKEND_CORS_CONFIG.md` - Backend specifics
- Deployment platform docs (Netlify, Vercel, etc.)

---

*Last Updated: April 2026*
