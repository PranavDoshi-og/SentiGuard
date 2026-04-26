# 🛡️ SentiGuard Model Evaluation Report

Evaluated **50** curated URLs against the Random Forest classifier.

| No. | URL | Expected | Predicted | Confidence | Result |
|-----|-----|----------|-----------|------------|--------|
| 1 | `https://www.google.com/search?q=machine+learning` | SAFE | **SAFE** | 99.00% | ✅ |
| 2 | `https://github.com/PranavDoshi-og/SentiGuard` | SAFE | **SAFE** | 98.50% | ✅ |
| 3 | `https://www.microsoft.com/en-us/windows` | SAFE | **SAFE** | 98.50% | ✅ |
| 4 | `https://en.wikipedia.org/wiki/Cybersecurity` | SAFE | **SAFE** | 100.00% | ✅ |
| 5 | `https://www.apple.com/macbook-pro/` | SAFE | **SAFE** | 100.00% | ✅ |
| 6 | `https://aws.amazon.com/console/` | SAFE | **SAFE** | 100.00% | ✅ |
| 7 | `https://www.nytimes.com/section/technology` | SAFE | **SAFE** | 100.00% | ✅ |
| 8 | `https://stackoverflow.com/questions/ask` | SAFE | **SAFE** | 98.00% | ✅ |
| 9 | `https://www.python.org/downloads/` | SAFE | **SAFE** | 100.00% | ✅ |
| 10 | `https://developer.mozilla.org/en-US/docs/Web/API` | SAFE | **SAFE** | 81.00% | ✅ |
| 11 | `https://www.paypal.com/us/home` | SAFE | **SAFE** | 95.50% | ✅ |
| 12 | `https://www.chase.com/` | SAFE | **SAFE** | 100.00% | ✅ |
| 13 | `https://www.bankofamerica.com/` | SAFE | **SAFE** | 82.50% | ✅ |
| 14 | `https://www.wellsfargo.com/` | SAFE | **SAFE** | 100.00% | ✅ |
| 15 | `https://www.netflix.com/browse` | SAFE | **SAFE** | 100.00% | ✅ |
| 16 | `https://www.spotify.com/us/premium/` | SAFE | **SAFE** | 100.00% | ✅ |
| 17 | `https://mail.google.com/mail/u/0/` | SAFE | **SAFE** | 100.00% | ✅ |
| 18 | `https://outlook.live.com/mail/0/` | SAFE | **SAFE** | 100.00% | ✅ |
| 19 | `https://www.linkedin.com/feed/` | SAFE | **SAFE** | 100.00% | ✅ |
| 20 | `https://twitter.com/explore` | SAFE | **SAFE** | 100.00% | ✅ |
| 21 | `https://www.adobe.com/creativecloud.html` | SAFE | **SAFE** | 94.50% | ✅ |
| 22 | `https://www.salesforce.com/` | SAFE | **SAFE** | 100.00% | ✅ |
| 23 | `https://zoom.us/meetings` | SAFE | **SAFE** | 99.00% | ✅ |
| 24 | `https://slack.com/workspace-signin` | SAFE | **SAFE** | 74.00% | ✅ |
| 25 | `https://www.shopify.com/` | SAFE | **SAFE** | 100.00% | ✅ |
| 26 | `http://192.168.1.1/login/paypal/verify` | PHISHING | **PHISHING** | 100.00% | ✅ |
| 27 | `http://paypa1-secure.tk/update-account` | PHISHING | **PHISHING** | 100.00% | ✅ |
| 28 | `http://secure-login-amazon.ml/signin` | PHISHING | **PHISHING** | 100.00% | ✅ |
| 29 | `http://free-prize-winner.xyz/claim?id=12345&token=abc` | PHISHING | **PHISHING** | 100.00% | ✅ |
| 30 | `http://bank-of-america-update.cf/verify@user` | PHISHING | **PHISHING** | 100.00% | ✅ |
| 31 | `http://login-apple-id-suspended.top/` | PHISHING | **PHISHING** | 100.00% | ✅ |
| 32 | `http://microsoft-security-alert.gq/download.exe` | PHISHING | **PHISHING** | 100.00% | ✅ |
| 33 | `http://paypal.com.phishing-test.tk/login` | PHISHING | **PHISHING** | 100.00% | ✅ |
| 34 | `http://netflix-billing-update.info/login` | PHISHING | **PHISHING** | 100.00% | ✅ |
| 35 | `http://wellsfargo-urgent-alert.net/auth` | PHISHING | **PHISHING** | 100.00% | ✅ |
| 36 | `http://chase-security-check.com/verify` | PHISHING | **PHISHING** | 100.00% | ✅ |
| 37 | `http://instagram-verified-badge.tk/login` | PHISHING | **PHISHING** | 100.00% | ✅ |
| 38 | `https://google-docs-share.com.login.xyz/document` | PHISHING | **PHISHING** | 51.00% | ✅ |
| 39 | `http://bit.ly/3xyz789` | PHISHING | **PHISHING** | 65.50% | ✅ |
| 40 | `http://update-your-browser.org/install.php` | PHISHING | **PHISHING** | 99.00% | ✅ |
| 41 | `http://steam-free-games.net/promo` | PHISHING | **PHISHING** | 87.00% | ✅ |
| 42 | `http://secure.chase.com.login-verify.site/` | PHISHING | **PHISHING** | 99.00% | ✅ |
| 43 | `http://104.28.14.89/admin/login.php` | PHISHING | **PHISHING** | 92.00% | ✅ |
| 44 | `http://customer-support-refund.info/claim` | PHISHING | **PHISHING** | 99.00% | ✅ |
| 45 | `http://www.g00gle.com/login` | PHISHING | **PHISHING** | 82.00% | ✅ |
| 46 | `http://fb-security-team.com/verify-account` | PHISHING | **PHISHING** | 99.00% | ✅ |
| 47 | `http://whatsapp-invite-group.net/join` | PHISHING | **PHISHING** | 92.50% | ✅ |
| 48 | `http://dhl-package-tracking.info/track?id=83749` | PHISHING | **PHISHING** | 98.50% | ✅ |
| 49 | `http://usps-delivery-failed.com/reschedule` | PHISHING | **PHISHING** | 92.00% | ✅ |
| 50 | `http://blockchain-wallet-sync.io/restore` | PHISHING | **PHISHING** | 92.50% | ✅ |

## 📊 Summary
- **Total Tested:** 50
- **Correct Predictions:** 50
- **Overall Accuracy:** 100.00%
