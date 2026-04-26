# SentiGuard Testing Dataset

Here is a curated list of 50 URLs designed to test your SentiGuard URL & QR Scanner. It includes a mix of legitimate URLs (Safe) and simulated/known phishing patterns (Phishing). 

You can copy and paste these into your web dashboard or convert them into QR codes to test the scanner.

## 🟢 Legitimate URLs (Safe)
These URLs belong to well-known companies, government sites, educational institutions, and standard services. They should be classified as `SAFE`.

1. `https://www.google.com/search?q=machine+learning`
2. `https://github.com/PranavDoshi-og/SentiGuard`
3. `https://www.microsoft.com/en-us/windows`
4. `https://en.wikipedia.org/wiki/Cybersecurity`
5. `https://www.apple.com/macbook-pro/`
6. `https://aws.amazon.com/console/`
7. `https://www.nytimes.com/section/technology`
8. `https://stackoverflow.com/questions/ask`
9. `https://www.python.org/downloads/`
10. `https://developer.mozilla.org/en-US/docs/Web/API`
11. `https://www.paypal.com/us/home`
12. `https://www.chase.com/`
13. `https://www.bankofamerica.com/`
14. `https://www.wellsfargo.com/`
15. `https://www.netflix.com/browse`
16. `https://www.spotify.com/us/premium/`
17. `https://mail.google.com/mail/u/0/`
18. `https://outlook.live.com/mail/0/`
19. `https://www.linkedin.com/feed/`
20. `https://twitter.com/explore`
21. `https://www.adobe.com/creativecloud.html`
22. `https://www.salesforce.com/`
23. `https://zoom.us/meetings`
24. `https://slack.com/workspace-signin`
25. `https://www.shopify.com/`

---

## 🔴 Phishing & Malicious Patterns (Unsafe)
These URLs are designed to mimic legitimate services but contain suspicious patterns (e.g., typosquatting, free domains, excessive subdomains, strange TLDs, IP addresses, or suspicious paths). They should be classified as `PHISHING`.

26. `http://192.168.1.1/login/paypal/verify` *(IP address instead of domain)*
27. `http://paypa1-secure.tk/update-account` *(Typosquatting & cheap .tk domain)*
28. `http://secure-login-amazon.ml/signin` *(Hyphenated keywords + free TLD)*
29. `http://free-prize-winner.xyz/claim?id=12345&token=abc` *(Clickbait/Scam pattern)*
30. `http://bank-of-america-update.cf/verify@user` *(Fake update + .cf domain)*
31. `http://login-apple-id-suspended.top/` *(Alarmist keywords)*
32. `http://microsoft-security-alert.gq/download.exe` *(Malware download pattern)*
33. `http://paypal.com.phishing-test.tk/login` *(Deep subdomain hiding the real domain)*
34. `http://netflix-billing-update.info/login` *(Fake billing update)*
35. `http://wellsfargo-urgent-alert.net/auth` *(Urgency keywords)*
36. `http://chase-security-check.com/verify` *(Fake security check)*
37. `http://instagram-verified-badge.tk/login` *(Social engineering)*
38. `https://google-docs-share.com.login.xyz/document` *(Subdomain spoofing)*
39. `http://bit.ly/3xyz789` *(URL Shortener hiding malicious destination)*
40. `http://update-your-browser.org/install.php` *(Fake update prompt)*
41. `http://steam-free-games.net/promo` *(Gaming scam)*
42. `http://secure.chase.com.login-verify.site/` *(Subdomain spoofing)*
43. `http://104.28.14.89/admin/login.php` *(IP-based login)*
44. `http://customer-support-refund.info/claim` *(Refund scam)*
45. `http://www.g00gle.com/login` *(Zero instead of O - Typosquatting)*
46. `http://fb-security-team.com/verify-account` *(Fake security team)*
47. `http://whatsapp-invite-group.net/join` *(Fake social invite)*
48. `http://dhl-package-tracking.info/track?id=83749` *(Fake package tracking)*
49. `http://usps-delivery-failed.com/reschedule` *(Fake delivery failure)*
50. `http://blockchain-wallet-sync.io/restore` *(Crypto scam)*

---

## How to use this list:
1. **URL Scanner Test:** Paste any of these URLs directly into your SentiGuard dashboard.
2. **QR Code Test:** Use a free online QR code generator (like `qr-code-generator.com`), paste one of these URLs to generate a QR code, and scan it with your app/dashboard camera!
