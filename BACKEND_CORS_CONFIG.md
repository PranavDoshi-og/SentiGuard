# Backend CORS Configuration for Mobile Support

Add this to your `backend/main.py` to enable cross-origin requests from your frontend:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Configure CORS for mobile and web frontends
allowed_origins = [
    "http://localhost:8000",           # Local development
    "http://localhost:3000",            # Alternative local port
    "http://127.0.0.1:8000",
    "http://127.0.0.1:3000",
    "https://yourdomain.com",           # Your deployed domain
    "https://api.yourdomain.com",       # API subdomain (if used)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,      # Specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# ... rest of your app configuration
```

## Mobile Testing without CORS Issues

### Option 1: Disable CORS for Development (NOT for Production!)
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins during development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Option 2: Use Same-Origin (Recommended)
If both frontend and backend are on the same domain:
- Frontend: `https://app.example.com`
- Backend: `https://api.example.com`
- Or subfolder: `https://example.com/api`

Update `website/js/app.js`:
```javascript
// Use relative URL for same-origin requests
const API_BASE = "/api";  // Relative path
// or
const API_BASE = "https://api.yourdomain.com/api";  // Full URL with CORS
```

### Option 3: Use a Proxy
Configure your web server (nginx, Apache) to proxy `/api/*` requests:

**Nginx example:**
```nginx
location /api/ {
    proxy_pass http://backend:8000/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

## Testing with Local IP

To test on mobile from the same network:

1. Find backend IP:
   ```bash
   # Mac/Linux
   ipconfig getifaddr en0
   
   # Windows
   ipconfig
   ```
   
2. Update `website/js/app.js`:
   ```javascript
   const API_BASE = "http://192.168.1.100:8000/api";  // Your IP
   ```

3. Access from phone:
   ```
   http://192.168.1.100:8000
   ```

Note: Camera won't work over HTTP from phone (HTTPS or IP required)

## Production CORS Headers

When deployed to production, the Service Worker expects proper CORS headers from the API:

```
Access-Control-Allow-Origin: https://yourdomain.com
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
Access-Control-Max-Age: 3600
```

This is important for:
- QR scan results caching
- URL scan result fallbacks
- Service Worker fetch operations
