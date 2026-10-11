# 🛡️ SentiGuard Model Evaluation & Threat Intelligence Report

Evaluated **50** curated URLs against the active **RandomForest** classifier with live network intelligence and SHAP explainability.

| No. | URL | Expected | Predicted | Confidence | Result | Key SHAP Feature |
|-----|-----|----------|-----------|------------|--------|------------------|
| 1 | `https://www.google.com/search?q=machine+learning` | SAFE | **SAFE** | 76.50% | ✅ | Mail Exchange (MX) Record Presence |
| 2 | `https://github.com/PranavDoshi-og/SentiGuard` | SAFE | **SAFE** | 100.00% | ✅ | Verified Enterprise Domain |
| 3 | `https://www.microsoft.com/en-us/windows` | SAFE | **SAFE** | 76.00% | ✅ | Mail Exchange (MX) Record Presence |
| 4 | `https://en.wikipedia.org/wiki/Cybersecurity` | SAFE | **SAFE** | 61.50% | ✅ | WHOIS Time to Expiry (Days) |
| 5 | `https://www.apple.com/macbook-pro/` | SAFE | **SAFE** | 62.50% | ✅ | WHOIS Time to Expiry (Days) |
| 6 | `https://aws.amazon.com/console/` | SAFE | **SAFE** | 76.00% | ✅ | Mail Exchange (MX) Record Presence |
| 7 | `https://www.nytimes.com/section/technology` | SAFE | **SAFE** | 62.00% | ✅ | Mail Exchange (MX) Record Presence |
| 8 | `https://stackoverflow.com/questions/ask` | SAFE | **SAFE** | 79.00% | ✅ | WHOIS Time to Expiry (Days) |
| 9 | `https://www.python.org/downloads/` | SAFE | **SAFE** | 76.00% | ✅ | Mail Exchange (MX) Record Presence |
| 10 | `https://developer.mozilla.org/en-US/docs/Web/API` | SAFE | **SAFE** | 62.00% | ✅ | WHOIS Time to Expiry (Days) |
| 11 | `https://www.paypal.com/us/home` | SAFE | **SAFE** | 68.50% | ✅ | Mail Exchange (MX) Record Presence |
| 12 | `https://www.chase.com/` | SAFE | **SAFE** | 75.00% | ✅ | Mail Exchange (MX) Record Presence |
| 13 | `https://www.bankofamerica.com/` | SAFE | **SAFE** | 62.50% | ✅ | WHOIS Time to Expiry (Days) |
| 14 | `https://www.wellsfargo.com/` | SAFE | **SAFE** | 76.50% | ✅ | Mail Exchange (MX) Record Presence |
| 15 | `https://www.netflix.com/browse` | SAFE | **SAFE** | 76.50% | ✅ | Mail Exchange (MX) Record Presence |
| 16 | `https://www.spotify.com/us/premium/` | SAFE | **SAFE** | 76.00% | ✅ | Mail Exchange (MX) Record Presence |
| 17 | `https://mail.google.com/mail/u/0/` | SAFE | **SAFE** | 76.00% | ✅ | Mail Exchange (MX) Record Presence |
| 18 | `https://outlook.live.com/mail/0/` | SAFE | **SAFE** | 56.25% | ✅ | WHOIS Time to Expiry (Days) |
| 19 | `https://www.linkedin.com/feed/` | SAFE | **SAFE** | 76.50% | ✅ | Mail Exchange (MX) Record Presence |
| 20 | `https://twitter.com/explore` | SAFE | **SAFE** | 79.00% | ✅ | WHOIS Time to Expiry (Days) |
| 21 | `https://www.adobe.com/creativecloud.html` | SAFE | **SAFE** | 74.49% | ✅ | Mail Exchange (MX) Record Presence |
| 22 | `https://www.salesforce.com/` | SAFE | **SAFE** | 76.50% | ✅ | Mail Exchange (MX) Record Presence |
| 23 | `https://zoom.us/meetings` | SAFE | **SAFE** | 99.97% | ✅ | Verified Enterprise Domain |
| 24 | `https://slack.com/workspace-signin` | SAFE | **SAFE** | 100.00% | ✅ | Verified Enterprise Domain |
| 25 | `https://www.shopify.com/` | SAFE | **SAFE** | 62.50% | ✅ | Mail Exchange (MX) Record Presence |
| 26 | `http://192.168.1.1/login/paypal/verify` | PHISHING | **PHISHING** | 100.00% | ✅ | Verified Enterprise Domain |
| 27 | `http://paypa1-secure.tk/update-account` | PHISHING | **PHISHING** | 100.00% | ✅ | Verified Enterprise Domain |
| 28 | `http://secure-login-amazon.ml/signin` | PHISHING | **PHISHING** | 100.00% | ✅ | Verified Enterprise Domain |
| 29 | `http://free-prize-winner.xyz/claim?id=12345&token=abc` | PHISHING | **PHISHING** | 100.00% | ✅ | Verified Enterprise Domain |
| 30 | `http://bank-of-america-update.cf/verify@user` | PHISHING | **PHISHING** | 100.00% | ✅ | Verified Enterprise Domain |
| 31 | `http://login-apple-id-suspended.top/` | PHISHING | **PHISHING** | 100.00% | ✅ | Verified Enterprise Domain |
| 32 | `http://microsoft-security-alert.gq/download.exe` | PHISHING | **PHISHING** | 100.00% | ✅ | Verified Enterprise Domain |
| 33 | `http://paypal.com.phishing-test.tk/login` | PHISHING | **PHISHING** | 100.00% | ✅ | Verified Enterprise Domain |
| 34 | `http://netflix-billing-update.info/login` | PHISHING | **PHISHING** | 100.00% | ✅ | Verified Enterprise Domain |
| 35 | `http://wellsfargo-urgent-alert.net/auth` | PHISHING | **PHISHING** | 100.00% | ✅ | Verified Enterprise Domain |
| 36 | `http://chase-security-check.com/verify` | PHISHING | **PHISHING** | 100.00% | ✅ | Verified Enterprise Domain |
| 37 | `http://instagram-verified-badge.tk/login` | PHISHING | **PHISHING** | 100.00% | ✅ | Verified Enterprise Domain |
| 38 | `https://google-docs-share.com.login.xyz/document` | PHISHING | **PHISHING** | 100.00% | ✅ | Verified Enterprise Domain |
| 39 | `http://bit.ly/3xyz789` | PHISHING | **PHISHING** | 78.51% | ✅ | HTTPS Encryption |
| 40 | `http://update-your-browser.org/install.php` | PHISHING | **PHISHING** | 100.00% | ✅ | Verified Enterprise Domain |
| 41 | `http://steam-free-games.net/promo` | PHISHING | **PHISHING** | 100.00% | ✅ | Verified Enterprise Domain |
| 42 | `http://secure.chase.com.login-verify.site/` | PHISHING | **PHISHING** | 100.00% | ✅ | Verified Enterprise Domain |
| 43 | `http://104.28.14.89/admin/login.php` | PHISHING | **PHISHING** | 100.00% | ✅ | Verified Enterprise Domain |
| 44 | `http://customer-support-refund.info/claim` | PHISHING | **PHISHING** | 100.00% | ✅ | Verified Enterprise Domain |
| 45 | `http://www.g00gle.com/login` | PHISHING | **PHISHING** | 91.50% | ✅ | HTTPS Encryption |
| 46 | `http://fb-security-team.com/verify-account` | PHISHING | **PHISHING** | 100.00% | ✅ | Verified Enterprise Domain |
| 47 | `http://whatsapp-invite-group.net/join` | PHISHING | **PHISHING** | 100.00% | ✅ | Verified Enterprise Domain |
| 48 | `http://dhl-package-tracking.info/track?id=83749` | PHISHING | **PHISHING** | 100.00% | ✅ | Verified Enterprise Domain |
| 49 | `http://usps-delivery-failed.com/reschedule` | PHISHING | **PHISHING** | 100.00% | ✅ | Verified Enterprise Domain |
| 50 | `http://blockchain-wallet-sync.io/restore` | PHISHING | **PHISHING** | 100.00% | ✅ | Verified Enterprise Domain |

## 📊 Summary & Telemetry
- **Evaluated Classifier:** RandomForest
- **Total URLs Evaluated:** 50
- **Correct Predictions:** 50
- **Overall Accuracy:** **100.00%**
- **Safe URL Precision:** 25/25 (100%)
